'use client';
// SCR-009A 채널 설정 — ref 기준 신규 설계 (ref에 없어 TDS v4 기반 구현)
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Channel {
  id: string;
  name: string;
  emoji: string;
  placeholder: string;
  url: string;
  followers: string;
  enabled: boolean;
}

const INITIAL_CHANNELS: Channel[] = [
  { id: 'blog',    name: '네이버 블로그', emoji: '📝', placeholder: 'blog.naver.com/your-id',   url: '', followers: '', enabled: false },
  { id: 'insta',   name: '인스타그램',   emoji: '📸', placeholder: 'instagram.com/your-id',    url: '', followers: '', enabled: false },
  { id: 'youtube', name: '유튜브',       emoji: '🎬', placeholder: 'youtube.com/@your-channel', url: '', followers: '', enabled: false },
  { id: 'tiktok',  name: '틱톡',         emoji: '🎵', placeholder: 'tiktok.com/@your-id',      url: '', followers: '', enabled: false },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 44, height: 26, borderRadius: 13,
        background: on ? 'var(--brand)' : 'var(--bg-chip)',
        position: 'relative', cursor: 'pointer',
        transition: 'background var(--dur-base)',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3, left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff',
        boxShadow: 'var(--shadow-xs)',
        transition: 'left var(--dur-base)',
      }} />
    </div>
  );
}

export default function ChannelsPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);

  const update = (id: string, key: keyof Channel, val: string | boolean) =>
    setChannels(prev => prev.map(c => c.id === id ? { ...c, [key]: val } : c));

  const reset = (id: string) =>
    setChannels(prev => prev.map(c => c.id === id ? { ...c, url: '', followers: '', enabled: false } : c));

  const handleSave = () => {
    // 실제 저장 로직 자리
    router.back();
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
    fontWeight: 600, marginBottom: 6, display: 'block', letterSpacing: '0.02em',
  };

  const inpStyle: React.CSSProperties = {
    width: '100%', padding: '11px 13px',
    border: '1.5px solid var(--border-mid)', borderRadius: 'var(--r-md)',
    fontSize: 12, color: 'var(--text-primary)',
    background: 'var(--bg-input)', outline: 'none',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0 }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-text)', fontSize: 14, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', minHeight: 44 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
          채널 설정
        </button>
      </div>

      {/* 채널 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 120px' }}>
        {channels.map((ch) => (
          <div key={ch.id} style={{
            margin: '8px 16px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}>
            {/* 채널 헤더 행 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: ch.enabled ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {ch.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{ch.name}</div>
                  {ch.enabled && ch.url && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{ch.url}</div>
                  )}
                </div>
              </div>
              <Toggle on={ch.enabled} onChange={() => update(ch.id, 'enabled', !ch.enabled)} />
            </div>

            {/* 활성화 시 입력 폼 */}
            {ch.enabled && (
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>채널 URL</label>
                  <input
                    style={inpStyle}
                    type="url"
                    placeholder={ch.placeholder}
                    value={ch.url}
                    onChange={e => update(ch.id, 'url', e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>팔로워 / 구독자 수</label>
                  <input
                    style={inpStyle}
                    type="text"
                    inputMode="numeric"
                    placeholder="예: 3200"
                    value={ch.followers}
                    onChange={e => update(ch.id, 'followers', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => reset(ch.id)}
                    style={{ fontSize: 12, color: 'var(--s-overdue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, padding: '4px 0' }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 저장 버튼 — 하단 고정 */}
      <div style={{ position: 'sticky', bottom: 0, padding: '12px 20px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button
          onClick={handleSave}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '13px 22px', borderRadius: 'var(--r-md)',
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
            cursor: 'pointer', border: 'none',
            background: 'var(--brand)', color: '#fff',
            boxShadow: 'var(--brand-shadow)', width: '100%', minHeight: 44,
          }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
