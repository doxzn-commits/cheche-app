'use client';
// SCR-001 스플래시
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/onboarding'), 1500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pulse  { 0%,100% { opacity:.4; transform:scale(1) } 50% { opacity:1; transform:scale(1.3) } }
      `}</style>

      {/* 전체 그라데이션 배경 — ref s001 그대로 */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg,#0E1B3E 0%,#1C3C82 60%,#2A52B8 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        animation: 'fadeIn 600ms ease-out both',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {/* 아이콘 재현 — ref 원본 HTML 구조 유지 */}
          <div style={{
            width: 88, height: 88,
            background: 'linear-gradient(160deg,#2A52B8,#1C3C82)',
            borderRadius: 20,
            boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 18 }}>
              <div style={{ width: 10, height: 16, border: '2.5px solid #82B0E8', borderRadius: 4 }} />
              <div style={{ width: 10, height: 16, border: '2.5px solid #82B0E8', borderRadius: 4 }} />
            </div>
            <div style={{
              marginTop: 6, width: 60, height: 50,
              background: 'white', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 800, color: '#1C3C82', letterSpacing: '-0.3px' }}>cheche</span>
              <div style={{ position: 'absolute', right: -6, top: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ width: 5, height: 10, background: '#E8394A', borderRadius: 2 }} />
                <div style={{ width: 5, height: 10, background: '#dde4f5', borderRadius: 2 }} />
                <div style={{ width: 5, height: 10, background: '#E8A820', borderRadius: 2 }} />
              </div>
            </div>
          </div>

          {/* 로고 텍스트 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontFamily: "'Poppins',sans-serif",
              fontSize: 30, fontWeight: 800,
              color: '#fff', letterSpacing: '-1px', lineHeight: 1,
            }}>
              cheche
            </span>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', textAlign: 'center', lineHeight: 1.6 }}>
              체험단을 한 곳에서 놓치지 않게
            </div>
          </div>
        </div>

        {/* 로딩 도트 — ref .sl-dot 재현 */}
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {([0, 0.2, 0.4] as const).map((delay, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'rgba(255,255,255,.4)',
              animation: `pulse 1.2s ease-in-out ${delay}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </>
  );
}
