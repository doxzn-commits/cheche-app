# 캘린더 — SCR-012 / SCR-012A / SCR-012B

## 화면 설명
앱 기본 탭 (메인 랜딩). 선정된 체험단의 체험일자·리뷰 마감일을 캘린더로 시각화.
SCR-012: 월간 뷰 / SCR-012A: 주간 뷰 / SCR-012B: 체험 상세 시트 (바텀시트)

## 이벤트 타입 & 색상
- 리뷰 마감: --tab-red (#E8394A)
- 체험 일자: --s-selected (#00B386)
- 선정 발표: --tab-blue (Phase 2, data-hide)
- 신청 마감: --tab-yellow (Phase 2, data-hide)

## 상태 6종
신청완료(--s-applied) / 선정됨(--s-selected) / 마감임박(--s-deadline) /
기간초과(--s-overdue) / 미선정(--s-not-sel) / 리뷰완료(--s-completed)

## v1.1 변경사항 (SCR-012B)
- F-08 주말방문: 기본값 없음 (미선택 허용)
- F-08A 예약여부: 예정/완료/불필요 3단계 신규 추가
- 액션바: 🗑️삭제 / ✏️편집 / ✕닫기
- 편집 모드: 전체 필드 인라인 수정
- 메모(F-12): 항상 즉시 편집 가능

## 주요 컴포넌트
- MonthlyCalendar: 월간 그리드 (SCR-012)
- WeeklyCalendar: 주간 리스트 (SCR-012A)
- CalendarFilterChips: 이벤트 타입 ON/OFF
- CampaignDetailSheet: 바텀시트 (SCR-012B)
- StatusBadge: 6종 상태 뱃지
