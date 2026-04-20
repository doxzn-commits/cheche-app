'use client';
// SCR-003A 이메일 가입
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Errors {
  email?: string;
  pw?: string;
  nick?: string;
}

function validate(email: string, pw: string, nick: string): Errors {
  const e: Errors = {};
  if (!email) e.email = '이메일을 입력해주세요';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = '올바른 이메일 형식이 아니에요';
  if (!pw) e.pw = '비밀번호를 입력해주세요';
  else if (pw.length < 8) e.pw = '비밀번호는 8자 이상이어야 해요';
  if (!nick) e.nick = '닉네임을 입력해주세요';
  return e;
}

export default function EmailSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [nick, setNick] = useState('');
  const [touched, setTouched] = useState({ email: false, pw: false, nick: false });
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(email, pw, nick);
  const showErr = (f: keyof typeof touched) => (touched[f] || submitted) && !!errors[f];

  const touch = (f: keyof typeof touched) =>
    setTouched((t) => ({ ...t, [f]: true }));

  const handleSubmit = () => {
    setSubmitted(true);
    if (Object.keys(errors).length === 0) router.push('/login/verify');
  };

  const inpStyle = (field: keyof typeof touched): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    border: `1.5px solid ${showErr(field) ? 'var(--s-overdue)' : 'var(--border-mid)'}`,
    borderRadius: 'var(--r-md)',
    fontSize: 13,
    color: 'var(--text-primary)',
    background: 'var(--bg-input)',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    transition: 'border-color var(--dur-fast)',
  });

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    fontWeight: 600,
    marginBottom: 8,
    display: 'block',
    letterSpacing: '0.02em',
  };

  const errStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--s-overdue)',
    marginTop: 5,
    fontWeight: 500,
    fontFamily: 'var(--font-body)',
  };

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
          이메일 가입
        </button>
      </div>

      {/* 폼 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px var(--screen-pad)' }}>
        {/* 이메일 */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>이메일</label>
          <input
            style={inpStyle('email')}
            type="email"
            placeholder="이메일 주소 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch('email')}
          />
          {showErr('email') && <div style={errStyle}>{errors.email}</div>}
        </div>

        {/* 비밀번호 */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>비밀번호</label>
          <input
            style={inpStyle('pw')}
            type="password"
            placeholder="비밀번호 8자 이상 입력"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onBlur={() => touch('pw')}
          />
          {showErr('pw') && <div style={errStyle}>{errors.pw}</div>}
        </div>

        {/* 닉네임 */}
        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>닉네임</label>
          <input
            style={inpStyle('nick')}
            type="text"
            placeholder="닉네임 입력"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            onBlur={() => touch('nick')}
          />
          {showErr('nick') && <div style={errStyle}>{errors.nick}</div>}
        </div>

        {/* 가입하기 */}
        <button
          onClick={handleSubmit}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '13px 22px', borderRadius: 'var(--r-md)',
            fontSize: 15, fontWeight: 700,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer', border: 'none',
            background: 'var(--brand)', color: '#fff',
            boxShadow: 'var(--brand-shadow)',
            width: '100%', letterSpacing: '-0.2px', minHeight: 44,
          }}
        >
          가입하기
        </button>
      </div>
    </div>
  );
}
