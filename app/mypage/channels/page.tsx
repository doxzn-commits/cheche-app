'use client';

import { useMemo, useState } from 'react';
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

const STORAGE_KEY = 'cheche:channels';

const INITIAL_CHANNELS: Channel[] = [
  { id: 'blog', name: '네이버 블로그', emoji: '📝', placeholder: 'blog.naver.com/your-id', url: '', followers: '', enabled: false },
  { id: 'insta', name: '인스타그램', emoji: '📸', placeholder: 'instagram.com/your-id', url: '', followers: '', enabled: false },
  { id: 'youtube', name: '유튜브', emoji: '🎬', placeholder: 'youtube.com/@your-channel', url: '', followers: '', enabled: false },
  { id: 'tiktok', name: '틱톡', emoji: '🎵', placeholder: 'tiktok.com/@your-id', url: '', followers: '', enabled: false },
];

function readStoredChannels(): Channel[] {
  if (typeof window === 'undefined') {
    return INITIAL_CHANNELS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CHANNELS;
    const parsed = JSON.parse(raw) as Channel[];
    return Array.isArray(parsed) ? parsed : INITIAL_CHANNELS;
  } catch {
    return INITIAL_CHANNELS;
  }
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: on ? 'var(--brand)' : 'var(--bg-chip)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background var(--dur-base)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: 'var(--shadow-xs)',
          transition: 'left var(--dur-base)',
        }}
      />
    </div>
  );
}

export default function ChannelsPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>(() => readStoredChannels());
  const [loadedSnapshot, setLoadedSnapshot] = useState<string>(() => JSON.stringify(readStoredChannels()));

  const update = (id: string, key: keyof Channel, value: string | boolean) =>
    setChannels((prev) => prev.map((channel) => (channel.id === id ? { ...channel, [key]: value } : channel)));

  const reset = (id: string) =>
    setChannels((prev) =>
      prev.map((channel) => (channel.id === id ? { ...channel, url: '', followers: '', enabled: false } : channel))
    );

  const hasInvalidEnabledChannel = useMemo(
    () => channels.some((channel) => channel.enabled && !channel.url.trim()),
    [channels]
  );
  const isDirty = JSON.stringify(channels) !== loadedSnapshot;

  const handleSave = () => {
    if (hasInvalidEnabledChannel || !isDirty) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
      setLoadedSnapshot(JSON.stringify(channels));
    } catch {}

    router.back();
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    fontWeight: 600,
    marginBottom: 6,
    display: 'block',
    letterSpacing: '0.02em',
  };

  const inpStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 13px',
    border: '1.5px solid var(--border-mid)',
    borderRadius: 'var(--r-md)',
    fontSize: 12,
    color: 'var(--text-primary)',
    background: 'var(--bg-input)',
    outline: 'none',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px 10px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--brand-text)',
            fontSize: 14,
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            minHeight: 44,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          채널 설정
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 120px' }}>
        {channels.map((channel) => (
          <div
            key={channel.id}
            style={{
              margin: '8px 16px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: channel.enabled ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--r-md)',
                    background: 'var(--bg-page)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {channel.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                    {channel.name}
                  </div>
                  {channel.enabled && channel.url && (
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        marginTop: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 180,
                      }}
                    >
                      {channel.url}
                    </div>
                  )}
                </div>
              </div>
              <Toggle on={channel.enabled} onChange={() => update(channel.id, 'enabled', !channel.enabled)} />
            </div>

            {channel.enabled && (
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>채널 URL</label>
                  <input
                    style={inpStyle}
                    type="url"
                    placeholder={channel.placeholder}
                    value={channel.url}
                    onChange={(e) => update(channel.id, 'url', e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>팔로워 / 구독자 수</label>
                  <input
                    style={inpStyle}
                    type="text"
                    inputMode="numeric"
                    placeholder="예: 3200"
                    value={channel.followers}
                    onChange={(e) => update(channel.id, 'followers', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => reset(channel.id)}
                    style={{
                      fontSize: 12,
                      color: 'var(--s-overdue)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      padding: '4px 0',
                    }}
                  >
                    초기화
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'sticky',
          bottom: 0,
          padding: '12px 20px 24px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        {hasInvalidEnabledChannel && (
          <div style={{ fontSize: 12, color: 'var(--s-overdue)', textAlign: 'center', marginBottom: 8 }}>
            활성화한 채널에는 URL을 입력해야 합니다.
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={hasInvalidEnabledChannel || !isDirty}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '13px 22px',
            borderRadius: 'var(--r-md)',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
            cursor: hasInvalidEnabledChannel || !isDirty ? 'not-allowed' : 'pointer',
            border: 'none',
            background: hasInvalidEnabledChannel || !isDirty ? 'var(--bg-chip)' : 'var(--brand)',
            color: hasInvalidEnabledChannel || !isDirty ? 'var(--text-disabled)' : '#fff',
            boxShadow: hasInvalidEnabledChannel || !isDirty ? 'none' : 'var(--brand-shadow)',
            width: '100%',
            minHeight: 44,
          }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
