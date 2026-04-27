'use client';
// SCR-009 마이페이지 — TDS v4 완전 재작성 (ref s009 원본 구조 유지) + Auth.js 세션 연동 + userId 격리
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

type ApiEvent   = { id: string; date: string; type: string; name: string; done?: boolean };
type ApiRevenue = { id: string; date: string; goods: number; ad: number };

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
  labelColor?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}

function SettingsRow({ icon, iconBg, label, labelColor, right, onClick }: RowProps) {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: labelColor ?? 'var(--text-secondary)', fontSize: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        {label}
      </div>
      {right ?? <ChevR />}
    </div>
  );
}

// 탈퇴 확인 모달
function DeleteModal({ onCancel, onConfirm, loading }: { onCancel: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}
      onClick={onCancel}
    >
      <div
        style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', padding: '28px 24px 20px', width: '100%', maxWidth: 340, boxShadow: 'var(--shadow-lg)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, fontFamily: 'var(--font-body)', letterSpacing: '-0.4px' }}>
          정말 탈퇴할까요?
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24, fontFamily: 'var(--font-body)' }}>
          탈퇴 시 모든 데이터가 삭제되며<br />복구할 수 없어요.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, height: 48, borderRadius: 'var(--r-md)', border: '1px solid var(--border-mid)', background: 'var(--bg-input)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, height: 48, borderRadius: 'var(--r-md)', border: 'none', background: 'var(--s-overdue)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'var(--font-body)' }}
          >
            {loading ? '처리 중…' : '탈퇴하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [upcoming, setUpcoming] = useState(0);
  const [done, setDone] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [thisMonthRevenue, setThisMonthRevenue] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [withdrawDone, setWithdrawDone] = useState(false);

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
        setUpcoming(events.filter(e => e.type === 'g' && e.date > today).length);
        const doneNames = new Set(events.filter(e => e.done).map(e => e.name));
        setDone(doneNames.size);
      } catch {
        // 네트워크 오류 시 0 유지
      }
    }
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onFocus);
    };
  }, []);

  // 이번달 수익 합산 — goods(협찬 시가) + ad(광고비)
  useEffect(() => {
    let cancelled = false;
    async function loadRevenues() {
      try {
        const res = await fetch('/api/revenues', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const revenues: ApiRevenue[] = await res.json();
        const now = new Date();
        const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const total = revenues
          .filter(r => r.date.startsWith(prefix))
          .reduce((sum, r) => sum + (r.goods || 0) + (r.ad || 0), 0);
        setThisMonthRevenue(total);
      } catch {
        // 오류 시 null 유지 — 히어로에서 '—' 표시
      }
    }
    loadRevenues();
    const onFocus = () => loadRevenues();
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

  const handleDeleteConfirm = async () => {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '탈퇴 처리 중 오류가 발생했어요.');
      }
      // DB 삭제 완료 → 안내 화면 표시 후 3초 뒤 signOut
      setShowDeleteModal(false);
      setWithdrawDone(true);
      setTimeout(() => { signOut({ callbackUrl: '/' }); }, 3000);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했어요.');
      setDeleting(false);
    }
  };

  // 탈퇴 완료 안내 화면 — 3초 후 signOut
  if (withdrawDone) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 24px', background: 'var(--bg-page)', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>👋</div>
        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.5, fontFamily: 'var(--font-body)', letterSpacing: '-0.4px' }}>
          탈퇴가 정상적으로<br />처리 되었습니다.
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, fontFamily: 'var(--font-body)' }}>
          더 좋은 서비스로 다시 만나뵈어요! 🌱
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-disabled)', fontFamily: 'var(--font-body)' }}>
          잠시 후 자동으로 이동합니다...
        </p>
      </div>
    );
  }

  return (
    // 수정 4: overflow:hidden 제거 → 페이지 전체가 자연스럽게 스크롤되도록 변경.
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-page)', overflowY: 'auto' }}>

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
            <div style={{ fontSize: 18, fontWeight: 800, color: '#7AFFD4', letterSpacing: '-0.8px', lineHeight: 1, marginBottom: 5, fontFamily: 'var(--font-body)' }}>
              {thisMonthRevenue === null
                ? '—'
                : thisMonthRevenue.toLocaleString('ko-KR')
              }
              {thisMonthRevenue !== null && <span style={{ fontSize: 11 }}>원</span>}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textAlign: 'center' }}>이번 달 수익</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 8px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.8px', lineHeight: 1, marginBottom: 5, fontFamily: 'var(--font-body)' }}>{done}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textAlign: 'center' }}>리뷰 완료</div>
          </div>
        </div>
      </div>

      {/* ② 계정 설정 */}
      <div style={{ height: 8, background: 'var(--bg-page)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginTop: 12 }} />
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)', padding: '14px 20px 8px', letterSpacing: '0.10em', textTransform: 'uppercase' }}>계정 설정</div>
      <div>
        <SettingsRow
          iconBg="var(--brand-light)"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          label="계정 정보"
          onClick={() => router.push('/mypage/account')}
        />
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
        <SettingsRow
          iconBg="var(--s-selected-bg)"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--s-selected)" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
          label="수익 내역"
          onClick={() => router.push('/revenue')}
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
        <button
          onClick={() => { setDeleteError(null); setShowDeleteModal(true); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--s-overdue)', fontSize: 13, fontWeight: 600,
            padding: '10px 0', fontFamily: 'var(--font-body)', opacity: 0.7,
            minHeight: 44,
          }}
        >
          탈퇴하기
        </button>
        {deleteError && (
          <div style={{ fontSize: 12, color: 'var(--s-overdue)', textAlign: 'center', fontFamily: 'var(--font-body)', padding: '4px 0' }}>
            {deleteError}
          </div>
        )}
      </div>

      <div style={{ height: 80 }} />

      {/* 탈퇴 확인 모달 */}
      {showDeleteModal && (
        <DeleteModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          loading={deleting}
        />
      )}
    </div>
  );
}
