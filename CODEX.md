# 체체 (CheChé) — CODEX.md
# OpenAI Codex CLI Context File
# CLAUDE.md와 함께 유지. 동기화 기준: CLAUDE.md가 원본.

## 앱 개요
한국 크리에이터를 위한 체험단 올인원 관리 앱 (cheche.co.kr).
Next.js 16 App Router + TypeScript + Prisma + Supabase PostgreSQL.
배포: Vercel (https://cheche-app.vercel.app)

## Codex CLI 전용 역할
Codex CLI는 **단일 파일 또는 좁은 범위의 인텐트 작업**에 집중.

### 주 담당 작업
- `lib/` — 유틸 함수, 파싱 로직 (URL 파싱, 날짜 계산, 상태 전이)
- `types/` — TypeScript 인터페이스, Zod 스키마
- `app/api/` — API Route 단일 엔드포인트 작업
- `prisma/schema.prisma` — 스키마 수정 (마이그레이션 포함)
- 테스트 파일 작성

### 절대 하지 말 것
- 여러 SCR-xxx 화면을 동시에 수정 (Antigravity 담당)
- 아키텍처 리팩토링 (Claude Code 담당)
- HOLD 화면 작업 (SCR-018, SCR-019, SCR-020)
- data-hide 컴포넌트 삭제 또는 수정

## 디자인 토큰 (코드에서 참조 시)
```
--brand: #1C3C82
상태 6종: --s-applied, --s-selected, --s-deadline, --s-overdue, --s-not-sel, --s-completed
패딩: --screen-pad (24px)
```
HEX 직접 사용 금지 → CSS 변수 토큰명만 사용.

## 6단계 상태 시스템 (비즈니스 로직 핵심)
```
신청완료(APPLIED) → 선정됨(SELECTED) → 마감임박(DEADLINE_NEAR, D-3 자동) → 기간초과(OVERDUE, 자동)
                 → 미선정(NOT_SELECTED)
선정됨 → 리뷰완료(COMPLETED, 수동)
```
- DEADLINE_NEAR, OVERDUE는 Vercel Cron 자동 전이 (매일 자정)
- 완료 상태(NOT_SELECTED, COMPLETED)는 수익 집계에서 제외

## 유저 데이터 격리 원칙
```typescript
// 반드시 이 패턴 준수
const campaign = await prisma.campaign.findFirst({
  where: { id: campaignId, userId: session.user.id }  // userId 강제 매칭
})
```

## 작업 완료 후 필수 행동
1. `work.md` 최상단에 작업 이력 추가
2. git commit (형식: `feat/fix/chore: 설명`)
3. 복잡한 멀티파일 작업이 필요해지면 작업 중단 → work.md에 명시 → Claude Code 인계

## work.md 작업 이력 형식
```
## YYYY-MM-DD (N차)
- 작업자: Codex CLI (OpenAI)
- 변경 파일:
  - 경로/파일명 (신규/수정/삭제) — 간단 설명
- 변경 내용:
  - 주요 변경사항 bullet
- 다음 작업: 다음 할 일 한 줄
```
