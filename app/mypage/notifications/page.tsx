'use client';
// SCR-009B 알림 설정 — ref 기준 신규 설계 (TDS v4 기반 구현)
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NotifSetting {
  id: string;
  label: string;
  desc: string;
  iconColor: string;
  iconBg: string;
  icon: React.ReactNode;
  on: boolean;
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 48, height: 28, borderRadius: 14,
        background: on ? 'var(--brand)' : 'var(--bg-chip)',
        position: 'relative', cursor: 'pointer',
        transition: 'background var(--dur-base)',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 4, left: on ? 24 : 4,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', boxShadow: 'var(--shadow-xs)',
        transition: 'left var(--dur-base)',
      }} />
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();

  const [settings, setSettings] = useState<NotifSetting[]>([
    {
      id: 'd3',
      label: 'D-3 마감 알림',
      desc: '리뷰 마감 3일 전에 알려드려요',
      iconColor: 'var(--s-deadline)',
      iconBg: 'var(--s-deadline-bg)',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--s-deadline)" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      on: true,
    },
    {
      id: 'today',
      label: '당일 마감 알림',
      desc: '리뷰 마감 당일 오전 9시에 알려드려요',
      iconColor: 'var(--s-overdue)',
      iconBg: 'var(--s-overdue-bg)',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--s-overdue)" strokeWidth="1.8">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
      ),
      on: true,
    },
    {
      id: 'overdue',
      label: '기간 초과 알림',
      desc: '마감일이 지난 체험단을 알려드려요',
      iconColor: 'var(--s-overdue)',
      iconBg: 'var(--s-overdue-bg)',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--s-overdue)" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
      on: false,
    },
    {
      id: 'selected',
      label: '선정 결과 알림',
      desc: '체험단 선정 결과가 발표되면 알려드려요',
      iconColor: 'var(--s-selected)',
      iconBg: 'var(--s-selected-bg)',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--s-selected)" strokeWidth="1.8">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
      on: true,
    },
  ]);

  const toggle = (id: string) =>
    setSettings(prev => prev.map(s => s.id === id ? { ...s, on: !s.on } : s));

  const handleSave = () => {
    // 실제 저장 로직 자리
    router.back();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0 }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-text)', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', minHeight: 44 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
          알림 설정
        </button>
      </div>

      {/* 알림 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0 120px' }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', padding: '8px 20px 8px', letterSpacing: '0.10em', textTransform: 'uppercase' }}>알림 항목</div>

        <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          {settings.map((s, i) => (
            <div
              key={s.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: i < settings.length - 1 ? '1px solid var(--border)' : 'none',
                minHeight: 64,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              </div>
              <Toggle on={s.on} onChange={() => toggle(s.id)} />
            </div>
          ))}
        </div>

        {/* 알림 시간 안내 */}
        <div style={{ margin: '12px 16px', padding: '12px 14px', background: 'var(--brand-xlight)', borderRadius: 'var(--r-lg)', border: '1px solid var(--brand-light)' }}>
          <div style={{ fontSize: 12, color: 'var(--brand-text)', fontWeight: 600, marginBottom: 4 }}>💡 알림 발송 시간</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            D-3·당일 알림은 오전 9시에 발송돼요.<br/>
            기간 초과 알림은 마감일 다음 날 오전 9시에 발송돼요.
          </div>
        </div>
      </div>

      {/* 저장 버튼 — 하단 고정 CTA */}
      <div style={{ position: 'sticky', bottom: 0, padding: '12px 20px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button
          onClick={handleSave}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '13px 22px', borderRadius: 'var(--r-md)',
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
            cursor: 'pointer', border: 'none',
            background: 'var(--brand)', color: '#fff',
            boxShadow: 'var(--brand-shadow)', width: '100%', minHeight: 44,
          }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
