# 체체 (CheChé) — 프로젝트 컨텍스트

## 앱 개요
한국 크리에이터를 위한 체험단 올인원 관리 앱.
레뷰·강남맛집·미블 등 여러 플랫폼의 체험단 선정 내역을 한 곳에서 관리.
타겟: 2030 여성 크리에이터 / 디자인 방향: 토스(Toss) 스타일.

## 기술 스택
- Next.js 16 (App Router) + TypeScript
- 인증: NextAuth.js v5 (Auth.js), JWT 세션
- Provider: Google · Kakao · Naver (3종 소셜 로그인)
- ORM: Prisma / DB: Supabase PostgreSQL
- 배포: Vercel (https://cheche-app.vercel.app)
- 분석: GTM (GTM-NPWLSPWR) + GA4 (G-VKGCMP6G39)
- **모바일 래핑: Capacitor (iOS/Android 네이티브 앱 출시 예정)**

## 화면 목록
- SCR-001  스플래시
- SCR-002  온보딩 (3장 슬라이드)
- SCR-003  로그인 (소셜 3종 + 이메일) / SCR-003A 이메일 가입 / SCR-003B 이메일 인증
- SCR-004  탐색(홈) — 체험단 공고 목록, 다중 필터
- SCR-006  체험단 상세 / SCR-006A 인앱 브라우저 (WebView)
- SCR-008C URL 파싱 등록 (방법 A)
- SCR-009  마이페이지 / SCR-009A 채널 설정 / SCR-009B 알림 설정
- SCR-010  알림 센터
- SCR-011  에러/빈 화면 (6종)
- SCR-012  캘린더(월간) ← 메인 랜딩 / SCR-012A 주간 / SCR-012B 상세 시트
- SCR-013  체험단 지도 (Leaflet)
- SCR-014  수익 대시보드

## data-hide 화면 (건드리지 말 것)
SCR-003D, SCR-007, SCR-008, SCR-009C — 법적 리스크(ADR-001)로 Phase 1 제외.
복구 방법은 ref/체체_앱_최종.html 상단 주석 참조.

## 디자인 토큰 (styles/tokens.css)
- 브랜드: --brand (#1C3C82)
- 배경: --bg-page, --bg-card
- 텍스트: --text-primary, --text-secondary, --text-muted
- 상태 6종: --s-applied, --s-selected, --s-deadline, --s-overdue, --s-not-sel, --s-completed

## 코드 작업 규칙
- HEX 직접 사용 금지 → 토큰 변수명만 사용
- 좌우 패딩 24px 일관 적용 (--screen-pad)
- 터치 타겟 최소 44×44px
- 해요체 UX 라이팅 ("저장할게요", "나가는 중이에요")
- 폰트: 로고 Poppins 800 (--font-logo), 앱 전체 Pretendard Variable (--font-body)
- ref/ 폴더는 참조 전용 — 배포 무관
- 수정 전 관련 파일 전체 읽기 → 부분 수정 금지, 완전 교체 원칙
- v1.1 변경사항: F-08 미선택 허용, F-08A 예약여부 3단계 신규
- **모든 신규 코드는 아래 "모바일 앱 호환성 가이드라인" 준수 필수**

## 모바일 앱 호환성 가이드라인 (Capacitor 대응)
체체 앱은 Capacitor로 래핑하여 iOS/Android 네이티브 앱으로 출시 예정.
웹과 앱이 **단일 코드베이스를 공유**하므로 아래 제약을 반드시 지켜야 함.

### 필수 준수 사항
- Next.js `output: 'export'` (정적 빌드)와 호환되는 코드만 작성
- Server Actions, API Routes 서버 렌더링 의존 금지
- 데이터 fetching은 클라이언트 사이드에서 수행 (useEffect, SWR, TanStack Query)
- `next/image`는 `unoptimized: true` 또는 정적 경로 사용
- 라우팅은 상대 경로 우선, 절대 URL 하드코딩 지양

### 하지 말아야 할 것
- `<form action={serverAction}>` 같은 Server Actions
- `document.cookie` 직접 조작 (쿠키 기반 인증 지양 → JWT 토큰 사용 중)
- `window.location.href = '외부URL'` (앱에서 이탈 발생)
- `localStorage` 직접 사용 (서버 API 경유 원칙 + `@capacitor/preferences` 추상화 대비)

### 네이티브 환경 감지 패턴
외부 링크, 파일 다운로드, 공유 기능 등은 플랫폼별 분기:
```tsx
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // 네이티브 플러그인 사용 (예: Browser.open)
} else {
  // 웹 표준 API 사용 (예: window.open)
}
```

### 외부 리소스 처리
- 외부 웹페이지 이동 시 Capacitor Browser 플러그인 사용 (앱에서 인앱 브라우저로 열림)
- 지도/캘린더 등 브라우저 전용 라이브러리는 SSR 비활성화 (`dynamic(..., { ssr: false })`)
- 현재 `app/map/MapView.tsx`가 이 패턴 따름 — 신규 컴포넌트도 동일하게 처리
- SCR-006A 인앱 브라우저는 Capacitor Browser 플러그인 전제로 설계

### 레이아웃 (SafeArea)
- iOS 노치/다이나믹 아일랜드 대응: `padding-top: env(safe-area-inset-top)`
- 하단 BottomNav: `env(safe-area-inset-bottom)` 고려하여 높이 계산
- 뷰포트 meta 태그에 `viewport-fit=cover` 포함
- 키보드 올라올 때 `@capacitor/keyboard` 플러그인 호환 구조

### 네이티브 API 호환 구조 (추후 구현 시)
아래 기능은 웹 폴백 + 네이티브 플러그인 이중 구조로 작성:
- 푸시 알림 → `@capacitor/push-notifications` (웹: Web Push API 폴백)
- 위치 정보 → `@capacitor/geolocation` (웹: navigator.geolocation 폴백)
- 카메라/갤러리 → `@capacitor/camera` (웹: file input 폴백)

### 테스트 환경
- 개발: `npm run dev` (웹 브라우저)
- 앱 빌드 확인: `npm run build && npx cap sync`
- iOS 실행: `npx cap open ios` (Mac + Xcode 필요)
- Android 실행: `npx cap open android` (Android Studio 필요)

## 유저 데이터 격리 원칙 (중요)
모든 소유 데이터는 userId 외래키 필수.
조회/수정/삭제는 auth() 세션의 userId와 where 절 강제 매칭.
updateMany/deleteMany로 id + userId 동시 조건 처리.
localStorage 기반 공용 저장 금지 (서버 API 경유).

## 환경변수 관리
- 로컬: .env.local (gitignore 처리, GitHub 업로드 금지)
- 프로덕션: Vercel 대시보드 환경변수
- 필수 키 목록은 .env.local.example 참조

## 작업 이력 기록 규칙 (중요)
코드 수정·생성·삭제마다 루트 `work.md` **최상단**(# 체체 작업 이력 헤더 바로 아래)에 새 항목 추가.
**항상 날짜 내림차순** 유지. 하단 append 금지. 기존 항목 편집·삭제 금지(이력 보존).

작업자 표기:
- macOS 환경 → "도유진 - 맥북"
- Windows 환경 → "도유진 - 윈도우"

형식:

```
## YYYY-MM-DD (N차)
- 작업자: 도유진 - 윈도우
- 변경 파일:
  - 경로/파일명 (신규/수정/삭제) — 간단 설명
- 변경 내용:
  - 주요 변경사항 bullet
- 다음 작업: 다음 할 일 한 줄
```

- 같은 날 첫 작업은 차수 없이, 두 번째부터 (2차), (3차)
- 같은 날 내에서도 최신 차수가 위로
- 커밋 전 work.md 갱신 확인, 다른 컴퓨터 작업 시작 전 `git pull` 필수