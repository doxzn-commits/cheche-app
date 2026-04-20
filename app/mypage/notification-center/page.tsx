'use client';
// SCR-010 알림 센터 — ref s010 원본 구조 유지
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Notif {
  id: string;
  group: '오늘' | '어제';
  type: 'red' | 'blue' | 'green' | 'yellow';
  title: React.ReactNode;
  time: string;
  link: string;
  unread: boolean;
  // [data-hide] 태그 여부
  dataHide?: string;
}

// 알림 아이콘 컴포넌트
const NotifIcon = ({ type }: { type: Notif['type'] }) => {
  const cfg = {
    red:    { bg: 'var(--s-overdue-bg)',   stroke: 'var(--s-overdue)' },
    blue:   { bg: 'var(--s-applied-bg)',   stroke: 'var(--s-applied)' },
    green:  { bg: 'var(--s-selected-bg)',  stroke: 'var(--s-selected)' },
    yellow: { bg: 'var(--s-deadline-bg)',  stroke: 'var(--s-deadline)' },
  }[type];

  const icons: Record<Notif['type'], React.ReactNode> = {
    red: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cfg.stroke} strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    blue: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cfg.stroke} strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    green: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cfg.stroke} strokeWidth="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    yellow: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cfg.stroke} strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
      </svg>
    ),
  };

  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icons[type]}
    </div>
  );
};

// 하드코딩 알림 샘플 — ref s010 원본 구조
const INITIAL_NOTIFS: Notif[] = [
  {
    id: 'n1',
    group: '오늘',
    type: 'red',
    title: <>카페투어 강남점 리뷰 마감 <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--s-overdue)', fontWeight: 700 }}>D-3</span></>,
    time: '09:00',
    link: '/explore/1',
    unread: true,
  },
  {
    id: 'n2',
    group: '오늘',
    type: 'red',
    title: <>뷰티 파우더 체험단 리뷰 마감 <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--s-overdue)', fontWeight: 700 }}>D-1</span></>,
    time: '09:00',
    link: '/explore/2',
    unread: true,
  },
  // [data-hide="reconnect-notif"] 복구: data-hide 속성 제거 + style display 제거
  // {
  //   id: 'n-hide',
  //   group: '오늘',
  //   type: 'yellow',
  //   title: '강남맛집 플랫폼 재연동이 필요해요',
  //   time: '08:00',
  //   link: '/mypage/platforms',
  //   unread: false,
  //   dataHide: 'reconnect-notif',
  // },
  {
    id: 'n3',
    group: '어제',
    type: 'green',
    title: '레뷰 뷰티 체험단 선정 결과 발표',
    time: '18:00',
    link: '/explore/3',
    unread: false,
  },
  {
    id: 'n4',
    group: '어제',
    type: 'blue',
    title: <>한강뷰 호텔 선정 발표 <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--s-applied)', fontWeight: 700 }}>D-3</span></>,
    time: '09:00',
    link: '/explore/4',
    unread: false,
  },
  {
    id: 'n5',
    group: '어제',
    type: 'red',
    title: <>숙박 체험단 신청 마감 <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--s-overdue)', fontWeight: 700 }}>D-day</span></>,
    time: '07:00',
    link: '/explore/5',
    unread: false,
  },
];

export default function NotificationCenterPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);

  const markRead = (id: string) =>
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));

  const markAllRead = () =>
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })));

  const handleClick = (n: Notif) => {
    markRead(n.id);
    router.push(n.link);
  };

  const unreadCount = notifs.filter(n => n.unread).length;

  // 그룹별로 분리
  const groups: Array<{ label: string; items: Notif[] }> = [
    { label: '오늘', items: notifs.filter(n => n.group === '오늘') },
    { label: '어제', items: notifs.filter(n => n.group === '어제') },
  ].filter(g => g.items.length > 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', overflow: 'hidden' }}>

      {/* 헤더 — ref s010 app-header 구조 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 10px', background: 'var(--bg-card)', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-text)', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', minHeight: 44 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
          알림
          {unreadCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--s-overdue)', color: '#fff', padding: '1px 6px', borderRadius: 'var(--r-full)', marginLeft: 4 }}>
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={markAllRead}
          style={{ fontSize: 11, color: 'var(--brand-text)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 600, minHeight: 44, padding: '0 4px' }}
        >
          전체 읽음
        </button>
      </div>

      {/* 알림 목록 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {groups.map(({ label, items }) => (
          <div key={label}>
            {/* 날짜 그룹 헤더 — ref .notif-date */}
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', padding: '12px 20px 6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {label}
            </div>

            {items.map(n => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex', gap: 12, padding: '13px 20px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: n.unread ? 'var(--brand-xlight)' : 'var(--bg-card)',
                  transition: 'background var(--dur-fast)',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = n.unread ? 'var(--brand-light)' : 'var(--bg-page)')}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = n.unread ? 'var(--brand-xlight)' : 'var(--bg-card)')}
              >
                <NotifIcon type={n.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: n.unread ? 600 : 500, color: 'var(--text-primary)', marginBottom: 2, lineHeight: 1.4 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{n.time}</div>
                </div>
                {/* 안읽음 표시 점 */}
                {n.unread && (
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0, marginTop: 5 }} />
                )}
              </div>
            ))}
          </div>
        ))}

        {/* 빈 상태 */}
        {notifs.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', textAlign: 'center', gap: 10 }}>
            <div style={{ fontSize: 36, opacity: 0.45 }}>🔔</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>알림이 없어요</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>새 알림이 오면 여기에 표시돼요</div>
          </div>
        )}

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
