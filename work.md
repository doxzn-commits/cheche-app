# 체체 작업 이력

## 2026-04-16
- 작업자: Claude Code
- 변경 파일: 전체 프로젝트 초기 생성
- 변경 내용: Next.js 뼈대 생성, 폴더 구조, 디자인 토큰, CLAUDE.md 전체
- 다음 작업: 각 화면 HTML → JSX 변환 시작 (캘린더 SCR-012 우선)

## 2026-04-16 (2차)
- 작업자: Claude Code
- 변경 파일:
  - app/calendar/page.tsx (신규) — SCR-012 월간·SCR-012A 주간·SCR-012B 상세시트 통합
  - components/layout/BottomNav.tsx (신규) — 하단 탭바 4탭
  - app/layout.tsx (수정) — BottomNav 실제 연결
- 변경 내용:
  - 체체_앱_최종.html CAL_EVENTS·renderCal·calSheet 로직 TypeScript 변환
  - 샘플 이벤트 6개 하드코딩 (r·g 타입)
  - data-hide 항목(선정발표·신청마감) 주석으로 보존
  - 바텀시트 3종 (calSheet·calDaySheet·addCalSheet) useState 제어
  - BottomNav usePathname 기반 활성 탭 표시
- 다음 작업: 탐색(SCR-004) 화면 변환

## 2026-04-17
- 작업자: Claude Code
- 변경 파일:
  - app/layout.tsx (수정) — minHeight:100vh → height:100dvh + flex 구조로 변경, children flex:1 래퍼 추가
  - app/calendar/page.tsx (수정) — 캘린더 그리드 레이아웃 원본 재현
- 변경 내용:
  - layout.tsx: display:flex + flexDirection:column + height:100dvh → 하위 컴포넌트에서 flex:1 정상 동작
  - rowH 동적 계산: useRef + useEffect + ResizeObserver (원본 JS getBoundingClientRect 로직)
  - max(52, floor(availH / weeksCount)) 공식 동일하게 적용
  - 이벤트 칩 최대 2개 + +N 표시 추가 (height:18px 고정)
  - 이벤트 리스트를 그리드 flex:1 영역 外 별도 섹션으로 분리 (maxHeight:160px)
  - TypeScript 빌드 에러(div 닫기 구조 불일치) 수정
- 다음 작업: 탐색(SCR-004) 화면 변환

## 2026-04-17 (2차)
- 작업자: Claude Code
- 변경 파일: app/calendar/page.tsx (수정)
- 변경 내용:
  - 하단 일정 리스트 영역 완전 제거 (원본 SCR-012 구조 준수: 그리드가 flex:1로 100% 채움)
  - useEffect dependency에 viewMode 추가 → 주간↔월간 전환 시 rowH 재계산
  - setTimeout(run, 50) 적용 → viewMode 변경 후 DOM 커밋 대기 후 gridWrapRef 측정
- 다음 작업: 탐색(SCR-004) 화면 변환

## 2026-04-17 (3차)
- 작업자: Claude Code
- 변경 파일: app/calendar/page.tsx (수정)
- 변경 내용:
  [수정1 — 스와이프 인터랙션]
  - slideDir state ('left'|'right'|null) + touchStartX ref 추가
  - slide(dir, action) 헬퍼: 방향 설정 → action → 300ms 후 리셋
  - prevMonth/nextMonth/prevWeek/nextWeek → slide() 경유
  - 월간 그리드·주간 리스트에 onTouchStart/onTouchEnd 등록 (50px threshold)
  - slideInLeft/slideInRight keyframe 추가 (cubic-bezier 0.16,1,0.3,1 / 280ms)
  - 월간 < > 버튼 및 주간 < > 버튼에 애니메이션 연결
  - weekOffset state 추가 → 주간 weekStart 계산에 반영
  [수정2 — 수기 입력 탭]
  - addTab state ('url'|'manual') 추가
  - closeSheet에서 addTab 'url'로 리셋
  - '직접 입력할게요' 버튼 onClick → setAddTab('manual')
  - manual 탭: 캠페인명/마감일+체험일/협찬금액/위치/전화번호/예약여부(3-state)/주말방문(2-state)/메모 필드
  - resToggle·wkndToggle state로 토글 UI 관리
  - url 탭: 빈 상태 힌트(🔗) + 불러오기 버튼 표시
- 다음 작업: 탐색(SCR-004) 화면 변환

## 2026-04-17 (4차)
- 작업자: Claude Code
- 변경 파일:
  - app/explore/_camps.ts (신규) — Camp 인터페이스 + CAMPS 7개 하드코딩 (SCR-004/006 공용)
  - app/explore/page.tsx (신규) — SCR-004 탐색(홈)
  - app/explore/[id]/page.tsx (신규) — SCR-006 체험단 상세 + SCR-006A 인앱 브라우저
- 변경 내용:
  [SCR-004 탐색]
  - useState: keyword / filterOpen / media / type / cat / site / shortage / headerShadow
  - useMemo filtered: keyword·media·type·cat·site·shortage 다중 필터 실시간 적용
  - 필터 패널: 접기/펼치기 토글 + 인원부족 토글
  - 리뷰매체 6종·타입 3종·카테고리 7종 chipStyle(active, isSite) 헬퍼로 스타일 처리
  - 체험단 사이트 row: overflow-x:auto 수평 스크롤
  - onScroll → headerShadow (shadow-sm)
  - 결과 0개: 빈 상태 (🔍 조건에 맞는 체험단이 없어요)
  - CampCard: 플랫폼/카테고리/타입/매체 뱃지, 인원부족 뱃지, D-day, cc-name 2줄 clamp, 메타, 푸터
  [SCR-006 체험단 상세]
  - useRouter().back() 뒤로
  - 히어로 영역 200px (타입별 배경색)
  - 타이틀: plat·cat 뱃지 + D-day 배지
  - 체험 정보 카드: 지역/채널/모집인원/신청기간/리뷰마감 5행
  - 혜택 내용: whiteSpace:pre-line으로 줄바꿈 처리
  - position:absolute 고정 CTA → 신청하기 클릭 시 showBrowser(true)
  [SCR-006A 인앱 브라우저]
  - showBrowser state로 조건부 렌더링 (SCR-006 내 통합)
  - iframe + URL 주소바 + 뒤로 버튼
- 다음 작업: 마이페이지(SCR-009) 또는 수익 대시보드(SCR-014) 변환

## 2026-04-17 (5차)
- 작업자: Claude Code
- 변경 파일:
  - app/revenue/page.tsx (신규) — SCR-014 수익 대시보드
- 변경 내용:
  [월별 탭 세그먼트]
  - tab: 'current'|'prev'|'all' useState → 이번 달(4월) / 지난 달(3월) / 전체 전환
  - 탭 변경 시 filtered, total, goods, ad, avg 모두 재계산
  [count-up 애니메이션]
  - useCountUp(target, 600ms) 커스텀 훅: requestAnimationFrame + ease-out cubic
  - 탭 전환 시 새 target으로 재시작 (dependency: target)
  - total / goods / ad / count / avg 5종 애니메이션
  [히어로 카드]
  - 그라디언트 배경(#0E2048 → #1C3C82 → #2750A8) + 장식 원
  - 협찬 상품가 / 광고비 2분할 stat (광고비 #7AFFD4)
  - 이번 달 탭에서만 전월 대비 diff 표시 (↑↓ 색상 분기)
  [3분할 통계 카드]
  - StatCard 컴포넌트: 완료(--s-selected) / 평균 단가 / 누적(올해 총합)
  [채널별 분포]
  - 선택 탭 기준 동적 계산 → 스택 바(proportional flex) + 범례 grid
  [월별 트렌드 바 차트]
  - MONTH_BARS 하드코딩 (1~6월, 미래는 dashed border)
  - 현재 월(4월) brand 강조
  [수익 내역 리스트]
  - RevCard 컴포넌트: 왼쪽 플랫폼 컬러 스트라이프, 뱃지·채널, 협찬가·광고비 분리, 완료일
  - 빈 상태: 💰 등록된 수익이 없어요
  [FAB + 수익 등록 시트]
  - position:absolute bottom:16px — 캡슐 블루 버튼
  - 등록 시트: 캠페인명·협찬가 입력, 등록하기 버튼
  - ALL_REVS 샘플 7개 (4월 3 / 3월 2 / 2월 2)
- 다음 작업: 마이페이지(SCR-009) 변환 → 완료

## 2026-04-19
- 작업자: Claude Code
- 변경 파일:
  - app/splash/page.tsx (신규) — SCR-001 스플래시
  - app/onboarding/page.tsx (신규) — SCR-002 온보딩 3슬라이드
  - app/login/page.tsx (신규) — SCR-003 로그인
  - app/login/email/page.tsx (신규) — SCR-003A 이메일 가입
  - app/login/verify/page.tsx (신규) — SCR-003B 이메일 인증
  - components/layout/BottomNav.tsx (수정) — auth 경로에서 BottomNav 숨김 처리
- 변경 내용:
  [SCR-001 스플래시]
  - linear-gradient(160deg, #0E1B3E → #1C3C82 → #2A52B8) 배경 (ref 원본 그대로)
  - 아이콘 래퍼·cheche 글자카드·사이드바 3줄 ref HTML 구조 재현
  - fadeIn 600ms CSS animation (opacity 0→1)
  - useEffect: 마운트 후 1500ms → router.replace('/onboarding')
  - pulse 로딩 도트 3개 (animation-delay 0/0.2/0.4s)
  [SCR-002 온보딩]
  - SLIDES 배열 3개: 탐색(🔍)·캘린더(📅)·수익(💰)
  - key={idx} 변경으로 obSlideIn 280ms 애니메이션 트리거 (translateX 슬라이드)
  - 도트 인디케이터: active 시 width 6→20px 전환 (300ms transition)
  - 마지막 슬라이드 버튼 텍스트 '다음'→'시작하기' 조건 분기
  - 건너뛰기 버튼 → /login
  [SCR-003 로그인]
  - 카카오(#FEE500)·네이버(#03C75A)·Apple(#000) 소셜 버튼 (ref 원본 구조)
  - 클릭 시 useToast → "준비 중이에요 🙏" 토스트 2.2초 표시
  - 이메일로 계속하기 버튼(secondary) → /login/email
  - data-hide SCR-003D 주석으로 보존
  [SCR-003A 이메일 가입]
  - 이메일·비밀번호·닉네임 3필드 폼
  - validate(): 이메일 정규식·비밀번호 8자 이상 실시간 검사
  - touched + submitted 조합 → 필드별 에러 표시 (--s-overdue 빨간 테두리)
  - 가입하기 → 유효성 통과 시 /login/verify
  [SCR-003B 이메일 인증]
  - 6칸 분리 입력 (inputRefs 배열, ref callback 패턴으로 hooks-in-loop 회피)
  - onPaste: 클립보드 6자리 자동 분배
  - handleChange: 숫자만 허용, 입력 시 다음 칸 자동 포커스
  - handleKeyDown: Backspace 시 이전 칸 포커스
  - startCountdown(): 60초 카운트다운, canResend true 시 재전송 버튼 활성
  - 인증 완료(6칸 모두 입력 시 활성) → /calendar
  [공통]
  - BottomNav: HIDDEN_PATHS 배열로 splash/onboarding/login/* 경로 숨김
  - 모든 버튼 minHeight:44px (터치 타겟 규칙 준수)
  - HEX 직접 사용 없이 CSS 토큰 변수 사용 (--brand, --bg-input 등)
- 다음 작업: 마이페이지(SCR-009) 변환

## 2026-04-19 (2차)
- 작업자: Claude Code
- 변경 파일:
  - app/mypage/page.tsx (수정) — SCR-009 마이페이지 메인
  - app/mypage/channels/page.tsx (신규) — SCR-009A 채널 설정
  - app/mypage/notifications/page.tsx (신규) — SCR-009B 알림 설정
  - app/mypage/notification-center/page.tsx (신규) — SCR-010 알림 센터
- 변경 내용:
  [SCR-009 마이페이지]
  - 프로필 히어로: linear-gradient(155deg, #0E2048 → #1C3C82 → #2750A8) + 배경 장식 원 2개 (ref 원본 그대로)
  - 아바타 '유' / 닉네임 '유진님' / 이메일 creator@cheche.co.kr 하드코딩
  - 3분할 통계: 체험 예정 3·이번 달 수익 238,000원(#7AFFD4)·리뷰 완료 12 (ref 원본 stat 재현)
  - 계정 설정 row: 채널 설정 → /mypage/channels, 알림 설정 → /mypage/notifications
  - [data-hide="platform-link"] SCR-009C 플랫폼 연동 주석 보존
  - 앱 정보: 이용약관·개인정보 처리방침·버전 정보(v1.0.0 뱃지)
  - 로그아웃 → /login (router.replace), 회원 탈퇴 버튼
  - SettingsRow 내부 컴포넌트 추출 (32px 아이콘박스 + ChevR SVG)
  [SCR-009A 채널 설정]
  - 4채널: 네이버 블로그·인스타그램·유튜브·틱톡
  - Toggle 컴포넌트: 44px×28px, on/off 색상 전환 (brand/bg-chip)
  - 활성화 시 URL·팔로워 입력 폼 하단 확장 (조건부 렌더링)
  - 팔로워 수: 숫자만 허용 (\D 제거)
  - 삭제 버튼: url/followers 초기화 + enabled false
  - 저장하기 버튼 하단 sticky CTA → router.back()
  [SCR-009B 알림 설정]
  - 4항목: D-3 마감·당일 마감·기간 초과·선정 결과 알림
  - 각 항목: 36px 아이콘박스 + 제목 + 설명 + Toggle
  - 초기값: D-3·당일·선정결과 ON / 기간초과 OFF
  - 알림 시간 안내 카드 (brand-xlight 배경)
  - 저장하기 버튼 하단 sticky CTA → router.back()
  [SCR-010 알림 센터]
  - INITIAL_NOTIFS 5개 하드코딩 (오늘 2개 + 어제 3개)
  - [data-hide="reconnect-notif"] 강남맛집 재연동 알림 주석 보존
  - NotifIcon 컴포넌트: red/blue/green/yellow 4종 (ref .ni-* 클래스 재현)
  - 읽음/안읽음: unread true → brand-xlight 배경 + 파란 점 표시
  - markRead: 클릭 시 해당 알림 unread false → 해당 링크로 router.push
  - 전체 읽음 버튼: markAllRead() 일괄 처리
  - unreadCount 뱃지 헤더 타이틀 옆 표시 (s-overdue 빨간 뱃지)
  - 빈 상태: 🔔 알림이 없어요
- 다음 작업: 지도 화면(SCR-013) 또는 탐색 화면 개선 → 완료

## 2026-04-19 (3차)
- 작업자: Claude Code
- 변경 파일:
  - app/map/page.tsx (수정) — SCR-013 체험단 지도 (react-leaflet)
  - app/map/MapView.tsx (신규) — Leaflet 렌더링 컴포넌트 (SSR 제외)
  - app/explore/page.tsx (수정) — 헤더 지도·알림 아이콘 onClick 연결
  - components/layout/BottomNav.tsx (수정) — /map 경로 탐색 탭 활성 처리
  - styles/globals.css (수정) — leaflet CSS 임포트 + .pm-marker 스타일
- 변경 내용:
  [SCR-013 체험단 지도]
  - react-leaflet + leaflet 패키지 설치 (npm install leaflet react-leaflet @types/leaflet)
  - MapView.tsx: SSR 제외 컴포넌트. MapContainer + TileLayer + useMap hook 기반 Markers
  - page.tsx: dynamic(() => import('./MapView'), { ssr: false }) 패턴으로 SSR 회피
  - MAP_PINS 18개 하드코딩 (ref 원본 데이터 그대로)
  - PLAT_COLOR 맵: 레뷰(#00B386)·강남맛집(#E8394A)·미블(#2B7FE8) 등 10종
  - L.divIcon으로 .pm-marker CSS 클래스 기반 커스텀 마커 (34px 원형, 플랫폼 첫 글자)
  - 인원부족(남은 인원 ≤2): 마커에 gold border + glow 효과
  - 선택 마커: .selected 클래스 → scale(1.2), border-width 3px
  - 카테고리 필터 칩 (전체·맛집·카페·뷰티·숙박·생활): useMemo 필터링
  - 마커 클릭 시 map.panTo() 이동 + 하단 캠페인 미니 카드 표시
  - 미니 카드: 플랫폼·카테고리·타입 뱃지 + 캠페인명 + 인원/면적 메타 + D-day 색상 + 상세보기 CTA
  - 닫기(×) 버튼으로 미니 카드 → 힌트 카드 전환
  - 힌트 카드: 필터된 체험단 수 + 레뷰/강남맛집 플랫폼 범례 (ref 원본)
  - OSM TileLayer, zoomControl topright 배치
  - globals.css: leaflet.css @import + .pm-marker / .pm-marker.selected 전역 스타일
  [헤더 알림 아이콘 연결 — 수정 2]
  - explore/page.tsx: 지도 아이콘 버튼 onClick → router.push('/map')
  - explore/page.tsx: 알림 아이콘 버튼 onClick → router.push('/mypage/notification-center')
  - BottomNav.tsx: isActive 조건에 pathname === '/map' → 탐색 탭 활성 추가
- 다음 작업: 미구현 화면 점검 및 마무리

## 2026-04-19 (4차)
- 작업자: Claude Code
- 변경 파일:
  - app/calendar/page.tsx (수정) — addCalSheet 가이드라인 탭 추가 + CalEvent 타입 확장
- 변경 내용:
  [CalEvent 타입 확장]
  - guideline?: string 필드 추가
  - 샘플 이벤트 e2(카페투어 강남점)에 guideline 하드코딩
  [addTab 상태 확장]
  - 'url' | 'manual' → 'url' | 'manual' | 'guideline' 3-way 유니온 타입
  - guidelineText: string 상태 추가 (textarea 제어값)
  - closeSheet()에서 guidelineText 초기화 추가
  [addCalSheet 탭 UI 개편]
  - '직접 입력할게요' 버튼 제거
  - 3-탭 전환 행 추가 (URL 입력 / 수기 입력 / 가이드라인)
  - 탭 활성: inset border-bottom brand 언더라인 + bg-card 배경
  - 가이드라인 탭 콘텐츠: brand-xlight 안내 배너 + textarea(rows=5, 제어)
  - URL 입력 비활성: addTab !== 'url' 조건으로 disabled/opacity 처리
  [SCR-012B calSheet 가이드라인 연동]
  - 하드코딩 텍스트 제거 → sheetEvent?.guideline 동적 렌더링
  - guideline 없을 때 섹션 자체 숨김 (editMode 시에는 textarea 표시)
  - 뷰 모드: whiteSpace:pre-wrap으로 줄바꿈 처리
  - 편집 모드: defaultValue={sheetEvent?.guideline ?? ''}
- 다음 작업: 미구현 화면 점검 및 마무리

## 2026-04-19 (5차)
- 작업자: Claude Code
- 변경 파일:
  - app/calendar/page.tsx (수정) — 가이드라인 필드 위치 수정
- 변경 내용:
  - addTab 타입에서 'guideline' 제거 → 'url' | 'manual' 두 개만 유지
  - 3-탭 UI → 2-탭 UI (URL 입력 / 수기 입력)
  - 별도 탭으로 존재하던 가이드라인 블록 제거
  - 가이드라인 필드를 URL 폼 하단(빈 상태 힌트 아래)에 추가
  - 가이드라인 필드를 수기 입력 폼 하단(메모 아래)에 추가
  - 두 폼 모두 동일한 guidelineText state 공유 (제어 컴포넌트)
  - URL input disabled 조건: addTab !== 'url' → addTab === 'manual' 복원
  - CalEvent.guideline 필드 및 SCR-012B 상세 시트 연동은 그대로 유지
- 다음 작업: 미구현 화면 점검 및 마무리

## 2026-04-19 (6차)
- 작업자: Claude Code
- 변경 파일:
  - app/calendar/page.tsx (수정) — 가이드라인 필드 노출 조건 수정
- 변경 내용:
  - urlParsed: boolean state 추가 (기본값 false)
  - closeSheet()에서 urlParsed false로 초기화 추가
  - '불러오기' 버튼 onClick → setUrlParsed(true) 연결
  - URL 탭 내 가이드라인 필드를 {urlParsed && ...}로 감싸 불러오기 완료 후에만 노출
  - 수기 입력 탭 가이드라인 필드는 조건 없이 항상 노출 유지
- 다음 작업: 미구현 화면 점검 및 마무리

## 2026-04-19 (7차)
- 작업자: Claude Code
- 변경 파일:
  - app/calendar/page.tsx (수정) — SCR-012B 가이드라인 섹션 노출 조건 수정
- 변경 내용:
  - 기존: {(sheetEvent?.guideline || editMode) && ...} 조건부 렌더링 → 조건 제거
  - 섹션 항상 표시 (일정 정보 → 협찬 정보 → 방문 정보 → 가이드라인 → 메모 순서 유지)
  - 뷰 모드: guideline 값 있으면 pre-wrap 텍스트, 없으면 "—" (text-muted) 표시
  - 편집 모드: textarea (border-mid 스타일, 메모 섹션과 동일 형태)
- 다음 작업: 미구현 화면 점검 및 마무리

## 2026-04-19 (8차)
- 작업자: Claude Code
- 변경 파일:
  - app/calendar/page.tsx (수정) — 협찬 금액 필수 → 선택 변경
- 변경 내용:
  - CalEvent 인터페이스에 amount?: string 필드 추가
  - 샘플 이벤트 e2에 amount: '28,000' 추가
  - addCalSheet 수기 입력 폼: 협찬 금액 라벨 * → (선택) 변경
  - SCR-012B 뷰 모드: sheetEvent.amount 있으면 금액+원 표시, 없으면 "—" (text-muted) 표시
  - SCR-012B 편집 모드: defaultValue={sheetEvent?.amount ?? ''} 로 실제 데이터 반영
- 다음 작업: 미구현 화면 점검 및 마무리

## 2026-04-20
- 작업자: Claude Code
- 변경 파일:
  - app/calendar/page.tsx (수정) — 수기 입력 폼 등록 기능 구현
- 변경 내용:
  [CAL_EVENTS → useState 전환]
  - const CAL_EVENTS 배열을 const [events, setEvents] = useState<CalEvent[]>(CAL_EVENTS) 로 관리
  - getFilteredEvents / toggleDone / cells useMemo / sheetEvent / sheetAllIds 모두 events 참조로 변경
  - cells useMemo 의존성 배열에 events 추가
  [수기 입력 폼 state 연결]
  - manualName / manualDeadline / manualExpDate / manualAmount / manualLocation / manualMemo 6개 state 추가
  - 각 input/textarea에 value + onChange 바인딩 (제어 컴포넌트 전환)
  [handleAddManual 등록 핸들러]
  - calcDday(dateStr, todayS) 헬퍼 추가 (컴포넌트 외부) → D-N / D-DAY / +N 계산
  - 캠페인명·마감일 없으면 early return (버튼 opacity 0.5로 시각 표시)
  - 마감일자 → type:'r' 이벤트 생성; 체험일자 입력 시 → type:'g' 이벤트 추가 생성
  - setEvents(prev => [...prev, ...newEvents]) 로 state 업데이트 → 리렌더 트리거
  - 등록 후 year/month 이동 + setSelDate(마감일) → 해당 날짜 자동 선택
  - closeSheet() 호출로 바텀시트 닫기 + 입력값 초기화
  [closeSheet 초기화 확장]
  - manualName·manualDeadline·manualExpDate·manualAmount·manualLocation·manualMemo 초기화
  - resToggle → '예정', wkndToggle → null 리셋 추가
  ["등록할게요" 버튼 분기]
  - addTab === 'manual' ? handleAddManual : closeSheet 조건 분기
  [TypeScript 검증]
  - npx tsc --noEmit 에러 없음 확인
- 다음 작업: 미구현 화면 점검 및 마무리

## 2026-04-20 (3차)
- 작업자: Claude Code
- 변경 파일:
  - app/calendar/page.tsx (수정) — 일정 등록 채널 선택 + 상세 뷰 채널 표시
- 변경 내용:
  [CalEvent 타입 확장]
  - channels?: string[] 필드 추가
  [CHANNELS 상수 추가]
  - ['블로그', '인스타그램', '유튜브', '클립'] as const — 4개 채널 고정값
  [수기 입력 폼 — 채널 선택 UI]
  - manualChannels: Set<string> state 추가
  - 캠페인명 바로 아래에 채널 선택 행 삽입
  - 4개 버튼 flex 배치, 클릭 시 토글 (다중 선택 가능)
  - 활성: brand-light 배경 + brand 테두리 + brand-text 색상 / 비활성: bg-card + border-mid
  - closeSheet()에서 setManualChannels(new Set()) 초기화 추가
  [handleAddManual — channels 포함]
  - manualChannels.size > 0 ? [...manualChannels] : undefined 로 저장
  - r(리뷰마감) · g(체험기간) 두 이벤트 모두 동일 channels 값 공유
  [SCR-012B 상세 뷰 — 채널 표시]
  - 하드코딩 "블로그, 인스타그램" 제거
  - sheetEvent.channels?.join(', ') 로 실제 선택 채널 표시 (없으면 '—')
  - 편집 모드 input 제거 → 텍스트 단순 표시로 통일 (요구사항 기준)
  [TypeScript 검증]
  - npx tsc --noEmit 에러 없음 확인
- 다음 작업: 미구현 화면 점검 및 마무리

## 2026-04-21
- 작업자: 도유진 - 맥북
- 변경 파일:
  - CLAUDE.md (수정) — "작업 이력 기록 규칙" 섹션 추가
  - work.md (수정) — 본 항목 추가
- 변경 내용:
  - 멀티 디바이스 협업을 위한 work.md 기록 규칙 명문화
  - 작업자 표기: "도유진 - 맥북" / "도유진 - 윈도우" 두 가지로 구분
  - 매 코드 변경 시 work.md에 기록 + 커밋·푸시 전 갱신 확인 규칙 추가
  - 다른 컴퓨터에서 작업 시작 전 git pull 절차 명시
- 다음 작업: 깃허브 push 후 윈도우 노트북에서 git pull 테스트

## 2026-04-21 (2차)
- 작업자: 도유진 - 윈도우
- 변경 파일:
  - app/calendar/page.tsx (수정) — SCR-012B 상세 시트 D-day 동적 계산
- 변경 내용:
  [sheetRelated 파생값 추가]
  - sheetRelated: 같은 캠페인명(name)을 가진 모든 이벤트 배열
  - sheetDeadlineEv: sheetRelated 중 type:'r' 이벤트 (리뷰마감)
  - sheetExpEv: sheetRelated 중 type:'g' 이벤트 (체험기간)
  - sheetAllIds를 sheetRelated 기반으로 단순화
  [헤더 D-day 뱃지 동적 계산]
  - 기존 {sheetEvent.dday} 정적값 → calcDday(sheetEvent.date, todayStr) 동적 계산
  - 오늘 기준 실시간 D-N / D-DAY / D+N 표시
  [일정 정보 > 리뷰 마감일]
  - sheetDeadlineEv?.date 로 실제 마감일 날짜 표시 (없으면 '—')
  - D-day 뱃지: calcDday(sheetDeadlineEv.date, todayStr) 동적 계산
  - 편집 모드 input defaultValue: sheetDeadlineEv?.date ?? ''
  [일정 정보 > 체험일자]
  - 하드코딩 '2026-04-15' / 'D+6' 완전 제거
  - sheetExpEv?.date 로 실제 체험일자 표시 (없으면 '—')
  - D-day 뱃지: calcDday(sheetExpEv.date, todayStr) 동적 계산
  - 편집 모드 input defaultValue: sheetExpEv?.date ?? ''
  [기준 / 표기 룰]
  - 리뷰 마감 (type:'r'): 미래 → D-N, 당일 → D-DAY, 지남 → D+N
  - 체험 기간 (type:'g'): 미래 → D-N, 당일 → D-DAY, 지남 → D+N (동일 공식)
  - 예) 오늘 4/20, 체험일 4/18 → D+2 / 오늘 4/20, 마감일 4/27 → D-7
  [TypeScript 검증]
  - npx tsc --noEmit 에러 없음 확인
- 다음 작업: 미구현 화면 점검 및 마무리

## 2026-04-21 (3차)
- 작업자: 도유진 - 윈도우
- 변경 파일:
  - app/calendar/page.tsx (수정) — 캘린더 일정 등록·편집·삭제 UX 개선
- 변경 내용:
  [SCR-012B 삭제 기능 실제 동작]
  - 기존: alert 띄우고 closeSheet만 호출 (이벤트 미삭제)
  - window.confirm으로 확인 후 sheetAllIds 모두 setEvents에서 filter 제거
  - doneSet에서도 해당 id 모두 정리 → 캘린더 그리드·필터 모두 즉시 반영
  [플랫폼에서 확인하기 버튼 폰트 축소]
  - fontSize:15 → fontSize:13, padding 좌우 22→14, whiteSpace:nowrap 추가
  - "리뷰 완료" 버튼도 동일하게 통일 (한 줄 표기 보장)
  [SCR-012B 채널 편집 가능]
  - editChannels: Set<string> state 추가 → showCalSheet 호출 시 sheetEvent.channels로 초기화
  - 편집 모드에서 plat 옆 채널 텍스트 숨기고, 헤더 하단에 4개 채널 토글 UI 노출
  - 저장하기 클릭 시 sheetAllIds 전체 이벤트의 channels 필드 일괄 갱신
  [수기 입력 폼 — 플랫폼 필드 추가]
  - PLATFORMS 상수 추가 (레뷰·미블·리뷰노트·강남맛집·서울오빠·디너의여왕·티블·링블·놀러와)
  - manualPlatform state 추가 → closeSheet 초기화 포함
  - 캠페인명 아래·채널 위 위치에 select(필수) 필드 신규
  - 커스텀 SVG chevron 적용 (appearance:none + backgroundImage)
  [수기 등록 plat 값 변경]
  - 기존: plat:'수기' 하드코딩
  - 변경: plat: manualPlatform — 사용자가 선택한 플랫폼 그대로 저장
  - r·g 두 이벤트 모두 동일 적용
  - handleAddManual early return 조건에 !manualPlatform 추가
  - 등록 버튼 opacity 조건도 manualPlatform 검사 포함
  [TypeScript 검증]
  - npx tsc --noEmit 에러 없음 확인
- 다음 작업: 사용자 확인 후 추가 요청 대응

## 2026-04-21 (4차)
- 작업자: 도유진 - 윈도우
- 변경 파일:
  - app/page.tsx (수정) — 루트 경로 진입 시 /calendar 로 redirect
- 변경 내용:
  [루트 진입 동작 변경]
  - 기존: <h1>홈 (탐색) SCR-004</h1> placeholder 표시
  - 변경: next/navigation redirect()로 /calendar 강제 이동
  - Vercel 배포 https://cheche-app.vercel.app/ 진입 시 캘린더(메인 랜딩) 즉시 노출
  - server component 패턴 사용 (use client 불필요)
  [TypeScript 검증]
  - npx tsc --noEmit 에러 없음 확인
- 다음 작업: 사용자 확인 후 추가 요청 대응

## 2026-04-21 (5차)
- 작업자: 도유진 - 윈도우
- 변경 파일:
  - app/calendar/page.tsx (수정) — 편집 저장 반영 로직 보강, D+N 표기 포맷, handleAddManual 수익 연동
  - app/revenue/page.tsx (수정) — localStorage 수익 항목 머지
- 변경 내용:
  [calcDday D+N 포맷]
  - 과거 날짜 표기: `+N` → `D+N` 통일 (뱃지·리스트·시트 전반)
  - 샘플 이벤트 e3 dday 'D+2' 로 정리
  [편집 저장 반영]
  - editName·editLocation·editAmount·editGuideline·editDeadlineDate·editExpDate state 신규
  - enterEditMode(): 편집 진입 시 sheetEvent/sheetDeadlineEv/sheetExpEv 로부터 각 state 초기화
  - 편집 버튼 onClick: editMode 토글 시 enterEditMode 호출
  - 캠페인명·리뷰 마감일·체험일자·위치·협찬 금액·가이드라인 input/textarea 전부 controlled 로 전환
  - handleSaveEdit(): sheetAllIds 제거 후 editDeadlineDate/editExpDate 값 기반으로 r·g 이벤트 재구성
    · 기존 id 보존, 신규(체험일자 추가 케이스) 는 g{Date.now()} 로 생성
    · 저장 후 sheetEventId 를 동일 type 이벤트 또는 첫 이벤트로 재지정, 둘 다 없으면 시트 닫기
  - closeSheet 에 모든 edit state reset 포함
  [수익 페이지 연동]
  - handleAddManual: manualAmount 숫자 파싱 후 0보다 크면 localStorage('cheche_user_revenues') 에 RevItem 형태로 push
    · 채널 alias: 인스타그램→인스타, 클립→블로그 클립 (revenue CHANNEL_COLOR 매칭)
    · 날짜는 manualExpDate 우선, 없으면 manualDeadline
    · emoji 기본값 📝, ad 0
  - revenue/page.tsx: mount 시 localStorage 로부터 userRevs state 복원 → ALL_REVS 와 머지하여 filtered/cumul/prevTotal 산출
  [TypeScript 검증]
  - npx tsc --noEmit 에러 없음 확인
- 다음 작업: 사용자 확인 후 추가 요청 대응

## 2026-04-21 (6차)
- 작업자: 도유진 - 윈도우
- 변경 파일:
  - app/calendar/page.tsx (수정) — 헤더 알림·필터 버튼 동작, localStorage 동기화
  - app/mypage/page.tsx (수정) — 체험 예정/리뷰 완료 통계를 캘린더 데이터 기반으로 계산
- 변경 내용:
  [캘린더 헤더 버튼 연결]
  - 알림(종) 버튼 onClick 추가 → useRouter 로 /mypage/notification-center 이동
  - 필터(세 줄) 버튼 onClick 추가 → filtersOpen state 토글
  - filtersOpen=false 이면 필터 칩 전체(전체·리뷰마감·체험일자) 숨김 처리
  - 활성 상태(열림) 시 버튼 배경 var(--brand-light), 아이콘 색 var(--brand) 로 시각화
  [캘린더 state localStorage 동기화]
  - events → 'cheche_events', doneSet → 'cheche_done_set' 키로 저장
  - mount 시 localStorage 에서 먼저 읽어 state 복원 후 loaded=true 세팅
  - loaded 이후 events/doneSet 변경마다 writeback (초기 샘플 반복 저장 방지)
  [마이페이지 통계 동적 계산]
  - hardcoded STATS 상수 제거, useState(upcoming/done) 로 전환
  - useEffect: mount·focus·pageshow 시 localStorage 로드
    · 체험 예정 = events.filter(type==='g' && date > today).length (리뷰마감은 제외)
    · 리뷰 완료 = events 중 doneSet 에 포함된 것의 name 기준 Set 크기 (r·g 이중 카운트 방지)
  - 이번 달 수익은 별도 지표이므로 기존 '238,000' 유지 (요청 범위 외)
  [TypeScript 검증]
  - npx tsc --noEmit 에러 없음 확인
- 다음 작업: 사용자 확인 후 추가 요청 대응

## 2026-04-21 (7차)
- 작업자: 도유진 - 윈도우
- 변경 파일:
  - components/analytics/GTMPageView.tsx (신규) — SPA 라우트 변경 시 dataLayer page_view 이벤트 push
  - app/layout.tsx (수정) — GTM 메인 스크립트 + noscript iframe + GTMPageView 마운트
- 변경 내용:
  [GTM 컨테이너 설치]
  - Container ID: GTM-NPWLSPWR
  - next/script 의 Script 컴포넌트로 strategy="afterInteractive" GTM 부트스트랩 스니펫 로드
  - body 최상단에 noscript iframe(fallback) 배치
  [SPA 페이지뷰 추적]
  - usePathname + useSearchParams 로 App Router 라우트 변경 감지
  - 변경마다 window.dataLayer.push({event:'page_view', page_path, page_location, page_title})
  - useSearchParams Suspense 경계 필수 → GTMPageViewInner 를 Suspense 로 감싼 래퍼 export
  - declare global 로 window.dataLayer 타입 선언
  [기존 layout 구조 유지]
  - metadata/font/BottomNav/max-width 393 컨테이너 등 기존 구조 완전 보존
  - <head> 가 없던 기존 구조에 <head> 신규 추가 후 GTM Script 삽입
  - @/components/analytics/GTMPageView alias 적용 (tsconfig paths "@/*": ["./*"])
  [빌드 검증]
  - npm run build 성공, TypeScript 에러 없음, Suspense 관련 warning 없음
  - 18개 라우트 전부 컴파일 통과
- 다음 작업: Vercel 배포 후 DevTools Network·Console 에서 gtm.js 로드 / dataLayer 이벤트 누적 확인, GTM Preview 모드 Tag Assistant 연결 테스트

## 2026-04-21 (8차)
- 작업자: 도유진 - 윈도우
- 변경 파일:
  - ANALYTICS.md (신규) — 애널리틱스 설정 히스토리 문서
- 변경 내용:
  [Analytics 히스토리 문서화]
  - GTM 컨테이너 ID: GTM-NPWLSPWR
  - GA4 측정 ID: G-VKGCMP6G39
  - 설치 구조(next/script afterInteractive, noscript iframe, SPA 추적 컴포넌트)
  - 자동 수집 / 미설정(추후 추가) 이벤트 범위 명시
  - 커스텀 이벤트 추가 이력 테이블 (현재 비어있음)
  - 새 AI 온보딩용 컨텍스트 섹션 (대시보드 관리 원칙 · data-hide 화면 주의)
- 다음 작업: Vercel 배포 후 GTM Preview 연결 테스트, GA4 실시간 리포트 수신 확인
