# 체체 앱 — Analytics 설정 히스토리

## 개요
- 배포 URL: https://cheche-app.vercel.app
- GTM 컨테이너 ID: GTM-NPWLSPWR
- GA4 측정 ID: G-VKGCMP6G39
- 적용일: 2025년 4월

---

## 설치 구조

### GTM 설치 방식
- Next.js App Router SPA 환경
- `app/layout.tsx`에 GTM 스크립트 삽입 (next/script, strategy="afterInteractive")
- `<body>` 여는 태그 직후 noscript iframe 삽입

### SPA 페이지뷰 추적
- 파일: `components/analytics/GTMPageView.tsx`
- Next.js 클라이언트 컴포넌트 (`'use client'`)
- `usePathname` + `useSearchParams`로 라우트 변경 감지
- 라우트 변경 시마다 `window.dataLayer.push({ event: 'page_view', page_path, page_location, page_title })` 실행
- `useSearchParams`는 빌드 에러 방지를 위해 `<Suspense>`로 감쌈
- `<GTMPageView />`는 `app/layout.tsx`의 `<body>` 안에 위치

### GA4 연결
- GTM 대시보드에서 "구글 태그" 타입으로 태그 생성
- 태그 이름: GA4 기본 연동
- 태그 ID: G-VKGCMP6G39
- 트리거: All Pages
- GTM 버전명: GA4 초기 연동

---

## 추적 가능한 데이터 (현재 기준)

### 자동 수집 (추가 코드 불필요)
- 페이지별 조회수 (/calendar, /explore, /explore/[id], /map, /campaign, /revenue, /mypage 등 전체)
- 활성 사용자 수 (실시간/일간/주간/월간)
- 신규 vs 재방문 사용자
- 유입 채널 (직접/검색/소셜/추천)
- 디바이스/OS/브라우저/국가
- 스크롤 90% 도달
- 외부 링크 클릭
- 세션 수, 평균 참여 시간, 이탈률

### 미설정 (추후 추가 예정)
- 버튼 클릭 이벤트 (로그인 방식별, 공고 카드, 신청 버튼 등)
- 가입 완료 전환 이벤트
- 로그인 사용자 ID 연동
- 공고별 메타데이터 파라미터 (공고명, 카테고리 등)
- 필터 적용 이벤트

---

## 커스텀 이벤트 추가 이력

| 날짜 | 이벤트명 | 위치 | 파라미터 | GTM 트리거 |
|------|---------|------|---------|-----------|
| -    | (미설정) | -    | -       | -         |

---

## 새 AI에게 전달하는 컨텍스트

- GTM과 GA4는 코드가 아닌 GTM 대시보드(tagmanager.google.com)에서 관리됨
- 새 이벤트 추가 시: ① 해당 컴포넌트에 dataLayer.push 코드 추가 → ② GTM에서 트리거/태그 설정 → ③ GTM 제출(게시) 순서로 진행
- GA4 리포트 확인: analytics.google.com → G-VKGCMP6G39 속성
- SPA 페이지뷰는 GTMPageView.tsx가 담당하므로, 페이지 추가 시 별도 코드 불필요 (layout.tsx 공유 구조이므로 자동 적용)
- 제외 화면(SCR-003D, SCR-007, SCR-008, SCR-009C)은 data-hide 처리 — 건드리지 말 것
