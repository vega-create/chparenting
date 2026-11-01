import { useState, useRef, useEffect, useCallback } from 'react';
import { Notice, track } from './ui';

// 六種聲音皆為 Web Audio API 即時合成的雜訊（非錄音檔），
// 所以描述用「像…的」而非宣稱真實鳥鳴／蟲鳴。
const sounds = [
  { id: 'rain', name: '雨聲', desc: '細密的沙沙聲' },
  { id: 'ocean', name: '海浪', desc: '緩慢起伏的浪聲' },
  { id: 'forest', name: '森林', desc: '柔和的低鳴' },
  { id: 'fire', name: '篝火', desc: '劈啪的暖聲' },
  { id: 'wind', name: '微風', desc: '輕輕吹過的風' },
  { id: 'night', name: '夜晚', desc: '安靜的夜間底噪' },
];

const timerOptions = [
  { label: '不限', minutes: 0 },
  { label: '5 分鐘', minutes: 5 },
  { label: '15 分鐘', minutes: 15 },
  { label: '30 分鐘', minutes: 30 },
  { label: '60 分鐘', minutes: 60 },
];

type Status = 'stopped' | 'playing' | 'paused';

interface Engine { ctx: AudioContext; gain: GainNode; source: AudioBufferSourceNode }

function createEngine(type: string, volume: number): Engine {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.connect(ctx.destination);

  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    switch (type) {
      case 'rain': data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.97 ? 0.8 : 0.15); break;
      case 'ocean': data[i] = Math.sin(i / 800) * 0.3 + (Math.random() * 2 - 1) * 0.1; break;
      case 'forest': data[i] = (Math.random() * 2 - 1) * 0.08 + Math.sin(i / 2000) * 0.05; break;
      case 'fire': data[i] = (Math.random() * 2 - 1) * (0.15 + Math.random() * 0.15); break;
      case 'wind': data[i] = Math.sin(i / 1200) * 0.15 + (Math.random() * 2 - 1) * 0.06; break;
      case 'night': data[i] = (Math.random() * 2 - 1) * 0.05 + (Math.random() > 0.995 ? Math.sin(i / 50) * 0.3 : 0); break;
      default: data[i] = (Math.random() * 2 - 1) * 0.15;
    }
  }
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = type === 'wind' ? 400 : type === 'ocean' ? 600 : 800;
  filter.connect(gain);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(filter);
  source.start();
  return { ctx, gain, source };
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

export default function WhiteNoise() {
  const [status, setStatus] = useState<Status>('stopped');
  const [selected, setSelected] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.3);
  const [timer, setTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(0);

  const clearTick = () => { if (tickRef.current) clearInterval(tickRef.current); tickRef.current = null; };

  const teardown = useCallback(() => {
    clearTick();
    const e = engineRef.current;
    if (e) {
      try { e.source.stop(); } catch { /* 已停止 */ }
      e.ctx.close().catch(() => {});
      engineRef.current = null;
    }
  }, []);

  useEffect(() => teardown, [teardown]);

  const stop = useCallback(() => {
    teardown();
    setStatus('stopped');
    setTimeLeft(0);
    timeLeftRef.current = 0;
  }, [teardown]);

  const startTick = () => {
    clearTick();
    tickRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) stop();
    }, 1000);
  };

  const play = (id: string) => {
    teardown();
    setError(null);
    try {
      engineRef.current = createEngine(id, volume);
    } catch {
      setSelected(id);
      setStatus('stopped');
      setError('目前無法播放，請再試一次');
      return;
    }
    setSelected(id);
    setStatus('playing');
    track('tool_start', { tool_id: 'white-noise' });
    if (timer > 0) {
      timeLeftRef.current = timer * 60;
      setTimeLeft(timeLeftRef.current);
      startTick();
    } else {
      timeLeftRef.current = 0;
      setTimeLeft(0);
    }
  };

  const pause = async () => {
    const e = engineRef.current;
    if (!e) return;
    clearTick();
    await e.ctx.suspend().catch(() => {});
    setStatus('paused');
  };

  const resume = async () => {
    const e = engineRef.current;
    if (!e) return;
    await e.ctx.resume().catch(() => {});
    setStatus('playing');
    if (timeLeftRef.current > 0) startTick();
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (engineRef.current) engineRef.current.gain.gain.value = v;
  };

  // 選新定時值 = 從當下重新計時
  const changeTimer = (minutes: number) => {
    setTimer(minutes);
    if (status === 'stopped') return;
    clearTick();
    timeLeftRef.current = minutes * 60;
    setTimeLeft(timeLeftRef.current);
    if (minutes > 0 && status === 'playing') startTick();
  };

  const current = sounds.find((s) => s.id === selected);
  const statusText =
    status === 'playing' ? `正在播放：${current?.name}` :
    status === 'paused' ? `已暫停：${current?.name}` :
    selected && !error ? '已停止' : '尚未播放，選擇聲音即可播放';

  return (
    <div>
      <p className="font-bold text-warmgray-800 mb-3" role="status" aria-live="polite">{statusText}</p>

      <div className="grid grid-cols-3 gap-2.5 mb-5" role="group" aria-label="選擇聲音">
        {sounds.map((s) => {
          const on = selected === s.id && status !== 'stopped';
          return (
            <button
              key={s.id}
              type="button"
              className="tl-option flex-col items-center justify-center text-center !px-2 py-3"
              aria-pressed={on}
              onClick={() => (on ? pause() : play(s.id))}
            >
              <img src={`/images/ui/sounds/${s.id}.png`} alt="" width="40" height="40" className="w-10 h-10" />
              <span className="font-bold text-[15px]">{s.name}{on ? ' ✓' : ''}</span>
              <span className="text-xs tl-muted">{s.desc}</span>
            </button>
          );
        })}
      </div>

      {error && <div className="mb-4"><Notice tone="warn">{error}</Notice></div>}

      <div className="mb-4">
        <label htmlFor="wn-volume" className="flex justify-between text-sm text-warmgray-800 mb-1">
          <span>音量</span><span>{Math.round(volume * 100)}%</span>
        </label>
        <input
          id="wn-volume" type="range" min="0" max="1" step="0.05" value={volume}
          onChange={(e) => changeVolume(parseFloat(e.target.value))}
          className="w-full h-11" style={{ accentColor: '#8BA888' }}
        />
      </div>

      <div className="mb-5">
        <p className="text-sm text-warmgray-800 mb-2">定時停止{timeLeft > 0 && status !== 'stopped' ? `・剩餘 ${fmt(timeLeft)}` : ''}</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="定時停止">
          {timerOptions.map((t) => (
            <button
              key={t.minutes}
              type="button"
              className="tl-option !min-h-[44px] !px-3.5 text-sm"
              aria-pressed={timer === t.minutes}
              onClick={() => changeTimer(t.minutes)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        {status === 'stopped' && (
          <button type="button" className="tl-btn tl-btn-primary flex-1" disabled={!selected} onClick={() => selected && play(selected)}>
            {selected ? '播放' : '先選一個聲音'}
          </button>
        )}
        {status === 'playing' && <button type="button" className="tl-btn tl-btn-primary flex-1" onClick={pause}>暫停</button>}
        {status === 'paused' && <button type="button" className="tl-btn tl-btn-primary flex-1" onClick={resume}>繼續</button>}
        <button type="button" className="tl-btn tl-btn-secondary flex-1" disabled={status === 'stopped'} onClick={stop}>停止播放</button>
      </div>
    </div>
  );
}
