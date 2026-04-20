'use client';
// SCR-003B 이메일 인증
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const CODE_LEN = 6;

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(CODE_LEN).fill(''));
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  // ref 배열 — hooks in loop 금지 규칙 준수
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(CODE_LEN).fill(null));

  const startCountdown = useCallback(() => {
    setCountdown(60);
    setCanResend(false);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
    return t;
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const t = startCountdown();
    return () => clearInterval(t);
  }, [startCountdown]);

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < CODE_LEN - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LEN);
    const next = Array(CODE_LEN).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setCode(next);
    const focusIdx = Math.min(pasted.length, CODE_LEN - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleResend = () => {
    if (!canResend) return;
    setCode(Array(CODE_LEN).fill(''));
    const t = startCountdown();
    inputRefs.current[0]?.focus();
    return () => clearInterval(t);
  };

  const isFull = code.every((c) => c !== '');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 20px 10px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
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
          이메일 인증
        </button>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '40px var(--screen-pad) 28px',
      }}>
        {/* 타이틀 */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.6px', lineHeight: 1.35, marginBottom: 8 }}>
            인증 코드를<br/>입력해주세요
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            이메일로 발송된 6자리 코드를 입력해요
          </div>
        </div>

        {/* 6칸 코드 입력 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }} onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                flex: 1,
                aspectRatio: '1',
                textAlign: 'center',
                fontSize: 22, fontWeight: 700,
                border: `1.5px solid ${digit ? 'var(--brand)' : 'var(--border-mid)'}`,
                borderRadius: 'var(--r-md)',
                background: digit ? 'var(--brand-xlight)' : 'var(--bg-input)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                caretColor: 'var(--brand)',
                transition: 'border-color var(--dur-fast), background var(--dur-fast)',
              }}
            />
          ))}
        </div>

        {/* 재전송 */}
        <div style={{ textAlign: 'center', marginBottom: 'auto' }}>
          {canResend ? (
            <button
              onClick={handleResend}
              style={{
                fontSize: 13, color: 'var(--brand-text)', fontWeight: 700,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', minHeight: 44, padding: '8px 16px',
              }}
            >
              코드 재전송
            </button>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {countdown}초 후 재전송 가능
            </span>
          )}
        </div>

        {/* 인증 완료 버튼 */}
        <button
          onClick={() => isFull && router.replace('/calendar')}
          disabled={!isFull}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '13px 22px', borderRadius: 'var(--r-md)',
            fontSize: 15, fontWeight: 700,
            fontFamily: 'var(--font-body)',
            cursor: isFull ? 'pointer' : 'default',
            border: 'none',
            background: isFull ? 'var(--brand)' : 'var(--bg-chip)',
            color: isFull ? '#fff' : 'var(--text-disabled)',
            boxShadow: isFull ? 'var(--brand-shadow)' : 'none',
            width: '100%', letterSpacing: '-0.2px', minHeight: 44,
            transition: 'all var(--dur-base)',
          }}
        >
          인증 완료
        </button>
      </div>
    </div>
  );
}
