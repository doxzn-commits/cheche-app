import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';

import type { ParsedCampaign, ParseResult } from '../../types/parsed-campaign.js';

type ChannelValue = NonNullable<ParsedCampaign['channels']>[number];

const PARSED_CAMPAIGN_FIELDS: (keyof ParsedCampaign)[] = [
  'title',
  'platform',
  'reviewDeadline',
  'benefit',
  'channels',
  'guideline',
  'location',
  'campaignType',
  'pointAmount',
];

function normalizeText(value?: string | null): string {
  return (value ?? '').replace(/\u200b/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value
      .replace(/\u200b/g, '')
      .replace(/\r/g, '')
      .split('\n')
      .map((line) => normalizeText(line))
      .filter(Boolean)
      .join('\n');
    const key = normalizeText(normalized);
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
}

function extractTextWithBreaks(element: cheerio.Cheerio<AnyNode>): string {
  const html = element.html() ?? '';

  return html
    .replace(/<br\s*\/?>/giu, '\n')
    .replace(/<\/p>/giu, '\n')
    .replace(/<\/li>/giu, '\n')
    .replace(/<[^>]*>/gu, '')
    .replace(/&nbsp;/gu, ' ')
    .replace(/&gt;/gu, '>')
    .replace(/&lt;/gu, '<')
    .replace(/&amp;/gu, '&')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => normalizeText(line))
    .filter(Boolean)
    .join('\n');
}

function getSectionByTitle(
  $: cheerio.CheerioAPI,
  title: string
): cheerio.Cheerio<AnyNode> {
  return $('.tab_01 li dl').filter((_, element) => {
    return normalizeText($(element).find('dt').first().text()) === title;
  }).first();
}

function extractTitle($: cheerio.CheerioAPI): string | undefined {
  return normalizeText($('.textArea .tit').first().text()) || undefined;
}

function extractBenefit($: cheerio.CheerioAPI): string | undefined {
  return normalizeText($('.textArea .sub_tit').first().text()) || undefined;
}

function extractCampaignYear($: cheerio.CheerioAPI, html: string): number {
  const imagePath =
    $('.cmp_info img').first().attr('src') ??
    $('.detail_img img').first().attr('src') ??
    '';
  const imageYear = imagePath.match(/\/cmp\/(\d{4})\//u)?.[1];
  if (imageYear) return Number(imageYear);

  const applicantYear = html.match(/\b(20\d{2})-\d{2}-\d{2}\b/u)?.[1];
  if (applicantYear) return Number(applicantYear);

  return new Date().getFullYear();
}

function extractMonthDayRangeEnd(value: string, fallbackYear: number): string | undefined {
  const match = value.match(/(\d{1,2})\.(\d{1,2})\s*~\s*(\d{1,2})\.(\d{1,2})/u);
  if (!match) return undefined;

  const [, rawStartMonth, , rawEndMonth, rawEndDay] = match;
  const startMonth = Number(rawStartMonth);
  const endMonth = Number(rawEndMonth);
  const year = endMonth < startMonth ? fallbackYear + 1 : fallbackYear;

  return `${year}-${String(endMonth).padStart(2, '0')}-${rawEndDay.padStart(2, '0')}`;
}

function extractReviewDeadline(
  $: cheerio.CheerioAPI,
  html: string
): string | undefined {
  const year = extractCampaignYear($, html);
  const reviewPeriod = $('.cmp_info li')
    .filter((_, element) => normalizeText($(element).find('dt').text()) === '리뷰 등록기간')
    .first()
    .find('dd')
    .text();

  return extractMonthDayRangeEnd(reviewPeriod, year);
}

function extractChannels($: cheerio.CheerioAPI): ChannelValue[] | undefined {
  const categoryText = normalizeText($('.textArea .category').text()).toLowerCase();
  const classNames = $('.textArea .category em')
    .map((_, element) => $(element).attr('class') ?? '')
    .get()
    .join(' ')
    .toLowerCase();
  const source = `${categoryText} ${classNames}`;
  const channels: ChannelValue[] = [];

  if (source.includes('blog') || source.includes('블로그')) channels.push('blog');
  if (source.includes('insta') || source.includes('인스타')) channels.push('instagram');
  if (source.includes('youtube') || source.includes('유튜브')) channels.push('youtube');
  if (source.includes('clip') || source.includes('클립')) channels.push('clip');

  return channels.length ? Array.from(new Set(channels)) : undefined;
}

function extractCampaignType($: cheerio.CheerioAPI): ParsedCampaign['campaignType'] {
  const text = normalizeText($('.textArea .category').text());

  if (text.includes('방문')) return 'visit';
  if (text.includes('배송') || text.includes('제품')) return 'delivery';
  if (text.includes('기자단') || text.includes('포인트') || text.includes('원고')) return 'reward';

  return undefined;
}

function extractGuideline($: cheerio.CheerioAPI): string | undefined {
  const blocks: string[] = [];

  const keywordSection = getSectionByTitle($, '키워드');
  if (keywordSection.length) {
    const keywords = keywordSection
      .find('#key_result span')
      .map((_, element) => normalizeText($(element).text()))
      .get()
      .filter(Boolean);
    const note = normalizeText(keywordSection.find('.info_s').first().text());
    blocks.push(['키워드', keywords.join(', '), note].filter(Boolean).join('\n'));
  }

  const guideSection = getSectionByTitle($, '가이드라인');
  if (guideSection.length) {
    blocks.push(extractTextWithBreaks(guideSection.find('dd').first()));
  }

  const cautionSection = getSectionByTitle($, '리뷰 시 주의사항');
  if (cautionSection.length) {
    blocks.push(['리뷰 시 주의사항', extractTextWithBreaks(cautionSection.find('dd').first())].join('\n'));
  }

  return dedupeStrings(blocks).join('\n') || undefined;
}

function extractLocation($: cheerio.CheerioAPI): string | undefined {
  const visitSection = getSectionByTitle($, '방문 및 예약');
  if (!visitSection.length) return undefined;

  const address = normalizeText(visitSection.find('#cont_map').next('div').first().text());
  if (address) return address;

  const text = extractTextWithBreaks(visitSection.find('dd').first());
  const lines = text.split('\n').map((line) => normalizeText(line)).filter(Boolean);

  return lines.find((line) => /(?:서울|경기|인천|부산|대구|광주|대전|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주)\s/u.test(line));
}

function extractFieldLists(
  data: ParsedCampaign
): Pick<ParseResult, 'extractedFields' | 'missingFields' | 'isPartial'> {
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
    if (value.length > 0) data[field] = value;
    return;
  }

  if (value !== undefined && value !== '') {
    data[field] = value;
  }
}

/**
 * Parse a Gangnam Matjip campaign page HTML string.
 */
export function parseGangnamCampaign(html: string): ParseResult {
  const $ = cheerio.load(html);
  const data: ParsedCampaign = {
    platform: 'gangnam',
  };

  try {
    assignIfPresent(data, 'title', extractTitle($));
  } catch {}

  try {
    assignIfPresent(data, 'reviewDeadline', extractReviewDeadline($, html));
  } catch {}

  try {
    assignIfPresent(data, 'benefit', extractBenefit($));
  } catch {}

  try {
    assignIfPresent(data, 'channels', extractChannels($));
  } catch {}

  try {
    assignIfPresent(data, 'guideline', extractGuideline($));
  } catch {}

  try {
    assignIfPresent(data, 'location', extractLocation($));
  } catch {}

  try {
    assignIfPresent(data, 'campaignType', extractCampaignType($));
  } catch {}

  return {
    data,
    ...extractFieldLists(data),
  };
}

/**
 * Check whether a URL matches a Gangnam Matjip campaign detail page.
 */
export function isGangnamCampaignUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.toLowerCase();
    const isGangnamHost =
      hostname === 'xn--939au0g4vj8sq.net' ||
      hostname === 'www.xn--939au0g4vj8sq.net' ||
      hostname === '강남맛집.net' ||
      hostname === 'www.강남맛집.net';

    return (
      parsed.protocol === 'https:' &&
      isGangnamHost &&
      parsed.pathname.replace(/\/+$/u, '') === '/cp' &&
      /^\d+$/u.test(parsed.searchParams.get('id') ?? '')
    );
  } catch {
    return false;
  }
}
