import * as cheerio from 'cheerio';

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
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }

  return result;
}

function cleanTitle(value?: string | null): string | undefined {
  const normalized = normalizeText(value);
  if (!normalized) return undefined;

  const withoutSuffix = normalized.replace(/\s+\|\s+.+$/u, '').trim();
  const dashIndex = withoutSuffix.indexOf(' - ');

  return dashIndex >= 0 ? withoutSuffix.slice(dashIndex + 3).trim() : withoutSuffix;
}

function parseLooseDate(value: string): string | undefined {
  const match = value.match(/(\d{2,4})[./-]\s*(\d{1,2})[./-]\s*(\d{1,2})/u);
  if (!match) return undefined;

  const [, rawYear, rawMonth, rawDay] = match;
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
  const month = rawMonth.padStart(2, '0');
  const day = rawDay.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function extractLastDate(value: string): string | undefined {
  const matches = [...value.matchAll(/(\d{2,4})[./-]\s*(\d{1,2})[./-]\s*(\d{1,2})/gu)];
  const lastMatch = matches.at(-1);
  if (!lastMatch) return undefined;

  return parseLooseDate(lastMatch[0]);
}

function subtractOneDay(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function getMetaContent($: cheerio.CheerioAPI, property: string): string {
  return normalizeText(
    $(`meta[property="${property}"]`).attr('content') ??
      $(`meta[name="${property}"]`).attr('content')
  );
}

function getCollapseSectionByHeader(
  $: cheerio.CheerioAPI,
  headerText: string
): cheerio.Cheerio<any> {
  return $('.qz-collapse.qz-row').filter((_, element) => {
    const header = normalizeText(
      $(element)
        .find('h5 strong.qz-h6-kr, h5 strong.qz-h6-kr--line')
        .first()
        .text()
    );

    return header === headerText;
  });
}

function extractTextWithBreaks(
  $: cheerio.CheerioAPI,
  element: any
): string {
  const parts: string[] = [];

  const visit = (node: any): void => {
    if (node.type === 'text') {
      parts.push(node.data ?? '');
      return;
    }

    if (node.type !== 'tag') {
      return;
    }

    if (node.tagName === 'br') {
      parts.push('\n');
      return;
    }

    const blockTags = new Set([
      'p',
      'li',
      'ul',
      'ol',
      'div',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ]);

    if (blockTags.has(node.tagName)) {
      parts.push('\n');
    }

    for (const child of node.children ?? []) {
      visit(child);
    }

    if (blockTags.has(node.tagName)) {
      parts.push('\n');
    }
  };

  visit(element);

  return parts
    .join('')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => normalizeText(line))
    .filter(Boolean)
    .join('\n');
}

function extractTitle($: cheerio.CheerioAPI): string | undefined {
  return (
    cleanTitle(getMetaContent($, 'og:title')) ||
    cleanTitle($('title').first().text()) ||
    cleanTitle($('h4 strong').first().text())
  );
}

function extractReviewDeadline($: cheerio.CheerioAPI, html: string): string | undefined {
  const scheduleRow = $('.qz-row.mb-dis-none')
    .filter((_, element) => $(element).find('.qz-col.pc9 p').length >= 3)
    .first();

  if (scheduleRow.length) {
    const reviewPeriod = normalizeText(
      scheduleRow.find('.qz-col.pc9 p').eq(2).text()
    );
    const parsed = extractLastDate(reviewPeriod);
    if (parsed) return parsed;
  }

  const endDates = [...html.matchAll(/end:\s*['"](\d{4}-\d{2}-\d{2})['"]/gu)].map(
    (match) => match[1]
  );
  const lastEndDate = endDates.sort().at(-1);

  return lastEndDate ? subtractOneDay(lastEndDate) : undefined;
}

function extractBenefit($: cheerio.CheerioAPI): string | undefined {
  const section = getCollapseSectionByHeader($, '제공 내역').first();
  const content = section.find('.qz-collapse__content').first();
  const title = normalizeText(content.find('strong.w-600').first().text());
  const extra = normalizeText(
    content
      .find('.qz-wrap.qz-container.layer-primary-dq-o p.qz-body-kr.mb-qz-body2-kr.color-title')
      .first()
      .text()
  );

  return [title, extra].filter(Boolean).join(' / ') || undefined;
}

function extractChannels($: cheerio.CheerioAPI, titleText: string): ChannelValue[] | undefined {
  const text = normalizeText(titleText).toLowerCase();
  const channels: ChannelValue[] = [];

  if ($('#MainKeyword').length) {
    channels.push('blog');
  }
  if ($('#SubKeyword').length || text.includes('instagram') || text.includes('reels')) {
    channels.push('instagram');
  }
  if (text.includes('youtube')) {
    channels.push('youtube');
  }
  if (text.includes('clip')) {
    channels.push('clip');
  }

  return channels.length ? Array.from(new Set(channels)) : undefined;
}

function extractGuideline($: cheerio.CheerioAPI): string | undefined {
  const section = getCollapseSectionByHeader($, '리뷰어 미션').first();
  const content = section.find('.qz-collapse__content').first();
  if (!content.length) return undefined;

  const blocks: string[] = [];

  content.find('.layer-red').first().find('p, li').each((_, element) => {
    const text = extractTextWithBreaks($, element);
    if (text) blocks.push(text);
  });

  content.children('p.qz-body-kr').each((_, element) => {
    const text = extractTextWithBreaks($, element);
    if (text) blocks.push(text);
  });

  content.find('.layer-tertiary').first().find('li').each((_, element) => {
    const text = extractTextWithBreaks($, element);
    if (text) blocks.push(text);
  });

  return dedupeStrings(blocks).join('\n') || undefined;
}

function extractLocation($: cheerio.CheerioAPI): string | undefined {
  const mapAddress = normalizeText($('#map-canvas').prevAll('p').first().text());
  if (!mapAddress) return undefined;

  const colonIndex = mapAddress.indexOf(':');
  return colonIndex >= 0 ? mapAddress.slice(colonIndex + 1).trim() : mapAddress;
}

function extractPointAmount($: cheerio.CheerioAPI): number | undefined {
  const candidates = [
    normalizeText($('#DetailPointBadge').text()),
    normalizeText(
      $('.qz-collapse')
        .filter(
          (_, element) =>
            $(element).find('.qz_b_coin, .reward_currency, #DetailPointBadge').length > 0
        )
        .first()
        .text()
    ),
  ];

  for (const candidate of candidates) {
    const match = candidate.match(/([+]?\d[\d,]*)/u);
    if (!match) continue;

    const amount = Number(match[1].replace(/[+,]/gu, ''));
    if (Number.isFinite(amount) && amount > 0) {
      return amount;
    }
  }

  return undefined;
}

function extractCampaignType(
  $: cheerio.CheerioAPI,
  location: string | undefined,
  pointAmount: number | undefined,
  documentText: string
): ParsedCampaign['campaignType'] {
  const text = normalizeText(documentText).toLowerCase();
  const hasProductLink =
    $('#detailProductLink').length > 0 || text.includes('smartstore.naver.com');
  const hasPlaceLink = $('#detailPlaceLink').length > 0 || $('#map-canvas').length > 0;
  const hasStructuredContent =
    $('.qz-row.mb-dis-none').length > 0 ||
    $('.qz-collapse__content strong.w-600').length > 0 ||
    $('#MainKeyword').length > 0 ||
    $('#SubKeyword').length > 0;

  if (pointAmount !== undefined && hasProductLink) return 'payback';
  if (pointAmount !== undefined) return 'reporter';
  if (location || hasPlaceLink) return 'visit';
  if (hasProductLink || hasStructuredContent) return 'delivery';

  return undefined;
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
 * Parse a dinnerqueen campaign page HTML string.
 */
export function parseDinnerqueenCampaign(html: string): ParseResult {
  const $ = cheerio.load(html);
  const data: ParsedCampaign = {
    platform: 'dinnerqueen',
  };
  const titleText = normalizeText(
    [getMetaContent($, 'og:title'), $('title').first().text()].join(' ')
  );
  const documentText = normalizeText(
    [titleText, getMetaContent($, 'og:description'), $('body').text()].join(' ')
  );

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
    assignIfPresent(data, 'channels', extractChannels($, titleText));
  } catch {}

  try {
    assignIfPresent(data, 'guideline', extractGuideline($));
  } catch {}

  try {
    assignIfPresent(data, 'location', extractLocation($));
  } catch {}

  let pointAmount: number | undefined;
  try {
    pointAmount = extractPointAmount($);
    assignIfPresent(data, 'pointAmount', pointAmount);
  } catch {}

  try {
    assignIfPresent(
      data,
      'campaignType',
      extractCampaignType($, data.location, pointAmount, documentText)
    );
  } catch {}

  return {
    data,
    ...extractFieldLists(data),
  };
}

/**
 * Check whether a URL matches a dinnerqueen campaign detail page.
 */
export function isDinnerqueenCampaignUrl(url: string): boolean {
  return /^https:\/\/(?:www\.)?dinnerqueen\.net\/taste\/\d+\/?$/u.test(url.trim());
}
