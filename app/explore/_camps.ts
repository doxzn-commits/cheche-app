// 체험단 공고 데이터 (SCR-004/006 공용)
// 원본: ref/체체_앱_최종.html CAMPS 배열

export interface Camp {
  id: string;
  plat: string;
  cat: string;
  name: string;
  area: string;
  media: string[];
  type: '방문형' | '배송형' | '기자단';
  total: number;
  applied: number;
  date: string;       // 마감일 표시 (4/9 형식)
  dday: string;
  ddayCls: string;    // D-day 색상 CSS 변수
  open: boolean;
  emoji: string;
  // SCR-006 상세용
  channel: string;
  period: string;
  reviewDeadline: string;
  benefits: string;
  url: string;
}

export const CAMPS: Camp[] = [
  {
    id: '1',
    plat: '레뷰', cat: '카페',
    name: '카페투어 강남점 신메뉴 체험단 · 블로그+인스타',
    area: '서울 강남구',
    media: ['블로그', '인스타'],
    type: '방문형', total: 10, applied: 9,
    date: '4/9', dday: 'D-3', ddayCls: 'var(--s-overdue)', open: true, emoji: '☕',
    channel: '블로그, 인스타그램', period: '3/25 ~ 4/6', reviewDeadline: '4/9 · D-3',
    benefits: '음료 2잔 + 디저트 1개 무료 제공\n영수증 처리 (본인 결제 없음)\n포스팅 후 소정의 추가 혜택',
    url: 'https://www.revu.net/',
  },
  {
    id: '2',
    plat: '강남맛집', cat: '맛집',
    name: '홍대 이자카야 신메뉴 체험 · 블로거 모집',
    area: '서울 마포구',
    media: ['블로그'],
    type: '방문형', total: 5, applied: 3,
    date: '4/12', dday: 'D-6', ddayCls: 'var(--s-deadline)', open: true, emoji: '🍶',
    channel: '블로그', period: '3/28 ~ 4/10', reviewDeadline: '4/12 · D-6',
    benefits: '코스 요리 2인 무료 제공 (7만원 상당)\n주류 1병 포함\n단독 포스팅 필수',
    url: 'https://www.gangnam.com/',
  },
  {
    id: '3',
    plat: '레뷰', cat: '뷰티',
    name: '봄 신상 파우더 체험단 · 인스타 전용',
    area: '전국',
    media: ['인스타'],
    type: '배송형', total: 20, applied: 7,
    date: '4/14', dday: 'D-8', ddayCls: 'var(--s-deadline)', open: true, emoji: '💄',
    channel: '인스타그램', period: '4/1 ~ 4/12', reviewDeadline: '4/14 · D-8',
    benefits: '봄 신상 파우더 풀세트 무료 배송\n소매가 38,000원 상당\n#레뷰뷰티 해시태그 필수',
    url: 'https://www.revu.net/',
  },
  {
    id: '4',
    plat: '미블', cat: '숙박',
    name: '한강뷰 프리미엄 호텔 숙박 체험단',
    area: '서울 영등포',
    media: ['유튜브'],
    type: '방문형', total: 3, applied: 3,
    date: '4/18', dday: 'D-12', ddayCls: 'var(--text-muted)', open: true, emoji: '🏨',
    channel: '유튜브', period: '4/3 ~ 4/16', reviewDeadline: '4/18 · D-12',
    benefits: '디럭스 룸 1박 2일 (2인 기준)\n조식 포함\n객실 내 어메니티 세트 증정',
    url: 'https://www.mblug.com/',
  },
  {
    id: '5',
    plat: '서울오빠', cat: '패션',
    name: '여름 신상 원피스 스타일링 체험 모집',
    area: '전국',
    media: ['인스타', '릴스'],
    type: '배송형', total: 15, applied: 12,
    date: '4/20', dday: 'D-14', ddayCls: 'var(--text-muted)', open: true, emoji: '👗',
    channel: '인스타그램, 인스타 릴스', period: '4/5 ~ 4/18', reviewDeadline: '4/20 · D-14',
    benefits: '여름 신상 원피스 1벌 무료 배송 (정가 59,000원)\n사이즈 선택 가능\n리뷰 게시 후 다음 시즌 추가 혜택',
    url: 'https://www.seoulouba.co.kr/',
  },
  {
    id: '6',
    plat: '티블', cat: '맛집',
    name: '경리단길 타코 맛집 블로그 클립 체험',
    area: '서울 용산구',
    media: ['블로그클립'],
    type: '방문형', total: 4, applied: 1,
    date: '4/15', dday: 'D-9', ddayCls: 'var(--s-deadline)', open: true, emoji: '🌮',
    channel: '블로그 클립', period: '4/2 ~ 4/13', reviewDeadline: '4/15 · D-9',
    benefits: '타코 세트 2인분 + 음료 무료 제공\n영수증 처리\n클립 영상 1분 이상',
    url: 'https://www.tble.kr/',
  },
  {
    id: '7',
    plat: '미블', cat: '카페',
    name: '성수 브런치 카페 신메뉴 체험단',
    area: '서울 성동구',
    media: ['인스타'],
    type: '방문형', total: 8, applied: 6,
    date: '4/22', dday: 'D-16', ddayCls: 'var(--text-muted)', open: true, emoji: '🥞',
    channel: '인스타그램', period: '4/7 ~ 4/20', reviewDeadline: '4/22 · D-16',
    benefits: '브런치 세트 2인 무료 제공 (4만원 상당)\n시그니처 음료 2잔 포함\n감성 포토존 이용 가능',
    url: 'https://www.mblug.com/',
  },
];
