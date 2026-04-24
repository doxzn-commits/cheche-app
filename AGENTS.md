# 체체 (CheChé) — AGENTS.md
# Antigravity Agent Context File
# CLAUDE.md와 함께 유지. 동기화 기준: CLAUDE.md가 원본.

## 앱 개요
한국 크리에이터를 위한 체험단 올인원 관리 앱 (cheche.co.kr).
레뷰·강남맛집·미블 등 여러 플랫폼의 체험단 선정 내역을 한 곳에서 관리.
타겟: 2030 여성 크리에이터 / 디자인: 토스(Toss) 스타일.

## 기술 스택
- Next.js 16 (App Router) + TypeScript
- 인증: NextAuth.js v5 (Auth.js), JWT 세션
- Provider: Google · Kakao · Naver
- ORM: Prisma / DB: Supabase PostgreSQL
- 배포: Vercel (https://cheche-app.vercel.app)
- 분석: GTM (GTM-NPWLSPWR) + GA4 (G-VKGCMP6G39)

## Antigravity 전용 지시

### 브라우저 에이전트 사용 원칙
- 화면 구현 후 반드시 내장 브라우저로 모바일 뷰(375px) 시각 검증
- 확인 항목: 터치 타겟 44×44px 이상, 좌우 패딩 24px, 컬러 토큰
- 스크린샷을 작업 결과 증거로 첨부

### 병렬 에이전트 사용 가이드
- Agent 1: 화면 컴포넌트 (SCR-xxx)
- Agent 2: 스타일·토큰 검증
- Agent 3: API Route / Server Action
- 같은 파일을 동시에 수정하지 말 것 (충돌 방지)

### 작업 완료 후 필수 행동
1. `work.md` 최상단에 작업 이력 추가 (형식은 아래 참조)
2. 변경된 파일 git add + commit (메시지: feat/fix/style: 설명)
3. Codex CLI 또는 Claude Code 인계가 필요한 경우 `work.md`에 "다음 작업" 명시

## 디자인 토큰 (절대 준수)
```css
--brand: #1C3C82          /* 브랜드 네이비 */
--s-applied: #2B7FE8      /* 신청완료 */
--s-selected: #00B386     /* 선정됨 */
--s-deadline: #E8A820     /* 마감임박 */
--s-overdue: #E8394A      /* 기간초과 */
--s-not-sel: #8B95A1      /* 미선정 */
--s-completed: #B0B8C1    /* 리뷰완료 */
--screen-pad: 24px        /* 좌우 패딩 */
```
- **HEX 직접 사용 금지** → 토큰 변수명만 사용
- 폰트: 로고 Poppins 800 (`--font-logo`), 앱 전체 Pretendard Variable (`--font-body`)
- UX 라이팅: 해요체 ("저장할게요", "나가는 중이에요")

## 화면 목록 (Antigravity 담당 우선순위)
### P0 — Week 1~2 구현
- SCR-012  캘린더(월간) ← 메인 랜딩
- SCR-012A 캘린더(주간)
- SCR-012B 체험 상세 시트 (F-01~F-13 전체 필드)
- SCR-008C URL 파싱 등록

### P1 — Week 2~3 구현
- SCR-004  탐색(홈) — 공고 목록 + 필터
- SCR-006  체험단 상세 / SCR-006A 인앱 브라우저
- SCR-013  체험단 지도 (Leaflet)
- SCR-009B 알림 설정

### P2 — Week 3~4 구현
- SCR-014  수익 대시보드
- SCR-016  AI 리뷰 초안 바텀시트
- SCR-017  공유 카드 생성 (Canvas)
- SCR-009  마이페이지
- SCR-010  알림 센터

### HOLD (건드리지 말 것)
SCR-018, SCR-019, SCR-020 — 사업자등록 완료 전까지 작업 금지

## data-hide 화면 (건드리지 말 것)
SCR-003D, SCR-007, SCR-008, SCR-009C — 법적 리스크(ADR-001)로 제외.
해당 컴포넌트에 data-hide 속성 유지, 삭제 금지.

## 유저 데이터 격리 원칙
- 모든 소유 데이터에 userId 외래키 필수
- 조회/수정/삭제는 auth() 세션의 userId와 where 절 강제 매칭
- localStorage 기반 공용 저장 금지

## work.md 작업 이력 형식
```
## YYYY-MM-DD (N차)
- 작업자: Antigravity (Google)
- 변경 파일:
  - 경로/파일명 (신규/수정/삭제) — 간단 설명
- 변경 내용:
  - 주요 변경사항 bullet
- 다음 작업: 다음 할 일 한 줄 (Claude Code 인계 필요 시 명시)
```