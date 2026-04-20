'use client';
// SCR-002 온보딩
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SLIDES = [
  {
    emoji: '🔍',
    bg: 'var(--brand-light)',
    title: '흩어진 체험단을\n한 곳에서',
    desc: '레뷰·강남맛집·미블 등 18개 플랫폼\n캠페인을 한 번에 탐색하세요',
  },
  {
    emoji: '📅',
    bg: 'var(--s-overdue-bg)',
    title: '놓치지 않는\n마감 관리',
    desc: '선정부터 리뷰 마감까지\n캘린더 하나로 자동 관리',
  },
  {
    emoji: '💰',
    bg: 'rgba(0,179,134,0.12)',
    title: '협찬 수익\n한눈에',
    desc: '체험단 협찬 금액을 자동 집계해\n이번 달 수익을 확인하세요',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);

  const goNext = () => {
    if (idx < SLIDES.length - 1) setIdx(idx + 1);
    else router.push('/login');
  };

  const skip = () => router.push('/login');

  return (
    <>
      <style>{`
        @keyframes obSlideIn {
          from { opacity: 0; transform: translateX(32px) }
          to   { opacity: 1; transform: translateX(0) }
        }
      `}</style>

      {/* SCR-002 — ref s002 구조 */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--bg-card)',
      }}>
        {/* 건너뛰기 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px 0', flexShrink: 0 }}>
          <button
            onClick={skip}
            style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, minHeight: 44, padding: '0 4px' }}
          >
            건너뛰기
          </button>
        </div>

        {/* 슬라이드 — key 변경 시 애니메이션 트리거 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 32px', gap: 20 }}>
          <div
            key={idx}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
              animation: 'obSlideIn 280ms cubic-bezier(0.16,1,0.30,1) both',
            }}
          >
            {/* 이모지 원형 — ref ob-slide 구조 */}
            <div style={{
              width: 160, height: 160,
              background: SLIDES[idx].bg,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 64,
            }}>
              {SLIDES[idx].emoji}
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800,
              color: 'var(--text-primary)',
              textAlign: 'center', letterSpacing: '-0.6px', lineHeight: 1.35,
              whiteSpace: 'pre-line',
            }}>
              {SLIDES[idx].title}
            </div>
            <div style={{
              fontSize: 13, color: 'var(--text-secondary)',
              textAlign: 'center', lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}>
              {SLIDES[idx].desc}
            </div>
          </div>
        </div>

        {/* 도트 인디케이터 — ref .ob-dot-row */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16, flexShrink: 0 }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === idx ? 'var(--brand)' : 'var(--border-mid)',
                transition: 'all 300ms',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        {/* CTA 버튼 */}
        <div style={{ padding: '0 24px 28px', flexShrink: 0 }}>
          <button
            onClick={goNext}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 22px', borderRadius: 'var(--r-md)',
              fontSize: 15, fontWeight: 700,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer', border: 'none',
              background: 'var(--brand)', color: '#fff',
              boxShadow: 'var(--brand-shadow)',
              width: '100%', letterSpacing: '-0.2px',
              minHeight: 44,
            }}
          >
            {idx === SLIDES.length - 1 ? '시작하기' : '다음'}
          </button>
        </div>
      </div>
    </>
  );
}
