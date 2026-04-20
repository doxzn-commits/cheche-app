'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CAMPS, Camp } from './_camps';

export default function ExplorePage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [filterOpen, setFilterOpen] = useState(true);
  const [media, setMedia] = useState('all');
  const [type, setType] = useState('all');
  const [cat, setCat] = useState('all');
  const [site, setSite] = useState('all');
  const [shortage, setShortage] = useState(false);
  const [headerShadow, setHeaderShadow] = useState(false);

  const filtered = useMemo(() => {
    return CAMPS.filter(c => {
      if (keyword && !c.name.includes(keyword) && !c.area.includes(keyword) && !c.plat.includes(keyword)) return false;
      if (media !== 'all' && !c.media.includes(media)) return false;
      if (type !== 'all' && c.type !== type) return false;
      if (cat !== 'all' && c.cat !== cat) return false;
      if (site !== 'all' && c.plat !== site) return false;
      if (shortage && (c.total - c.applied) > 2) return false;
      return true;
    });
  }, [keyword, media, type, cat, site, shortage]);

  function chipStyle(active: boolean, isSite = false): React.CSSProperties {
    const base: React.CSSProperties = {
      fontSize: '11px', fontWeight: 600, padding: '5px 12px',
      borderRadius: 'var(--r-full)', cursor: 'pointer',
      whiteSpace: 'nowrap', fontFamily: 'var(--font-body)',
      background: 'none', transition: 'all 0.11s',
    };
    if (active && isSite) return { ...base, background: 'var(--bg-chip)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)' };
    if (active) return { ...base, background: 'var(--brand-light)', color: 'var(--brand-text)', border: '1px solid var(--brand)' };
    return { ...base, background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-mid)' };
  }

  const groupLabel: React.CSSProperties = {
    fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600,
    color: 'var(--text-muted)', letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: '5px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* ── 헤더 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 10px', background: 'var(--bg-card)', flexShrink: 0,
        boxShadow: headerShadow ? 'var(--shadow-sm)' : 'none',
        transition: 'box-shadow 0.2s', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--brand)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 22 22" fill="none" width="16" height="16">
              <rect x="1" y="4" width="16" height="15" rx="3" fill="white" opacity="0.95"/>
              <rect x="5" y="1.5" width="2" height="5" rx="1" fill="white" opacity="0.8"/>
              <rect x="11" y="1.5" width="2" height="5" rx="1" fill="white" opacity="0.8"/>
              <rect x="17.5" y="5" width="3.5" height="4" rx="1" fill="#E8394A"/>
              <rect x="17.5" y="15" width="3.5" height="4" rx="1" fill="#E8A820"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-logo)', fontWeight: 800, fontSize: '18px', color: 'var(--brand)', letterSpacing: '-0.5px' }}>cheche</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {/* 지도 아이콘 → /map */}
          <button
            onClick={() => router.push('/map')}
            title="체험단 지도"
            style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-sm)', color: 'var(--text-secondary)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </button>
          {/* 알림 아이콘 → /mypage/notification-center */}
          <button
            onClick={() => router.push('/mypage/notification-center')}
            title="알림"
            style={{ position: 'relative', width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-sm)', color: 'var(--text-secondary)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--s-overdue)' }} />
          </button>
        </div>
      </div>

      {/* ── 검색바 ── */}
      <div style={{ margin: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input)', borderRadius: 'var(--r-lg)', padding: '12px 16px', flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="수원 맛집, 뷰티샵, 밀키트…"
          style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
        />
      </div>

      {/* ── 필터 패널 ── */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 6px' }}>
          <button
            onClick={() => setFilterOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--text-primary)', border: 'none', borderRadius: 'var(--r-full)', padding: '5px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: 'var(--text-inverse)', fontFamily: 'var(--font-body)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            <span>{filterOpen ? '접기' : '필터'}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: filterOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
          <button
            onClick={() => setShortage(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              border: shortage ? '1px solid var(--s-overdue)' : '1px solid var(--border-mid)',
              borderRadius: 'var(--r-full)', padding: '5px 12px', cursor: 'pointer',
              fontSize: '11px', fontWeight: 600,
              color: shortage ? 'var(--s-overdue)' : 'var(--text-secondary)',
              background: shortage ? 'var(--s-overdue-bg)' : 'var(--bg-card)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            인원부족 체험단
          </button>
        </div>

        {filterOpen && (
          <div style={{ padding: '4px 16px 10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 리뷰 매체 */}
            <div>
              <div style={groupLabel}>리뷰 매체</div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {(['all', '블로그', '인스타', '유튜브', '블로그클립', '릴스'] as const).map(v => (
                  <button key={v} onClick={() => setMedia(v)} style={chipStyle(media === v)}>
                    {v === 'all' ? '전체' : v === '블로그클립' ? '블로그 클립' : v === '릴스' ? '인스타 릴스' : v}
                  </button>
                ))}
              </div>
            </div>
            {/* 체험단 타입 */}
            <div>
              <div style={groupLabel}>체험단 타입</div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {(['all', '방문형', '배송형', '기자단'] as const).map(v => (
                  <button key={v} onClick={() => setType(v)} style={chipStyle(type === v)}>
                    {v === 'all' ? '전체' : v}
                  </button>
                ))}
              </div>
            </div>
            {/* 카테고리 */}
            <div>
              <div style={groupLabel}>카테고리</div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {(['all', '맛집', '카페', '뷰티', '숙박', '생활', '패션'] as const).map(v => (
                  <button key={v} onClick={() => setCat(v)} style={chipStyle(cat === v)}>
                    {v === 'all' ? '전체' : v}
                  </button>
                ))}
              </div>
            </div>
            {/* 체험단 사이트 */}
            <div>
              <div style={groupLabel}>체험단 사이트</div>
              <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
                {(['all', '레뷰', '미블', '리뷰노트', '강남맛집', '서울오빠', '디너의여왕', '티블', '링블', '놀러와'] as const).map(v => (
                  <button key={v} onClick={() => setSite(v)} style={{ ...chipStyle(site === v, true), flexShrink: 0 }}>
                    {v === 'all' ? '전체' : v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 정렬 행 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px 8px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          총 <b style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{filtered.length}</b>개
        </span>
        <span style={{ fontSize: '12px', color: 'var(--brand-text)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>마감일순 ▾</span>
      </div>

      {/* ── 공고 목록 ── */}
      <div
        style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-card)' }}
        onScroll={e => setHeaderShadow((e.target as HTMLDivElement).scrollTop > 0)}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>조건에 맞는 체험단이 없어요</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>필터를 조정해 보세요</div>
          </div>
        ) : (
          filtered.map(c => (
            <CampCard key={c.id} camp={c} onClick={() => router.push(`/explore/${c.id}`)} />
          ))
        )}
      </div>
    </div>
  );
}

function CampCard({ camp: c, onClick }: { camp: Camp; onClick: () => void }) {
  const rem = c.total - c.applied;
  const shortage = c.open && rem <= 2;
  const typeBg = c.type === '방문형' ? 'var(--s-applied-bg)' : c.type === '배송형' ? 'var(--s-selected-bg)' : 'var(--s-not-sel-bg)';
  const typeColor = c.type === '방문형' ? 'var(--s-applied)' : c.type === '배송형' ? 'var(--s-selected)' : 'var(--s-not-sel)';

  return (
    <div
      onClick={onClick}
      style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg-card)' }}
    >
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-full)', background: 'var(--brand-light)', color: 'var(--brand-text)' }}>{c.plat}</span>
          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--r-full)', background: 'var(--bg-chip)', color: 'var(--text-secondary)', border: '1px solid var(--border-mid)' }}>{c.cat}</span>
          <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: 'var(--r-full)', background: typeBg, color: typeColor, fontWeight: 700 }}>{c.type}</span>
          {c.media.map(m => (
            <span key={m} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: 'var(--r-full)', background: 'var(--bg-chip)', color: 'var(--text-secondary)', border: '1px solid var(--border-mid)' }}>{m}</span>
          ))}
          {shortage && (
            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: 'var(--r-full)', background: 'var(--s-overdue-bg)', color: 'var(--s-overdue)', fontWeight: 700 }}>인원부족</span>
          )}
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: c.ddayCls, fontFamily: 'var(--font-mono)' }}>{c.dday}</span>
      </div>
      <div style={{
        fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)',
        lineHeight: 1.4, marginBottom: '6px', marginTop: '6px',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', letterSpacing: '-0.2px',
      }}>
        {c.emoji} {c.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>📍 {c.area}</span>
        <span>👥 {c.applied}/{c.total}명 신청</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>마감 {c.date}</span>
        <span style={{ fontSize: '11px', fontWeight: c.open ? 700 : 400, color: c.open ? 'var(--s-selected)' : 'var(--text-muted)' }}>
          {c.open ? (shortage ? `잔여 ${rem}명` : '신청 가능') : '마감'}
        </span>
      </div>
    </div>
  );
}
