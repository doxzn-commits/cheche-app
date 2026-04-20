# components/ — 공통 컴포넌트

## 디렉토리 구조
- components/ui/       공통 UI 원자 컴포넌트 (버튼·뱃지·칩·인풋 등)
- components/layout/   레이아웃 컴포넌트 (헤더·바텀탭·바텀시트 등)

## ui/ 예정 컴포넌트
- Button: Primary / Secondary / Ghost 3종
- StatusBadge: 체험단 상태 6종 (--s-* 토큰 사용)
- FilterChip: ON/OFF 토글 칩
- CampaignCard: 공고 카드
- Input: 텍스트·날짜·전화번호 인풋

## layout/ 예정 컴포넌트
- BottomNav: 하단 탭바 4탭 (탐색·수익·캘린더·마이)
- AppHeader: 상단 헤더 (로고·알림·뒤로가기)
- BottomSheet: 바텀시트 공통 래퍼 (--r-sheet: 20px)

## 작업 규칙
- 컴포넌트 파일명: PascalCase.tsx
- CSS 변수만 사용 (HEX 금지)
- 터치 타겟 최소 44×44px
