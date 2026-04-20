'use client';
// SCR-003 로그인
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function useToast() {
  const [msg, setMsg] = useState('');
  const show = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 2200);
  };
  return { msg, show };
}

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();

  const socialClick = () => toast.show('준비 중이에요 🙏');

  return (
    <>
      <style>{`
        @keyframes toastUp {
          from { opacity: 0; transform: translate(-50%, 8px) }
          to   { opacity: 1; transform: translate(-50%, 0) }
        }
      `}</style>

      {/* 토스트 */}
      {toast.msg && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%',
          background: 'rgba(25,31,40,0.88)', color: '#fff',
          padding: '10px 20px', borderRadius: 'var(--r-full)',
          fontSize: 13, fontWeight: 600,
          zIndex: 300, whiteSpace: 'nowrap',
          animation: 'toastUp 200ms var(--ease-out) both',
          boxShadow: 'var(--shadow-md)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* SCR-003 — ref s003 구조 */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 var(--screen-pad)',
        background: 'var(--bg-card)',
        overflowY: 'auto',
      }}>
        {/* 로고 영역 */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(160deg,#2A52B8,#1C3C82)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--brand-shadow)',
            }}>
              <svg viewBox="0 0 22 22" fill="none" width="20" height="20">
                <rect x="1" y="4" width="16" height="15" rx="3" fill="white" opacity="0.95"/>
                <rect x="5" y="1.5" width="2" height="5" rx="1" fill="white" opacity="0.8"/>
                <rect x="11" y="1.5" width="2" height="5" rx="1" fill="white" opacity="0.8"/>
                <rect x="17.5" y="5" width="3.5" height="4" rx="1" fill="#E8394A"/>
                <rect x="17.5" y="15" width="3.5" height="4" rx="1" fill="#E8A820"/>
              </svg>
            </div>
            <span style={{
              fontFamily: "'Poppins',sans-serif",
              fontSize: 26, fontWeight: 800,
              color: 'var(--brand)', letterSpacing: '-0.8px',
            }}>cheche</span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>환영해요, 크리에이터님 👋</div>
        </div>

        {/* 카카오 */}
        <button
          onClick={socialClick}
          style={{
            width: '100%', padding: 13, borderRadius: 'var(--r-md)',
            border: '1px solid #FEE500', background: '#FEE500',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, fontSize: 13, fontWeight: 600, color: '#191919',
            cursor: 'pointer', marginBottom: 10,
            fontFamily: 'var(--font-body)', minHeight: 44,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 900 }}>K</span>
          카카오로 시작하기
        </button>

        {/* 네이버 */}
        <button
          onClick={socialClick}
          style={{
            width: '100%', padding: 13, borderRadius: 'var(--r-md)',
            border: 'none', background: '#03C75A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, fontSize: 13, fontWeight: 600, color: '#fff',
            cursor: 'pointer', marginBottom: 10,
            fontFamily: 'var(--font-body)', minHeight: 44,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" fill="white"/>
          </svg>
          네이버로 시작하기
        </button>

        {/* Apple */}
        <button
          onClick={socialClick}
          style={{
            width: '100%', padding: 13, borderRadius: 'var(--r-md)',
            border: '1px solid #000', background: '#000', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', marginBottom: 0,
            fontFamily: 'var(--font-body)', minHeight: 44,
          }}
        >
          <svg width="14" height="17" viewBox="0 0 814 1000" fill="white">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663.2 0 541.8c0-207.8 134.8-318.1 266.1-318.1 99.2 0 182 64.8 244.3 64.8 60 0 154.6-68.9 266.9-68.9 31.8 0 107.9 4.5 170.7 66.9zm-153-263.3c30.4-35.9 51.7-86.1 51.7-136.4 0-7-.6-14-1.9-19.8-48.1 1.9-106.3 32.2-140.6 72.5-26.9 30.4-51.7 80.1-51.7 131.4 0 7.7 1.3 15.5 1.9 17.9 3.2.6 8.3 1.3 13.4 1.3 43.5 0 97.6-29.1 127.2-66.9z"/>
          </svg>
          Apple로 시작하기
        </button>

        {/* 구분선 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0', color: 'var(--text-muted)', fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-mid)' }} />
          또는
          <div style={{ flex: 1, height: 1, background: 'var(--border-mid)' }} />
        </div>

        {/* 이메일 CTA */}
        <button
          onClick={() => router.push('/login/email')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '13px 22px', borderRadius: 'var(--r-md)',
            fontSize: 15, fontWeight: 700,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            background: 'var(--bg-input)', color: 'var(--text-primary)',
            border: '1px solid var(--border-mid)',
            width: '100%', letterSpacing: '-0.2px', minHeight: 44,
          }}
        >
          이메일로 계속하기
        </button>

        {/* data-hide: SCR-003D 플랫폼 연동 안내 */}
        {/* [data-hide="platform-connect-screen"] 복구: CLAUDE.md ref/ 주석 참조 */}
      </div>
    </>
  );
}
