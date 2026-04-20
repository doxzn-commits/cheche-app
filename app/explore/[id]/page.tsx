'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { CAMPS } from '../_camps';

export default function ExploreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const camp = CAMPS.find(c => c.id === id);
  const [showBrowser, setShowBrowser] = useState(false);

  if (!camp) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px', padding: '40px 24px' }}>
        <div style={{ fontSize: '48px' }}>🔍</div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>체험단을 찾을 수 없어요</div>
        <button
          onClick={() => router.back()}
          style={{ marginTop: '8px', padding: '11px 24px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 'var(--r-lg)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--brand-shadow)' }}
        >
          돌아가기
        </button>
      </div>
    );
  }

  const heroBg = camp.type === '방문형' ? 'var(--s-applied-bg)' : camp.type === '배송형' ? 'var(--s-selected-bg)' : 'var(--bg-card-inner)';
  const ddayBg = camp.ddayCls === 'var(--s-overdue)' ? 'var(--s-overdue-bg)' : camp.ddayCls === 'var(--s-deadline)' ? 'var(--s-deadline-bg)' : 'var(--bg-chip)';

  // ── SCR-006A 인앱 브라우저 ──
  if (showBrowser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <button
            onClick={() => setShowBrowser(false)}
            style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-sm)', color: 'var(--text-secondary)', flexShrink: 0 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div style={{ flex: 1, background: 'var(--bg-input)', borderRadius: 'var(--r-sm)', padding: '7px 12px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {camp.url}
          </div>
        </div>
        <iframe
          src={camp.url}
          style={{ flex: 1, border: 'none', width: '100%' }}
          title={camp.name}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    );
  }

  // ── SCR-006 체험단 상세 ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', background: 'var(--bg-card)', flexShrink: 0 }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', padding: '5px 0', fontFamily: 'var(--font-body)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          뒤로
        </button>
        <button style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-sm)', color: 'var(--text-secondary)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </div>

      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        {/* 히어로 */}
        <div style={{ height: '200px', background: heroBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px' }}>
          {camp.emoji}
        </div>

        {/* 타이틀 섹션 */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-full)', background: 'var(--brand-light)', color: 'var(--brand-text)' }}>{camp.plat}</span>
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--r-full)', background: 'var(--bg-chip)', color: 'var(--text-secondary)', border: '1px solid var(--border-mid)' }}>{camp.cat}</span>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: 'var(--r-full)', background: ddayBg, color: camp.ddayCls, fontFamily: 'var(--font-mono)' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: camp.ddayCls, flexShrink: 0 }} />
              {camp.dday}
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4, letterSpacing: '-0.5px' }}>
            {camp.name}
          </div>
        </div>

        {/* 체험 정보 카드 */}
        <div style={{ background: 'var(--bg-card-inner)', margin: '0 20px 16px', borderRadius: 'var(--r-lg)', padding: '14px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            체험 정보
          </div>
          {([
            { label: '지역',      value: camp.area,             accent: false },
            { label: '채널',      value: camp.channel,          accent: false },
            { label: '모집 인원', value: `${camp.total}명`,     accent: false },
            { label: '신청 기간', value: camp.period,           accent: false },
            { label: '리뷰 마감', value: camp.reviewDeadline,   accent: true  },
          ] as const).map((row, i) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{row.label}</span>
              <span style={{ fontSize: '13px', fontWeight: row.accent ? 700 : 600, color: row.accent ? camp.ddayCls : 'var(--text-primary)', fontFamily: row.accent ? 'var(--font-mono)' : undefined }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* 혜택 내용 */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            혜택 내용
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.7, background: 'var(--bg-card-inner)', padding: '12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', whiteSpace: 'pre-line' }}>
            {camp.benefits}
          </div>
        </div>
      </div>

      {/* 고정 CTA */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => setShowBrowser(true)}
          style={{ width: '100%', padding: '15px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: 'var(--brand-shadow)' }}
        >
          체험단 신청하기 →
        </button>
      </div>
    </div>
  );
}
