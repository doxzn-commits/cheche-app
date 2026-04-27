'use client';
// SCR-009 계정 정보 — 이름·이메일·가입 방법·가입일 표시
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PROVIDER_LABEL: Record<string, string> = {
  kakao: '카카오',
  naver: '네이버',
  google: '구글',
  email: '이메일',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 20px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg-card)', minHeight: 52,
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userInfo, setUserInfo] = useState<{ provider: string | null; createdAt: string } | null>(null);

  const user = session?.user;

  useEffect(() => {
    fetch('/api/user/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setUserInfo(data))
      .catch(() => {});
  }, []);

  const initial = (user?.name?.trim().charAt(0) || user?.email?.charAt(0) || '체').toUpperCase();
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || '크리에이터';

  const providerLabel = userInfo?.provider
    ? (PROVIDER_LABEL[userInfo.provider] ?? userInfo.provider)
    : (status === 'loading' ? '—' : '—');

  const createdAtLabel = userInfo?.createdAt
    ? new Date(userInfo.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-page)', overflowY: 'auto' }}>

      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 20px 10px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)', flexShrink: 0,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: 'var(--brand-text)', fontSize: 14, fontWeight: 600,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', minHeight: 44,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          계정 정보
        </button>
      </div>

      {/* 아바타 + 이름 */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 20px 24px', background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}>
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            referrerPolicy="no-referrer"
            style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--border-mid)' }}
          />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(155deg, var(--brand-pressed) 0%, var(--brand) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-body)',
          }}>
            {status === 'loading' ? '' : initial}
          </div>
        )}
        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginTop: 12, fontFamily: 'var(--font-body)', letterSpacing: '-0.4px' }}>
          {status === 'loading' ? '불러오는 중…' : displayName}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
          {user?.email || ''}
        </div>
      </div>

      {/* 계정 정보 */}
      <div style={{ height: 8, background: 'var(--bg-page)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', padding: '14px 20px 8px', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
        계정
      </div>
      <InfoRow label="이름" value={status === 'loading' ? '—' : displayName} />
      <InfoRow label="이메일" value={user?.email || '—'} />
      <InfoRow label="가입 방법" value={providerLabel} />
      <InfoRow label="가입일" value={createdAtLabel} />

      <div style={{ height: 80 }} />
    </div>
  );
}
