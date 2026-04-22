'use client';
// SCR-003 로그인 — Google/Kakao/Naver 소셜 로그인 연동 (Auth.js v5)
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

type Provider = 'kakao' | 'naver' | 'google';

function useToast() {
  const [msg, setMsg] = useState('');
  const show = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 2200);
  };
  return { msg, show };
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [loading, setLoading] = useState<Provider | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/calendar';

  const handleSocial = async (provider: Provider) => {
    if (loading) return;
    setLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      toast.show('로그인에 실패했어요. 다시 시도해 주세요.');
      setLoading(null);
    }
  };

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
          background: 'var(--bg-overlay)', color: 'var(--text-inverse)',
          padding: '10px 20px', borderRadius: 'var(--r-full)',
          fontSize: 13, fontWeight: 600,
          zIndex: 300, whiteSpace: 'nowrap',
          animation: 'toastUp 200ms var(--ease-out) both',
          boxShadow: 'var(--shadow-md)',
          fontFamily: 'var(--font-body)',
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
              background: 'linear-gradient(160deg, var(--brand-mid), var(--brand))',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--brand-shadow)',
            }}>
              <svg viewBox="0 0 22 22" fill="none" width="20" height="20">
                <rect x="1" y="4" width="16" height="15" rx="3" fill="white" opacity="0.95"/>
                <rect x="5" y="1.5" width="2" height="5" rx="1" fill="white" opacity="0.8"/>
                <rect x="11" y="1.5" width="2" height="5" rx="1" fill="white" opacity="0.8"/>
                <rect x="17.5" y="5" width="3.5" height="4" rx="1" fill="var(--tab-red)"/>
                <rect x="17.5" y="15" width="3.5" height="4" rx="1" fill="var(--tab-yellow)"/>
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-logo)',
              fontSize: 26, fontWeight: 800,
              color: 'var(--brand)', letterSpacing: '-0.8px',
            }}>cheche</span>
          </div>
          <div style={{
            fontSize: 14, color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
          }}>환영해요, 크리에이터님 👋</div>
        </div>

        {/* 카카오 */}
        <button
          onClick={() => handleSocial('kakao')}
          disabled={loading !== null}
          style={{
            width: '100%', padding: 13, borderRadius: 'var(--r-md)',
            border: '1px solid var(--oauth-kakao-bg)',
            background: 'var(--oauth-kakao-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--oauth-kakao-text)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading && loading !== 'kakao' ? 0.5 : 1,
            marginBottom: 10,
            fontFamily: 'var(--font-body)', minHeight: 48,
          }}
        >
          <svg width="17" height="16" viewBox="0 0 18 17" fill="none" aria-hidden="true">
            <path d="M9 0C4.03 0 0 3.13 0 7c0 2.52 1.71 4.73 4.28 5.97-.19.68-.68 2.55-.78 2.94-.12.5.18.49.38.36.16-.11 2.54-1.73 3.57-2.42.51.07 1.03.11 1.55.11 4.97 0 9-3.13 9-7S13.97 0 9 0z" fill="currentColor"/>
          </svg>
          {loading === 'kakao' ? '이동 중이에요…' : '카카오로 시작해요'}
        </button>

        {/* 네이버 */}
        <button
          onClick={() => handleSocial('naver')}
          disabled={loading !== null}
          style={{
            width: '100%', padding: 13, borderRadius: 'var(--r-md)',
            border: '1px solid var(--oauth-naver-bg)',
            background: 'var(--oauth-naver-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--oauth-naver-text)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading && loading !== 'naver' ? 0.5 : 1,
            marginBottom: 10,
            fontFamily: 'var(--font-body)', minHeight: 48,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" fill="currentColor"/>
          </svg>
          {loading === 'naver' ? '이동 중이에요…' : '네이버로 시작해요'}
        </button>

        {/* 구글 */}
        <button
          onClick={() => handleSocial('google')}
          disabled={loading !== null}
          style={{
            width: '100%', padding: 13, borderRadius: 'var(--r-md)',
            border: '1px solid var(--border-strong)',
            background: 'var(--oauth-google-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--oauth-google-text)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading && loading !== 'google' ? 0.5 : 1,
            marginBottom: 0,
            fontFamily: 'var(--font-body)', minHeight: 48,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.71-1.57 2.7-3.89 2.7-6.62z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
            <path d="M3.97 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" fill="#FBBC05"/>
            <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 009 0 9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {loading === 'google' ? '이동 중이에요…' : 'Google로 시작해요'}
        </button>

        {/* 구분선 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          margin: '16px 0', color: 'var(--text-muted)', fontSize: 12,
          fontFamily: 'var(--font-body)',
        }}>
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
            width: '100%', letterSpacing: '-0.2px', minHeight: 48,
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
