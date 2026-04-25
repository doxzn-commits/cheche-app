/**
 * 레뷰 캠페인 페이지 파싱 결과
 * 모든 필드 optional — 부분 성공 케이스 지원
 */
export interface ParsedCampaign {
  /** F-01 체험명 */
  title?: string;
  /** F-02 플랫폼 — revu 고정 */
  platform: 'revu';
  /** F-03 리뷰 마감일 (ISO date string YYYY-MM-DD) */
  reviewDeadline?: string;
  /** F-04 협찬 품목 */
  benefit?: string;
  /** F-06 채널 — 블로그/인스타/유튜브/클립 (복수 가능) */
  channels?: ('blog' | 'instagram' | 'youtube' | 'clip')[];
  /** F-07 가이드라인 (해시태그·필수 문구 포함 원문) */
  guideline?: string;
  /** 위치 (방문형일 경우) — 도로명 주소 또는 지명 */
  location?: string;
  /** 방문형/배송형 구분 */
  campaignType?: 'visit' | 'delivery';
}

/**
 * 파싱 메타 정보
 */
export interface ParseResult {
  data: ParsedCampaign;
  /** 어느 필드를 성공적으로 추출했는지 */
  extractedFields: (keyof ParsedCampaign)[];
  /** 어느 필드 추출에 실패했는지 */
  missingFields: (keyof ParsedCampaign)[];
  /** 부분 성공 여부 */
  isPartial: boolean;
}
