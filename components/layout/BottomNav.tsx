'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  {
    href: '/explore',
    label: '탐색',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    href: '/revenue',
    label: '수익',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
  {
    href: '/calendar',
    label: '캘린더',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    href: '/mypage',
    label: '마이',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

const HIDDEN_PATHS = ['/splash', '/onboarding', '/login', '/login/email', '/login/verify'];

export default function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return null;
  }

  return (
    <nav
      style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-card)',
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href === '/calendar' && pathname === '/') ||
          (tab.href === '/explore' && pathname === '/map');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 4px 10px',
              cursor: 'pointer',
              gap: 3,
              position: 'relative',
              textDecoration: 'none',
              color: isActive ? 'var(--brand-text)' : 'var(--text-muted)',
            }}
          >
            {/* icon */}
            <div style={{ position: 'relative', color: isActive ? 'var(--brand)' : 'var(--text-muted)' }}>
              {tab.svg}
            </div>
            {/* label */}
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 600 }}>
              {tab.label}
            </span>
            {/* active dot */}
            {isActive && (
              <span style={{
                position: 'absolute',
                bottom: 2,
                width: 4, height: 4,
                borderRadius: '50%',
                background: 'var(--brand)',
              }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
