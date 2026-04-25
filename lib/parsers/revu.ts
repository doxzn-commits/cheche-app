import * as cheerio from 'cheerio';

import type { ParsedCampaign, ParseResult } from '@/types/parsed-campaign';

type Channel = ParsedCampaign['channels'];
type ChannelValue = NonNullable<Channel>[number];

const PARSED_CAMPAIGN_FIELDS: (keyof ParsedCampaign)[] = [
  'title',
  'platform',
  'reviewDeadline',
  'benefit',
  'channels',
  'guideline',
  'location',
  'campaignType',
];

function normalizeText(value?: string | null): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function getMetaContent($: cheerio.CheerioAPI, property: string): string {
  return normalizeText($(`meta[property="${property}"]`).attr('content'));
}

function getTextCandidates($: cheerio.CheerioAPI, selectors: string[]): string {
  for (const selector of selectors) {
    const text = normalizeText($(selector).first().text());
    if (text) return text;
  }

  return '';
}

function getDocumentText($: cheerio.CheerioAPI): string {
  return normalizeText($('body').text());
}

function extractDate(value: string): string | undefined {
  const match = value.match(/\b(\d{4})[.-](\d{2})[.-](\d{2})\b/);
  if (!match) return undefined;

  const [, year, month, day] = match;
  return `${year}-${month}-${day}`;
}

function extractChannels(value: string): Channel {
  const text = normalizeText(value).toLowerCase();
  const channels: ChannelValue[] = [];

  if (text.includes('블로그') || text.includes('blog')) {
    channels.push('blog');
  }
  if (text.includes('인스타') || text.includes('instagram')) {
    channels.push('instagram');
  }
  if (text.includes('유튜브') || text.includes('youtube')) {
    channels.push('youtube');
  }
  if (text.includes('클립') || text.includes('clip')) {
    channels.push('clip');
  }

  return channels.length ? channels : undefined;
}

function extractCampaignType(value: string): ParsedCampaign['campaignType'] {
  const text = normalizeText(value);
  if (text.includes('방문')) return 'visit';
  if (text.includes('배송')) return 'delivery';
  return undefined;
}

function extractLocation(value: string): string | undefined {
  const text = normalizeText(value);
  if (!text) return undefined;

  const roadAddressMatch = text.match(
    /((?:[가-힣A-Za-z0-9]+(?:시|도)?\s+)?[가-힣A-Za-z0-9]+(?:시|군|구)\s+[가-힣A-Za-z0-9]+(?:로|길)\s*\d*)/
  );
  if (roadAddressMatch) return normalizeText(roadAddressMatch[1]);

  const placeMatch = text.match(
    /(?:위치|주소|장소)\s*[:：]?\s*([가-힣A-Za-z0-9\s]+(?:로|길|동|읍|면|리|역|점|몰))/
  );
  if (placeMatch) return normalizeText(placeMatch[1]);

  return undefined;
}

function extractBenefit($: cheerio.CheerioAPI, documentText: string): string | undefined {
  const metaDescription = getMetaContent($, 'og:description');
  const combinedText = normalizeText([metaDescription, documentText].filter(Boolean).join(' '));
  const structuredMatch = combinedText.match(
    /(?:협찬\s*품목|제공\s*내역|제공\s*상품)\s*[:：]?\s*([^|]+?)(?=(?:리뷰\s*마감|가이드|채널|주소|위치|방문|배송|$))/
  );
  if (structuredMatch) return normalizeText(structuredMatch[1]);

  const candidate = getTextCandidates($, [
    '.benefit',
    '.reward',
    '.campaign-benefit',
    '.goods',
  ]);
  const normalized = normalizeText(candidate);
  if (normalized) return normalized;

  return undefined;
}

function extractGuideline($: cheerio.CheerioAPI, documentText: string): string | undefined {
  const candidate = getTextCandidates($, [
    '.guide',
    '.guideline',
    '.campaign-guide',
    '.hash-tag',
    '.campaign-notice',
  ]);
  if (candidate) return candidate;

  const docMatch = documentText.match(/(?:가이드라인|필수\s*문구|해시태그)\s*[:：]?\s*([^|]+?)(?=(?:협찬|리뷰\s*마감|채널|주소|위치|방문|배송|$))/);
  return docMatch ? normalizeText(docMatch[1]) : undefined;
}

function extractReviewDeadline($: cheerio.CheerioAPI, documentText: string): string | undefined {
  const metaDescription = getMetaContent($, 'og:description');
  return (
    extractDate(metaDescription) ||
    extractDate(getTextCandidates($, ['.deadline', '.review-deadline', '.date', '.campaign-date'])) ||
    extractDate(documentText)
  );
}

function extractTitle($: cheerio.CheerioAPI): string | undefined {
  return (
    getMetaContent($, 'og:title') ||
    getTextCandidates($, ['h1', '.title', '.campaign-title', 'title']) ||
    undefined
  );
}

function extractFieldLists(data: ParsedCampaign): Pick<ParseResult, 'extractedFields' | 'missingFields' | 'isPartial'> {
  const extractedFields = PARSED_CAMPAIGN_FIELDS.filter((field) => {
    const value = data[field];

    if (field === 'platform') return true;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  });

  const missingFields = PARSED_CAMPAIGN_FIELDS.filter(
    (field) => !extractedFields.includes(field)
  );

  return {
    extractedFields,
    missingFields,
    isPartial: missingFields.length > 0 && extractedFields.length > 1,
  };
}

function assignIfPresent<K extends Exclude<keyof ParsedCampaign, 'platform'>>(
  data: ParsedCampaign,
  field: K,
  value: ParsedCampaign[K]
): void {
  if (Array.isArray(value)) {
    if (value.length > 0) {
      data[field] = value;
    }
    return;
  }

  if (value !== undefined && value !== '') {
    data[field] = value;
  }
}

/**
 * 레뷰 캠페인 HTML을 파싱해서 ParsedCampaign으로 변환
 * @param html - revu.net 캠페인 페이지의 HTML 문자열
 * @returns ParseResult — 추출된 데이터 + 메타정보
 */
export function parseRevuCampaign(html: string): ParseResult {
  const $ = cheerio.load(html);
  const data: ParsedCampaign = {
    platform: 'revu',
  };

  const documentText = getDocumentText($);
  const metaDescription = getMetaContent($, 'og:description');
  const combinedText = normalizeText([metaDescription, documentText].filter(Boolean).join(' '));

  try {
    assignIfPresent(data, 'title', extractTitle($));
  } catch {
    // 부분 실패를 허용하고 다른 필드 추출을 계속한다.
  }

  try {
    assignIfPresent(data, 'reviewDeadline', extractReviewDeadline($, combinedText));
  } catch {
    // 부분 실패를 허용하고 다른 필드 추출을 계속한다.
  }

  try {
    assignIfPresent(data, 'benefit', extractBenefit($, combinedText));
  } catch {
    // 부분 실패를 허용하고 다른 필드 추출을 계속한다.
  }

  try {
    assignIfPresent(data, 'channels', extractChannels(combinedText));
  } catch {
    // 부분 실패를 허용하고 다른 필드 추출을 계속한다.
  }

  try {
    assignIfPresent(data, 'guideline', extractGuideline($, combinedText));
  } catch {
    // 부분 실패를 허용하고 다른 필드 추출을 계속한다.
  }

  try {
    assignIfPresent(data, 'location', extractLocation(combinedText));
  } catch {
    // 부분 실패를 허용하고 다른 필드 추출을 계속한다.
  }

  try {
    assignIfPresent(data, 'campaignType', extractCampaignType(combinedText));
  } catch {
    // 부분 실패를 허용하고 다른 필드 추출을 계속한다.
  }

  return {
    data,
    ...extractFieldLists(data),
  };
}

/**
 * URL이 레뷰 캠페인 URL인지 검증
 * @param url
 * @returns true if matches https://www.revu.net/campaign/{number}
 */
export function isRevuCampaignUrl(url: string): boolean {
  return /^https:\/\/www\.revu\.net\/campaign\/\d+\/?$/.test(url.trim());
}
