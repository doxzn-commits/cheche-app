import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { isRevuCampaignUrl, parseRevuCampaign } from '@/lib/parsers/revu';
import type { ParseResult } from '@/types/parsed-campaign';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ErrorCode =
  | 'INVALID_URL'
  | 'FETCH_FAILED'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'PARSE_FAILED';

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INVALID_URL: '공개 캠페인만 등록 가능해요! URL을 다시 확인해주세요!',
  FETCH_FAILED: '불러오는데에 실패했어요. URL을 다시 확인해주세요!',
  TIMEOUT: '응답이 너무 느려요. 잠시 후 다시 시도해주세요!',
  RATE_LIMIT: '너무 빠르게 요청했어요. 1초 후 다시 시도해주세요!',
  PARSE_FAILED: '캠페인 정보를 읽을 수 없어요. 다른 URL을 시도해주세요!',
};

const RATE_LIMIT_WINDOW_MS = 1_000;
const CACHE_TTL_MS = 5 * 60 * 1_000;
const FETCH_TIMEOUT_MS = 8_000;

const lastRequestAt = new Map<string, number>();
const cache = new Map<string, { result: ParseResult; expiresAt: number }>();

function errorResponse(code: ErrorCode, status: number) {
  return NextResponse.json(
    { ok: false, code, message: ERROR_MESSAGES[code] },
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
  if (!url || !isRevuCampaignUrl(url)) {
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
    result = parseRevuCampaign(html);
  } catch {
    return errorResponse('PARSE_FAILED', 422);
  }

  if (result.extractedFields.length <= 1) {
    return errorResponse('PARSE_FAILED', 422);
  }

  cache.set(url, { result, expiresAt: now + CACHE_TTL_MS });

  return NextResponse.json({ ok: true, ...result });
}
