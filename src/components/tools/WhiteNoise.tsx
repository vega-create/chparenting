import { useState, useRef, useEffect } from 'react';

const sounds = [
  { id: 'rain', name: '雨聲', emoji: '🌧️', color: '#8BA888', desc: '溫柔的雨滴聲' },
  { id: 'ocean', name: '海浪', emoji: '🌊', color: '#A0B8C4', desc: '輕柔的海浪拍打' },
  { id: 'forest', name: '森林', emoji: '🌲', color: '#6E8E6A', desc: '鳥鳴與微風' },
  { id: 'fire', name: '篝火', emoji: '🔥', color: '#D4956A', desc: '溫暖的柴火聲' },
  { id: 'wind', name: '微風', emoji: '🍃', color: '#B8C4A0', desc: '輕輕吹過的風' },
  { id: 'night', name: '夜晚', emoji: '🌙', color: '#9A8A9A', desc: '蟲鳴蛙叫' },
];

const timerOptions = [
  { label: '不限', minutes: 0 },
  { label: '5 分鐘', minutes: 5 },
  { label: '15 分鐘', minutes: 15 },
  { label: '30 分鐘', minutes: 30 },
  { label: '60 分鐘', minutes: 60 },
];

// Generate white noise using Web Audio API
function createNoise(type: string): { start: () => void; stop: () => void; setVolume: (v: number) => void } | null {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.value = 0.3;

    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate different noise patterns
    for (let i = 0; i < bufferSize; i++) {
      switch (type) {
        case 'rain':
          data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.97 ? 0.8 : 0.15);
          break;
        case 'ocean':
          data[i] = Math.sin(i / 800) * 0.3 + (Math.random() * 2 - 1) * 0.1;
          break;
        case 'forest':
          data[i] = (Math.random() * 2 - 1) * 0.08 + Math.sin(i / 2000) * 0.05;
          break;
        case 'fire':
          data[i] = (Math.random() * 2 - 1) * (0.15 + Math.random() * 0.15);
          break;
        case 'wind':
          data[i] = Math.sin(i / 1200) * 0.15 + (Math.random() * 2 - 1) * 0.06;
          break;
        case 'night':
          data[i] = (Math.random() * 2 - 1) * 0.05 + (Math.random() > 0.995 ? Math.sin(i / 50) * 0.3 : 0);
          break;
        default:
          data[i] = (Math.random() * 2 - 1) * 0.15;
      }
    }

    // Apply simple lowpass filter effect
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'wind' ? 400 : type === 'ocean' ? 600 : 800;
    filter.connect(gainNode);

    let source: AudioBufferSourceNode | null = null;

    return {
      start: () => {
        source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(filter);
        source.start();
      },
      stop: () => {
        source?.stop();
        ctx.close();
      },
      setVolume: (v: number) => {
        gainNode.gain.value = v;
      },
    };
  } catch {
    return null;
  }
}

export default function WhiteNoise() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.3);
  const [timer, setTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const audioRef = useRef<ReturnType<typeof createNoise>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      if (playing) stopSound();
    }
  }, [timeLeft]);

  const playSound = (id: string) => {
    audioRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);

    const noise = createNoise(id);
    if (noise) {
      noise.setVolume(volume);
      noise.start();
      audioRef.current = noise;
      setPlaying(id);

      if (timer > 0) {
        setTimeLeft(timer * 60);
        timerRef.current = setInterval(() => {
          setTimeLeft((t) => t - 1);
        }, 1000);
      }
    }
  };

  const stopSound = () => {
    audioRef.current?.stop();
    audioRef.current = null;
    setPlaying(null);
    setTimeLeft(0);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    audioRef.current?.setVolume(v);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
      {/* Sound Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
        {sounds.map((s) => (
          <button
            key={s.id}
            onClick={() => playing === s.id ? stopSound() : playSound(s.id)}
            style={{
              padding: '16px 8px',
              borderRadius: 16,
              border: playing === s.id ? `2px solid ${s.color}` : '2px solid #EDE5DB',
              background: playing === s.id ? `${s.color}15` : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s',
              textAlign: 'center' as const,
            }}
          >
            <span style={{ fontSize: 28, display: 'block', marginBottom: 4 }}>{s.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: playing === s.id ? s.color : '#5A4E42', display: 'block' }}>{s.name}</span>
            <span style={{ fontSize: 11, color: '#9A8A7A' }}>{s.desc}</span>
          </button>
        ))}
      </div>

      {/* Volume */}
      <div style={{ maxWidth: 400, margin: '0 auto 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14 }}>🔈</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => handleVolume(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: '#E8A87C' }}
        />
        <span style={{ fontSize: 14 }}>🔊</span>
      </div>

      {/* Timer */}
      <div style={{ maxWidth: 400, margin: '0 auto 20px' }}>
        <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 8, textAlign: 'center' as const }}>⏰ 定時關閉</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' as const }}>
          {timerOptions.map((t) => (
            <button
              key={t.minutes}
              onClick={() => setTimer(t.minutes)}
              style={{
                padding: '6px 14px',
                borderRadius: 12,
                border: timer === t.minutes ? '2px solid #E8A87C' : '2px solid #EDE5DB',
                background: timer === t.minutes ? '#E8A87C10' : 'white',
                color: timer === t.minutes ? '#E8A87C' : '#5A4E42',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'Noto Sans TC, sans-serif',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        {playing ? (
          <>
            <p style={{ fontSize: 14, color: '#5A4E42' }}>
              正在播放：{sounds.find((s) => s.id === playing)?.emoji} {sounds.find((s) => s.id === playing)?.name}
            </p>
            {timeLeft > 0 && (
              <p style={{ fontSize: 13, color: '#9A8A7A', marginTop: 4 }}>
                剩餘 {formatTime(timeLeft)}
              </p>
            )}
            <button
              onClick={stopSound}
              style={{ marginTop: 12, padding: '10px 24px', borderRadius: 999, border: 'none', background: '#9A8A7A', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'Quicksand, Noto Sans TC, sans-serif' }}
            >
              ⏸ 停止
            </button>
          </>
        ) : (
          <p style={{ fontSize: 14, color: '#9A8A7A' }}>選擇一個音效開始放鬆 ♡</p>
        )}
      </div>
    </div>
  );
}
