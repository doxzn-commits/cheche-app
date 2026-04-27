import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { isDinnerqueenCampaignUrl, parseDinnerqueenCampaign } from '@/lib/parsers/dinnerqueen';
import type { ParseResult } from '@/types/parsed-campaign';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ErrorCode =
  | 'INVALID_URL'
  | 'FETCH_FAILED'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'PARSE_FAILED'
  | 'TIER_2_REQUIRED'
  | 'UNSUPPORTED_PLATFORM';

type Tier2Platform = 'revu' | 'reviewnote' | 'mrblog';

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INVALID_URL: '공개 캠페인만 등록 가능해요! URL을 다시 확인해주세요!',
  FETCH_FAILED: '불러오는데에 실패했어요. URL을 다시 확인해주세요!',
  TIMEOUT: '응답이 너무 느려요. 잠시 후 다시 시도해주세요!',
  RATE_LIMIT: '너무 빠르게 요청했어요. 1초 후 다시 시도해주세요!',
  PARSE_FAILED: '캠페인 정보를 읽을 수 없어요. 다른 URL을 시도해주세요!',
  TIER_2_REQUIRED: '이 사이트는 로그인이 필요해요. 직접 입력해주세요!',
  UNSUPPORTED_PLATFORM: '아직 지원하지 않는 사이트예요. 직접 입력해주세요!',
};

const RATE_LIMIT_WINDOW_MS = 1_000;
const CACHE_TTL_MS = 5 * 60 * 1_000;
const FETCH_TIMEOUT_MS = 8_000;

const lastRequestAt = new Map<string, number>();
const cache = new Map<string, { result: ParseResult; expiresAt: number }>();

// 비공개 플랫폼 (로그인 필요 → 서버 fetch 불가) 도메인 매핑
// TODO: 리뷰노트 정확한 도메인 확인 필요
const TIER_2_DOMAIN_TO_PLATFORM: Record<string, Tier2Platform> = {
  'revu.net': 'revu',
  'www.revu.net': 'revu',
  'reviewnote.co.kr': 'reviewnote',
  'www.reviewnote.co.kr': 'reviewnote',
  'mrblog.net': 'mrblog',
  'www.mrblog.net': 'mrblog',
};

// 공개 플랫폼(서버에서 HTML fetch 가능) → 파서 매핑
// TODO: Phase 1.5 — 강남맛집/서울오빠/리뷰플레이스 정확한 도메인 검증 후 파서 추가
const PUBLIC_PARSERS: Record<
  string,
  { parse: (html: string) => ParseResult; validate: (url: string) => boolean }
> = {
  'dinnerqueen.net': { parse: parseDinnerqueenCampaign, validate: isDinnerqueenCampaignUrl },
  'www.dinnerqueen.net': { parse: parseDinnerqueenCampaign, validate: isDinnerqueenCampaignUrl },
};

function errorResponse(code: ErrorCode, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { ok: false, code, message: ERROR_MESSAGES[code], ...extra },
    { status }
  );
}

function getClientKey(req: NextRequest, userId: string | null): string {
  if (userId) return `u:${userId}`;
  const fwd = req.headers.get('x-forwarded-for');
  const ip = fwd ? fwd.split(',')[0].trim() : req.headers.get('x-real-ip');
  return `ip:${ip || 'unknown'}`;
}

function pruneCache(now: number) {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}

function getHostname(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const clientKey = getClientKey(req, userId);

  const now = Date.now();
  const last = lastRequestAt.get(clientKey);
  if (last && now - last < RATE_LIMIT_WINDOW_MS) {
    return errorResponse('RATE_LIMIT', 429);
  }
  lastRequestAt.set(clientKey, now);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorResponse('INVALID_URL', 400);
  }

  const url = typeof body.url === 'string' ? body.url.trim() : '';
  if (!url) {
    return errorResponse('INVALID_URL', 400);
  }

  const hostname = getHostname(url);
  if (!hostname) {
    return errorResponse('INVALID_URL', 400);
  }

  // 비공개 플랫폼: 서버 fetch 불가 → 사용자 수기 입력 안내
  const tier2Platform = TIER_2_DOMAIN_TO_PLATFORM[hostname];
  if (tier2Platform) {
    return errorResponse('TIER_2_REQUIRED', 400, { platform: tier2Platform });
  }

  // 공개 플랫폼: 도메인별 파서 라우팅
  const parser = PUBLIC_PARSERS[hostname];
  if (!parser) {
    return errorResponse('UNSUPPORTED_PLATFORM', 400);
  }

  if (!parser.validate(url)) {
    return errorResponse('INVALID_URL', 400);
  }

  pruneCache(now);
  const cached = cache.get(url);
  if (cached && cached.expiresAt > now) {
    return NextResponse.json({ ok: true, ...cached.result });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'ChecheApp/1.0',
        'Accept-Encoding': 'gzip, deflate',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (res.status !== 200) {
      return errorResponse('FETCH_FAILED', 502);
    }

    html = await res.text();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return errorResponse('TIMEOUT', 504);
    }
    return errorResponse('FETCH_FAILED', 502);
  } finally {
    clearTimeout(timeoutId);
  }

  let result: ParseResult;
  try {
    result = parser.parse(html);
  } catch {
    return errorResponse('PARSE_FAILED', 422);
  }

  if (result.extractedFields.length <= 1) {
    return errorResponse('PARSE_FAILED', 422);
  }

  cache.set(url, { result, expiresAt: now + CACHE_TTL_MS });

  return NextResponse.json({ ok: true, ...result });
}
