'use client';
// SCR-009 마이페이지 — TDS v4 완전 재작성 (ref s009 원본 구조 유지) + Auth.js 세션 연동 + userId 격리
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

type ApiEvent = { id: string; date: string; type: string; name: string; done?: boolean };

function getTodayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

// 이름 · 이메일에서 첫 글자를 뽑아 이니셜 아바타용으로 사용.
function getInitial(name?: string | null, email?: string | null) {
  const src = (name?.trim() || email?.split('@')[0] || '체').trim();
  return src.charAt(0).toUpperCase();
}

// 표시명: name → email 앞부분 → '크리에이터' 순으로 폴백.
function getDisplayName(name?: string | null, email?: string | null) {
  if (name && name.trim()) return name.trim();
  if (email && email.includes('@')) return email.split('@')[0];
  return '크리에이터';
}

const ChevR = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-disabled)', flexShrink: 0 }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

interface RowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
}

function SettingsRow({ icon, iconBg, label, right, onClick }: RowProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background var(--dur-fast)',
        minHeight: 52, background: 'var(--bg-card)',
      }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLDivElement).style.background = 'var(--bg-page)')}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        {label}
      </div>
      {right ?? <ChevR />}
    </div>
  );
}

export default function MyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [upcoming, setUpcoming] = useState(0);
  const [done, setDone] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;
  const displayName = useMemo(() => getDisplayName(user?.name, user?.email), [user?.name, user?.email]);
  const initial = useMemo(() => getInitial(user?.name, user?.email), [user?.name, user?.email]);
  const emailText = user?.email ?? '';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/events', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const events: ApiEvent[] = await res.json();
        const today = getTodayStr();
        // 체험 예정: type='g' & 오늘 이후(날짜 문자열 비교)
        setUpcoming(events.filter(e => e.type === 'g' && e.date > today).length);
        // 리뷰 완료: done=true 인 이벤트를 이름 기준 중복 제거
        const doneNames = new Set(events.filter(e => e.done).map(e => e.name));
        setDone(doneNames.size);
      } catch {
        // 네트워크 오류 시 0 유지
      }
    }
    load();
    // 페이지 복귀 시 최신화
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onFocus);
    };
  }, []);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-page)', overflow: 'hidden' }}>

      {/* ① 프로필 히어로 — ref s009 네이비 그라디언트 */}
      <div style={{
        background: 'linear-gradient(155deg, var(--brand-pressed) 0%, var(--brand) 60%, var(--brand-mid) 100%)',
        position: 'relative', overflow: 'hidden',
        padding: '20px 24px 0', flexShrink: 0,
      }}>
        {/* 배경 장식 원 */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* 상단 바 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative' }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-inverse)', letterSpacing: '-0.4px', fontFamily: 'var(--font-body)' }}>마이페이지</span>
          <button
            onClick={() => router.push('/mypage/notification-center')}
            aria-label="알림 센터"
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span style={{ position: 'absolute', top: 10, right: 10, width: 7, height: 7, background: 'var(--s-overdue)', borderRadius: '50%' }} />
          </button>
        </div>

        {/* 프로필 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', marginBottom: 20 }}>
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={`${displayName} 프로필 이미지`}
              referrerPolicy="no-referrer"
              style={{
                width: 58, height: 58, borderRadius: '50%',
                objectFit: 'cover',
                border: '2.5px solid rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.18)',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              aria-hidden
              style={{
                width: 58, height: 58, borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)', border: '2.5px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color: 'var(--text-inverse)', letterSpacing: '-0.5px', flexShrink: 0,
                fontFamily: 'var(--font-body)',
              }}
            >
              {status === 'loading' ? '' : initial}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 18, fontWeight: 800, color: 'var(--text-inverse)',
              letterSpacing: '-0.5px', marginBottom: 3,
              fontFamily: 'var(--font-body)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {status === 'loading' ? '불러오는 중…' : `${displayName}님`}
            </div>
            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {emailText}
            </div>
          </div>
          <button style={{
            fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.25)',
            padding: '7px 16px', borderRadius: 'var(--r-full)',
            cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0, minHeight: 34,
          }}>
            편집
          </button>
        </div>

        {/* 3분할 통계 */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.10)',
          borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.12)',
          borderBottom: 'none',
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 8px 16px', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-inverse)', letterSpacing: '-0.8px', lineHeight: 1, marginBottom: 5, fontFamily: 'var(--font-body)' }}>{upcoming}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textAlign: 'center' }}>체험 예정</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 8px 16px', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#7AFFD4', letterSpacing: '-0.8px', lineHeight: 1, marginBottom: 5, fontFamily: 'var(--font-body)' }}>238,000<span style={{ fontSize: 11 }}>원</span></div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textAlign: 'center' }}>이번 달 수익</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 8px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.8px', lineHeight: 1, marginBottom: 5, fontFamily: 'var(--font-body)' }}>{done}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textAlign: 'center' }}>리뷰 완료</div>
          </div>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ② 계정 설정 */}
        <div style={{ height: 8, background: 'var(--bg-page)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginTop: 12 }} />
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', padding: '14px 20px 8px', letterSpacing: '0.10em', textTransform: 'uppercase' }}>계정 설정</div>
        <div>
          <SettingsRow
            iconBg="var(--brand-light)"
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>}
            label="채널 설정"
            onClick={() => router.push('/mypage/channels')}
          />
          <SettingsRow
            iconBg="var(--s-overdue-bg)"
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--s-overdue)" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>}
            label="알림 설정"
            onClick={() => router.push('/mypage/notifications')}
          />
          {/* [data-hide="platform-link"] SCR-009C 플랫폼 연동 복구: data-hide 속성 제거 + 아래 주석 해제 */}
          {/* <SettingsRow iconBg="var(--s-selected-bg)" icon={...} label="플랫폼 연동 관리" onClick={() => router.push('/mypage/platforms')} /> */}
        </div>

        {/* ③ 앱 정보 */}
        <div style={{ height: 8, background: 'var(--bg-page)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', padding: '14px 20px 8px', letterSpacing: '0.10em', textTransform: 'uppercase' }}>앱 정보</div>
        <div>
          <SettingsRow
            iconBg="var(--bg-page)"
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            label="이용약관"
          />
          <SettingsRow
            iconBg="var(--bg-page)"
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
            label="개인정보 처리방침"
          />
          <SettingsRow
            iconBg="var(--bg-page)"
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            label="버전 정보"
            right={
              <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--brand-light)', color: 'var(--brand-text)', padding: '2px 8px', borderRadius: 'var(--r-full)', fontFamily: 'var(--font-mono)' }}>
                v1.0.0
              </span>
            }
          />
        </div>

        {/* ④ 로그아웃 / 탈퇴 */}
        <div style={{ height: 8, background: 'var(--bg-page)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />
        <div style={{ padding: '16px 20px 8px', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-card)' }}>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 22px', borderRadius: 'var(--r-md)',
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
              cursor: signingOut ? 'not-allowed' : 'pointer',
              background: 'var(--bg-input)', color: 'var(--text-primary)',
              border: '1px solid var(--border-mid)', width: '100%', minHeight: 48,
              opacity: signingOut ? 0.6 : 1,
            }}
          >
            {signingOut ? '나가는 중이에요…' : '로그아웃할게요'}
          </button>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--s-overdue)', fontSize: 13, fontWeight: 600,
            padding: '10px 0', fontFamily: 'var(--font-body)', opacity: 0.7,
            minHeight: 44,
          }}>
            회원 탈퇴
          </button>
        </div>

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
