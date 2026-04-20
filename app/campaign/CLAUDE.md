# 체험단 상세 — SCR-006 / SCR-006A

## 화면 설명
탐색 탭에서 공고 카드 탭 시 노출되는 상세 정보 화면.
혜택·가이드라인·신청 CTA 포함.
SCR-006A: 외부 플랫폼으로 이동하는 인앱 브라우저 (WebView).
체체 서버 비개입 — 법적 안전 원칙 준수.

## 관련 화면
- SCR-004 탐색(홈) ← 진입점
- SCR-008C URL 파싱 등록 → 선정 후 등록 CTA

## 주요 컴포넌트
- CampaignDetailHeader: 플랫폼 뱃지·제목·혜택
- GuidelineBlock: 가이드라인 섹션
- ApplyCTA: 신청하기 버튼 (외부 플랫폼 이동)
- InAppBrowser: WebView 래퍼 (SCR-006A)
