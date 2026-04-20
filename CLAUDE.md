# 체체 (CheChé) — 프로젝트 컨텍스트

## 앱 개요
한국 크리에이터를 위한 체험단 올인원 관리 앱.
레뷰·강남맛집·미블 등 여러 플랫폼의 체험단 선정 내역을 한 곳에서 관리.
타겟: 2030 여성 크리에이터 / 디자인 방향: 토스(Toss) 스타일

## 화면 목록
- SCR-001  스플래시
- SCR-002  온보딩 (3장 슬라이드)
- SCR-003  로그인 (소셜 3종 + 이메일)
- SCR-003A 이메일 가입
- SCR-003B 이메일 인증 (6자리 코드)
- SCR-004  탐색(홈) — 체험단 공고 목록, 다중 필터
- SCR-006  체험단 상세 — 공고 상세, 신청 CTA
- SCR-006A 인앱 브라우저 (WebView)
- SCR-008C URL 파싱 등록 (방법 A)
- SCR-009  마이페이지
- SCR-009A 채널 설정
- SCR-009B 알림 설정
- SCR-010  알림 센터
- SCR-011  에러/빈 화면 (6종)
- SCR-012  캘린더(월간) ← 기본 탭 / 메인 랜딩
- SCR-012A 캘린더(주간)
- SCR-012B 체험 상세 시트 (v1.1: 편집 기능 추가)
- SCR-013  체험단 지도 (Leaflet)
- SCR-014  수익 대시보드

## data-hide 화면 (건드리지 말 것)
SCR-003D, SCR-007, SCR-008, SCR-009C — 법적 리스크(ADR-001)로 Phase 1 제외.
복구 방법은 ref/체체_앱_최종.html 상단 주석 참조.

## 디자인 토큰
styles/tokens.css 참조. 변수명은 앱_최종.html 기준.
- 브랜드: --brand (#1C3C82)
- 배경: --bg-page, --bg-card
- 텍스트: --text-primary, --text-secondary, --text-muted
- 상태 6종: --s-applied, --s-selected, --s-deadline, --s-overdue, --s-not-sel, --s-completed

## 작업 규칙
- HEX 직접 사용 금지 → 토큰 변수명만 사용
- 좌우 패딩 24px 일관 적용 (--screen-pad)
- 터치 타겟 최소 44×44px
- 해요체 UX 라이팅
- 폰트: 로고 Poppins 800 (--font-logo), 앱 전체 Pretendard Variable (--font-body)
- ref/ 폴더는 참조 전용 — 배포 무관
- v1.1 변경사항: F-08 미선택 허용, F-08A 예약여부 3단계 신규
