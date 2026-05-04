'use client';

import { useState, useEffect, useRef } from 'react';

/* ── 상수 ── */
const PLAT_COLOR: Record<string, string> = {
  '레뷰':     '#00B386',
  '강남맛집': '#E8394A',
  '미블':     '#2B7FE8',
  '서울오빠': '#E8A820',
  '티블':     '#1C3C82',
  '링블':     '#2750A8',
};
const CHANNEL_COLOR: Record<string, string> = {
  '블로그':       'var(--brand)',
  '인스타':       'var(--tab-blue)',
  '유튜브':       'var(--s-selected)',
  '블로그 클립':  'var(--s-deadline)',
};

/* ── 데이터 타입 ── */
// 유저별 격리 — 샘플 시드 데이터는 제거. 서버(/api/revenues)가 내 소유 데이터만 반환.
type RevItem = {
  name: string; plat: string; channel: string;
  date: string; goods: number; ad: number; emoji: string;
};

/* 월별 트렌드 — 하드코딩 (2026 상반기) */
const MONTH_BARS = [
  { label: '1월', h: 8,  current: false, future: false },
  { label: '2월', h: 44, current: false, future: false },
  { label: '3월', h: 26, current: false, future: false },
  { label: '4월', h: 57, current: true,  future: false },
  { label: '5월', h: 20, current: false, future: true  },
  { label: '6월', h: 20, current: false, future: true  },
];

/* ── count-up 훅 ── */
function useCountUp(target: number, duration = 600): number {
  const [val, setVal] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);   // ease-out cubic
      setVal(Math.round(target * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

/* ── 유틸 ── */
function fmtK(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1).replace('.0', '') + '만';
  return n.toLocaleString();
}

type Tab = 'current' | 'prev' | 'all';
const TAB_MONTH: Record<Tab, string | null> = {
  current: '2026-04', prev: '2026-03', all: null,
};
const TAB_LABEL: Record<Tab, string> = {
  current: '4월', prev: '3월', all: '전체',
};

/* ════════════════════════════════════════ */
export default function RevenuePage() {
  const [tab, setTab] = useState<Tab>('current');
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addGoods, setAddGoods] = useState('');
  const [userRevs, setUserRevs] = useState<RevItem[]>([]);

  // /api/revenues — 현재 세션 유저가 소유한 수익 항목만 로드 (userId 격리).
  async function refreshRevenues() {
    try {
      const res = await fetch('/api/revenues', { cache: 'no-store' });
      if (!res.ok) { setUserRevs([]); return; }
      const data: Array<{ name: string; plat: string; channel: string; date: string; goods: number; ad: number; emoji: string | null }> = await res.json();
      setUserRevs(data.map(r => ({
        name: r.name, plat: r.plat, channel: r.channel,
        date: r.date, goods: r.goods, ad: r.ad, emoji: r.emoji ?? '💼',
      })));
    } catch {
      setUserRevs([]);
    }
  }
  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void refreshRevenues();
    }, 0);
    // 캘린더에서 캠페인 삭제 후 복귀했을 때 집계가 즉시 재계산되도록 포커스/복귀 시 재조회.
    const onFocus = () => {
      void refreshRevenues();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onFocus);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onFocus);
    };
  }, []);

  // 수익 시트에서 등록 완료 시 POST 후 재조회
  async function handleAddRevenue() {
    const goodsNum = parseInt(addGoods.replace(/[^0-9]/g, '')) || 0;
    if (!addName.trim() || goodsNum <= 0) return;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    await fetch('/api/revenues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: addName.trim(),
        plat: '직접 등록',
        channel: '블로그',
        date: dateStr,
        goods: goodsNum,
        ad: 0,
        emoji: '✍️',
      }),
    });
    await refreshRevenues();
    setAddOpen(false);
    setAddName('');
    setAddGoods('');
  }

  const allRevs = userRevs;
  const mth = TAB_MONTH[tab];
  const filtered = mth ? allRevs.filter(r => r.date.startsWith(mth)) : allRevs;

  const total  = filtered.reduce((s, r) => s + r.goods + r.ad, 0);
  const goods  = filtered.reduce((s, r) => s + r.goods, 0);
  const ad     = filtered.reduce((s, r) => s + r.ad, 0);
  const count  = filtered.length;
  const avg    = count ? Math.round(total / count) : 0;
  const cumul  = allRevs.reduce((s, r) => s + r.goods + r.ad, 0);

  // 전월 대비 (이번 달 탭에서만 표시)
  const prevTotal = allRevs.filter(r => r.date.startsWith('2026-03')).reduce((s, r) => s + r.goods + r.ad, 0);
  const diff = tab === 'current' ? total - prevTotal : null;

  // 채널별 분포
  const chMap: Record<string, number> = {};
  filtered.forEach(r => { chMap[r.channel] = (chMap[r.channel] || 0) + r.goods + r.ad; });
  const chTotal = Object.values(chMap).reduce((s, v) => s + v, 0);
  const channels = Object.entries(chMap).sort((a, b) => b[1] - a[1]);

  // count-up
  const aTotal = useCountUp(total);
  const aGoods = useCountUp(goods);
  const aAd    = useCountUp(ad);
  const aCount = useCountUp(count);
  const aAvg   = useCountUp(avg);

  const avgDisplay = aAvg >= 10000 ? (aAvg / 10000).toFixed(1).replace('.0', '') + 'k' : aAvg.toLocaleString();
  const cumulDisplay = fmtK(cumul);

  const monoLabel: React.CSSProperties = {
    fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600,
    color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: 'var(--bg-page)', position: 'relative' }}>

      {/* ── 헤더 ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {/* 로고 */}
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
        {/* 월 탭 세그먼트 */}
        <div style={{ display: 'flex', background: 'var(--bg-input)', border: '1.5px solid var(--border-mid)', borderRadius: 'var(--r-full)', padding: '3px', gap: '1px' }}>
          {(['current', 'prev', 'all'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '4px 11px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-body)',
                background: tab === t ? 'var(--bg-card)' : 'transparent',
                color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: tab === t ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t === 'current' ? '이번 달' : t === 'prev' ? '지난 달' : '전체'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 스크롤 영역 ── */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>

        {/* ① 총 수익 히어로 카드 */}
        <div style={{ padding: '14px 14px 0' }}>
          <div style={{ background: 'linear-gradient(135deg,#0E2048 0%,#1C3C82 55%,#2750A8 100%)', borderRadius: 'var(--r-2xl)', padding: '20px 22px 18px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--brand-shadow)' }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', bottom: '-20px', left: '60px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
              {TAB_LABEL[tab]} 총 수익
            </div>
            <div style={{ fontSize: '30px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: '4px' }}>
              {aTotal.toLocaleString()}
              <span style={{ fontSize: '16px', fontWeight: 600, marginLeft: '4px', opacity: 0.8 }}>원</span>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', minHeight: '18px' }}>
              {diff !== null && (
                <>
                  전월 대비{' '}
                  <span style={{ color: diff >= 0 ? '#7AFFD4' : '#FF9A9A', fontWeight: 700 }}>
                    {diff >= 0 ? '+' : ''}{diff.toLocaleString()}원 {diff >= 0 ? '↑' : '↓'}
                  </span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              <div style={{ flex: 1, padding: '11px 14px', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '4px' }}>협찬 상품가</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
                  {aGoods.toLocaleString()}원
                </div>
              </div>
              <div style={{ flex: 1, padding: '11px 14px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '4px' }}>광고비</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#7AFFD4', letterSpacing: '-0.3px' }}>
                  {aAd.toLocaleString()}원
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ② 3분할 통계 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', padding: '10px 14px 0' }}>
          <StatCard label="완료" value={String(aCount)} sub="캠페인" valueColor="var(--s-selected)" />
          <StatCard label="평균 단가" value={avgDisplay} sub="원 / 건" valueColor="var(--text-primary)" small />
          <StatCard label="누적" value={cumulDisplay} sub="올해 총 합" valueColor="var(--brand)" small />
        </div>

        {/* ③ 채널별 수익 분포 */}
        <div style={{ margin: '10px 14px 0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '16px 16px 14px', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ ...monoLabel, marginBottom: '12px' }}>채널별 수익 분포</div>
          {chTotal > 0 ? (
            <>
              {/* 스택 바 */}
              <div style={{ display: 'flex', height: '8px', borderRadius: 'var(--r-full)', overflow: 'hidden', gap: '2px', marginBottom: '12px' }}>
                {channels.map(([ch, v], i) => (
                  <div key={ch} style={{
                    flex: v / chTotal * 10,
                    background: CHANNEL_COLOR[ch] ?? 'var(--text-muted)',
                    borderRadius: i === 0 ? 'var(--r-full) 0 0 var(--r-full)'
                                : i === channels.length - 1 ? '0 var(--r-full) var(--r-full) 0' : '0',
                  }} />
                ))}
              </div>
              {/* 범례 */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(channels.length, 3)}, 1fr)`, gap: '6px' }}>
                {channels.map(([ch, v]) => (
                  <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: CHANNEL_COLOR[ch] ?? 'var(--text-muted)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ch}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>{v.toLocaleString()}원</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', color: 'var(--text-muted)' }}>해당 기간 데이터 없음</div>
          )}
        </div>

        {/* ④ 월별 수익 추이 — 하드코딩 바 차트 */}
        <div style={{ margin: '10px 14px 0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '16px 16px 14px', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={monoLabel}>월별 수익 추이</div>
            <span style={{ fontSize: '10px', color: 'var(--brand-text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>2026 상반기</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px' }}>
            {MONTH_BARS.map(m => (
              <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '100%', height: `${m.h}px`, borderRadius: '4px 4px 0 0',
                  background: m.future ? 'var(--bg-page)' : m.current ? 'var(--brand)' : 'var(--brand-light)',
                  border: m.future ? '1.5px dashed var(--border-mid)' : 'none',
                  boxShadow: m.current ? 'var(--brand-shadow)' : 'none',
                }} />
                <span style={{
                  fontSize: '10px', fontFamily: 'var(--font-mono)',
                  fontWeight: m.current ? 700 : 400,
                  color: m.future ? 'var(--text-disabled)' : m.current ? 'var(--brand-text)' : 'var(--text-muted)',
                }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ⑤ 수익 내역 리스트 */}
        <div style={{ padding: '16px 14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {TAB_LABEL[tab]} 수익 내역
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <span style={{ fontSize: '11px', color: 'var(--brand-text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                전체 {filtered.length}건
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💰</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>등록된 수익이 없어요</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>+ 버튼으로 수익을 등록해보세요</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map((r, i) => <RevCard key={i} r={r} />)}
            </div>
          )}
        </div>

        <div style={{ height: '90px' }} />
      </div>

      {/* FAB */}
      <button
        onClick={() => setAddOpen(true)}
        style={{ position: 'absolute', bottom: '16px', right: '20px', width: '52px', height: '52px', borderRadius: '50%', background: 'var(--brand)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(28,60,130,0.38)', zIndex: 10 }}
        aria-label="수익 등록"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" width="22" height="22">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {/* 수익 등록 시트 */}
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-overlay)' }} onClick={() => setAddOpen(false)} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxWidth: '393px', margin: '0 auto', background: 'var(--bg-card)', borderRadius: 'var(--r-sheet) var(--r-sheet) 0 0', padding: '12px 20px 36px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ width: '36px', height: '4px', background: 'var(--bg-chip)', borderRadius: '2px', margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>수익 등록</div>
              <button onClick={() => setAddOpen(false)} style={{ fontSize: '22px', lineHeight: 1, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            </div>
            {[
              { label: '캠페인명 *', placeholder: '캠페인명 입력', value: addName, setter: setAddName, numeric: false },
              { label: '협찬 상품가 *', placeholder: '예) 30,000', value: addGoods, setter: setAddGoods, numeric: true },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={f.value}
                    onChange={e => f.setter(f.numeric ? e.target.value.replace(/[^0-9]/g, '') : e.target.value)}
                    placeholder={f.placeholder}
                    inputMode={f.numeric ? 'numeric' : 'text'}
                    style={{ width: '100%', padding: f.numeric ? '12px 36px 12px 14px' : '12px 14px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border-mid)', background: 'var(--bg-input)', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
                  />
                  {f.numeric && (
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--text-muted)', pointerEvents: 'none' }}>원</span>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={handleAddRevenue}
              style={{ width: '100%', padding: '15px', background: 'var(--brand)', color: 'var(--text-inverse)', border: 'none', borderRadius: 'var(--r-md)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--brand-shadow)', marginTop: '4px', minHeight: 48 }}
            >
              등록할게요
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 하위 컴포넌트 ── */

function StatCard({ label, value, sub, valueColor, small }: {
  label: string; value: string; sub: string; valueColor: string; small?: boolean;
}) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '14px 12px', boxShadow: 'var(--shadow-xs)' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: small ? '18px' : '22px', fontWeight: 800, color: valueColor, letterSpacing: '-0.8px', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>
    </div>
  );
}

function RevCard({ r }: { r: RevItem }) {
  const tot = r.goods + r.ad;
  const pc = PLAT_COLOR[r.plat] ?? 'var(--brand)';
  const [, mm, dd] = r.date.split('-');
  const dateStr = `${parseInt(mm)}월 ${parseInt(dd)}일`;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '14px 16px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
      {/* 왼쪽 컬러 스트라이프 */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: pc, borderRadius: 'var(--r-xl) 0 0 var(--r-xl)' }} />

      {/* 상단: 뱃지·이름 / 총액 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ minWidth: 0, paddingLeft: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: pc, background: pc + '18', borderRadius: 'var(--r-full)', padding: '2px 8px', border: `1px solid ${pc}30` }}>
              {r.plat}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>·</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{r.channel}</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '190px' }}>
            {r.emoji} {r.name}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>{tot.toLocaleString()}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>원</div>
        </div>
      </div>

      {/* 분리선 */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0 -16px 10px' }} />

      {/* 협찬가 / 광고비 */}
      <div style={{ display: 'flex', gap: '8px', paddingLeft: '4px' }}>
        <div style={{ flex: 1, background: 'var(--bg-page)', borderRadius: 'var(--r-sm)', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/>
            </svg>
            협찬가
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>{r.goods.toLocaleString()}원</span>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-page)', borderRadius: 'var(--r-sm)', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
            광고비
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: r.ad ? 'var(--s-selected)' : 'var(--text-muted)', letterSpacing: '-0.3px' }}>
            {r.ad ? r.ad.toLocaleString() + '원' : '—'}
          </span>
        </div>
      </div>

      {/* 날짜 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', paddingLeft: '4px' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{dateStr} 완료</span>
      </div>
    </div>
  );
}
