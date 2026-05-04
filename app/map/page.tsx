'use client';
// SCR-013 체험단 지도 — ref s013 원본 구조 유지 (react-leaflet, ssr:false)
import dynamic from 'next/dynamic';
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { MapPin } from './MapView';

// SSR 제외 — Leaflet은 browser-only
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 28 }}>🗺️</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>지도 불러오는 중…</div>
    </div>
  ),
});

// ref MAP_PINS 원본 데이터 (5개로 축소 + 전체 18개 보존)
const MAP_PINS: MapPin[] = [
  { id: 'p1',  plat: '레뷰',    cat: '카페', name: '카페투어 강남점 체험단',     area: '강남구 역삼동',   lat: 37.5000, lng: 127.0360, total: 10, applied: 9,  dday: 'D-3',  open: true,  type: '방문형' },
  { id: 'p2',  plat: '강남맛집', cat: '맛집', name: '청담 파스타 레스토랑 체험',   area: '강남구 청담동',   lat: 37.5240, lng: 127.0430, total: 6,  applied: 2,  dday: 'D-9',  open: true,  type: '방문형' },
  { id: 'p3',  plat: '레뷰',    cat: '뷰티', name: '강남 피부과 시술 체험단',     area: '강남구 신사동',   lat: 37.5150, lng: 127.0200, total: 8,  applied: 3,  dday: 'D-8',  open: true,  type: '방문형' },
  { id: 'p4',  plat: '미블',    cat: '숙박', name: '한강뷰 호텔 1박 2일 체험',   area: '영등포구 여의도', lat: 37.5280, lng: 126.9241, total: 3,  applied: 3,  dday: 'D-12', open: true,  type: '방문형' },
  { id: 'p5',  plat: '서울오빠', cat: '맛집', name: '이태원 브런치 카페 체험',    area: '용산구 이태원',   lat: 37.5344, lng: 126.9938, total: 8,  applied: 4,  dday: 'D-5',  open: true,  type: '방문형' },
  { id: 'p6',  plat: '디너의여왕',cat: '맛집', name: '판교 오마카세 신메뉴 체험', area: '분당구 삼평동',   lat: 37.4010, lng: 127.1108, total: 5,  applied: 4,  dday: 'D-5',  open: true,  type: '방문형' },
  { id: 'p7',  plat: '레뷰',    cat: '카페', name: '성수 스페셜티 커피 체험단',   area: '성동구 성수동',   lat: 37.5447, lng: 127.0564, total: 12, applied: 11, dday: 'D-7',  open: true,  type: '방문형' },
  { id: 'p8',  plat: '강남맛집', cat: '뷰티', name: '청담 에스테틱 체험단',       area: '강남구 청담동',   lat: 37.5246, lng: 127.0430, total: 6,  applied: 2,  dday: 'D-9',  open: true,  type: '방문형' },
  { id: 'p9',  plat: '티블',    cat: '맛집', name: '경리단길 타코 맛집 체험',     area: '용산구 이태원',   lat: 37.5354, lng: 126.9862, total: 4,  applied: 1,  dday: 'D-9',  open: true,  type: '방문형' },
  { id: 'p10', plat: '미블',    cat: '카페', name: '망원동 브런치 카페 신메뉴',   area: '마포구 망원동',   lat: 37.5571, lng: 126.9041, total: 8,  applied: 6,  dday: 'D-16', open: true,  type: '방문형' },
  { id: 'p11', plat: '서울오빠', cat: '숙박', name: '연남동 감성 호텔 숙박',      area: '마포구 연남동',   lat: 37.5600, lng: 126.9226, total: 3,  applied: 1,  dday: 'D-11', open: true,  type: '방문형' },
  { id: 'p12', plat: '강남맛집', cat: '맛집', name: '잠실 한우 정육식당 체험',    area: '송파구 잠실동',   lat: 37.5123, lng: 127.1000, total: 6,  applied: 5,  dday: 'D-4',  open: true,  type: '방문형' },
  { id: 'p13', plat: '레뷰',    cat: '뷰티', name: '강남 왁싱샵 뷰티 체험단',    area: '강남구 역삼동',   lat: 37.5031, lng: 127.0190, total: 15, applied: 14, dday: 'D-3',  open: true,  type: '방문형' },
  { id: 'p14', plat: '디너의여왕',cat: '맛집', name: '서촌 한식 정식 체험단',    area: '종로구 체부동',   lat: 37.5793, lng: 126.9696, total: 5,  applied: 2,  dday: 'D-14', open: true,  type: '방문형' },
  { id: 'p15', plat: '레뷰',    cat: '맛집', name: '종로 한정식 점심 체험단',     area: '종로구 관훈동',   lat: 37.5730, lng: 126.9890, total: 4,  applied: 1,  dday: 'D-6',  open: true,  type: '방문형' },
  { id: 'p16', plat: '미블',    cat: '숙박', name: '남산 뷰 호텔 숙박 체험단',   area: '중구 명동',       lat: 37.5511, lng: 126.9882, total: 2,  applied: 1,  dday: 'D-10', open: true,  type: '방문형' },
  { id: 'p17', plat: '링블',    cat: '카페', name: '합정 디저트 카페 포토',       area: '마포구 합정동',   lat: 37.5491, lng: 126.9143, total: 6,  applied: 4,  dday: 'D-7',  open: true,  type: '방문형' },
  { id: 'p18', plat: '놀러와',  cat: '맛집', name: '신촌 맛집 투어 블로그 체험',  area: '서대문구 창천동', lat: 37.5570, lng: 126.9370, total: 5,  applied: 2,  dday: 'D-9',  open: true,  type: '방문형' },
];

const CATS = ['전체', '맛집', '카페', '뷰티', '숙박', '생활'] as const;

function ddayColor(dday: string): string {
  const n = parseInt(dday.replace('D-', ''));
  if (dday.startsWith('D-') && n <= 3) return 'var(--s-overdue)';
  if (dday.startsWith('D-') && n <= 7) return 'var(--s-deadline)';
  return 'var(--text-muted)';
}

export default function MapPage() {
  const router = useRouter();
  const [cat, setCat] = useState<string>('전체');
  const [selected, setSelected] = useState<MapPin | null>(null);

  const filtered = useMemo(
    () => cat === '전체' ? MAP_PINS : MAP_PINS.filter(p => p.cat === cat),
    [cat]
  );

  const handleSelect = useCallback((pin: MapPin) => {
    setSelected(pin);
  }, []);

  const handleCat = (c: string) => {
    setCat(c);
    setSelected(null);
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 12, fontWeight: 600,
    padding: '5px 13px', borderRadius: 'var(--r-full)',
    border: `1px solid ${active ? 'var(--brand)' : 'var(--border-mid)'}`,
    background: active ? 'var(--brand)' : 'var(--bg-card)',
    color: active ? '#fff' : 'var(--text-secondary)',
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    boxShadow: active ? 'var(--brand-shadow)' : 'none',
    transition: 'all var(--dur-fast)', fontFamily: 'var(--font-body)',
  });

  const shortage = selected && (selected.total - selected.applied) <= 2 && selected.open;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* 헤더 — ref s013 원본 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 10px',
        background: 'var(--bg-card)', flexShrink: 0,
        borderBottom: '1px solid var(--border)',
      }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: 'var(--brand-text)', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', fontFamily: 'var(--font-body)', minHeight: 44 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
          내 주변 체험단
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>서울 · 현재 위치</span>
      </div>

      {/* 카테고리 필터 칩 — ref .map-chip */}
      <div style={{
        display: 'flex', gap: 6, padding: '10px 14px',
        overflowX: 'auto', flexShrink: 0,
        background: 'var(--bg-card)',
        scrollbarWidth: 'none',
      }}>
        {CATS.map(c => (
          <button key={c} onClick={() => handleCat(c)} style={chipStyle(cat === c)}>{c}</button>
        ))}
      </div>

      {/* 지도 — flex:1 채우기 */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        <MapView
          pins={filtered}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
        />
      </div>

      {/* 하단 카드 오버레이 — ref 원본 position:absolute */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, pointerEvents: 'none' }}>

        {/* 선택된 캠페인 카드 — ref #map-card */}
        {selected && (
          <div style={{
            margin: '0 14px 14px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-lg)',
            padding: '14px 16px',
            border: '1px solid var(--border-mid)',
            pointerEvents: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* 뱃지 행 */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-full)', background: 'var(--brand-light)', color: 'var(--brand-text)' }}>{selected.plat}</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--r-full)', background: 'var(--bg-chip)', color: 'var(--text-secondary)', border: '1px solid var(--border-mid)' }}>{selected.cat}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--r-full)', background: 'var(--s-applied-bg)', color: 'var(--s-applied)' }}>{selected.type}</span>
                  {shortage && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--r-full)', background: 'var(--s-overdue-bg)', color: 'var(--s-overdue)' }}>인원부족</span>
                  )}
                </div>
                {/* 캠페인명 */}
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4, letterSpacing: '-0.2px' }}>{selected.name}</div>
                {/* 메타 */}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  📍 {selected.area} · 👥 {selected.applied}/{selected.total}명
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: ddayColor(selected.dday) }}>{selected.dday}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s-selected)', marginTop: 2 }}>신청 가능</div>
              </div>
            </div>
            <button
              onClick={() => router.push(`/explore/${selected.id}`)}
              style={{ width: '100%', marginTop: 10, padding: 11, background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 'var(--r-lg)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--brand-shadow)' }}
            >
              상세 보기
            </button>
            {/* 닫기 */}
            <button
              onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-chip)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* 힌트 카드 — 마커 미선택 시 표시 (ref #map-hint) */}
        {!selected && (
          <div style={{
            margin: '0 14px 14px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-md)',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: '1px solid var(--border)',
            pointerEvents: 'auto',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                내 주변 <span style={{ color: 'var(--brand-text)' }}>{filtered.length}</span>개 체험단
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>마커를 탭해서 상세 정보를 확인하세요</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00B386' }} />레뷰
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8394A' }} />강남맛집
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
