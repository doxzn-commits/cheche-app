# 수익 대시보드 — SCR-014

## 화면 설명
월별 협찬 금액 집계 화면. 하단 탭바 두 번째 탭.
"이번 달 XXX원 아꼈어요" 동기부여 메시지 표시.
완료된 캠페인 내역 리스트 포함.

## 집계 구조
- 협찬 상품가 (F-05 합산)
- 완료 캠페인 수 (--s-completed 상태)
- 월별 추이

## 주요 컴포넌트
- MonthlySummaryCard: 이번 달 절약 금액 히어로 카드
- CompletedCampaignList: 완료 캠페인 내역
- MonthSelector: 월 선택 (이전/다음)
