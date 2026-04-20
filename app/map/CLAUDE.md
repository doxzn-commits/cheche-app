# 체험단 지도 — SCR-013

## 화면 설명
방문형 체험단을 Leaflet 지도에 마커로 표시.
플랫폼별 색상 구분 마커, 카테고리 칩 필터.
마커 탭 시 하단 카드(미니 CampaignCard) 표시.

## 의존성
- leaflet@1.9.4 (CDN 또는 npm)
- react-leaflet 패키지 설치 필요

## 주요 컴포넌트
- MapView: Leaflet 지도 컨테이너
- CampaignMarker: 플랫폼별 색상 마커
- MapFilterChips: 카테고리 필터 칩
- MarkerBottomCard: 마커 선택 시 하단 카드
