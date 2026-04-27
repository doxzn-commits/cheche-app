/**
 * Campaign page parsing result.
 * All fields stay optional so partial extraction can still succeed.
 */
export interface ParsedCampaign {
  /** F-01 campaign title */
  title?: string;
  /** F-02 source platform */
  platform: 'revu' | 'dinnerqueen';
  /** F-03 review deadline (ISO date string YYYY-MM-DD) */
  reviewDeadline?: string;
  /** F-04 sponsored item / reward */
  benefit?: string;
  /** F-06 channels - blog/instagram/youtube/clip */
  channels?: ('blog' | 'instagram' | 'youtube' | 'clip')[];
  /** F-07 campaign guideline body */
  guideline?: string;
  /** Store address or visit location */
  location?: string;
  /** Campaign type */
  campaignType?: 'visit' | 'delivery' | 'payback' | 'reporter';
  /** Point amount for payback/reporter campaigns */
  pointAmount?: number;
}

/**
 * Parser metadata.
 */
export interface ParseResult {
  data: ParsedCampaign;
  /** Fields extracted successfully */
  extractedFields: (keyof ParsedCampaign)[];
  /** Fields that could not be extracted */
  missingFields: (keyof ParsedCampaign)[];
  /** Whether extraction partially succeeded */
  isPartial: boolean;
}
