import { useState, useEffect, useRef, useCallback } from 'react';
import { track } from './ui';

// 4-4-6 節奏，13 循環 = 182 秒（約 3 分鐘）
const PHASES = [
  { key: 'inhale', label: '吸氣', seconds: 4 },
  { key: 'hold', label: '停住', seconds: 4 },
  { key: 'exhale', label: '吐氣', seconds: 6 },
] as const;
const CYCLE_MS = PHASES.reduce((s, p) => s + p.seconds, 0) * 1000;
const TOTAL_CYCLES = 13;
const TOTAL_MS = CYCLE_MS * TOTAL_CYCLES;

type Status = 'idle' | 'running' | 'paused' | 'completed';

// 用經過時間推算目前階段，避免 setInterval 漂移；暫停時 elapsed 凍結
function describe(elapsedMs: number) {
  const e = Math.min(elapsedMs, TOTAL_MS);
  const cycle = Math.min(Math.floor(e / CYCLE_MS), TOTAL_CYCLES - 1);
  let within = e - cycle * CYCLE_MS;
  let idx = 0;
  while (idx < PHASES.length - 1 && within >= PHASES[idx].seconds * 1000) {
    within -= PHASES[idx].seconds * 1000;
    idx++;
  }
  const phaseMs = PHASES[idx].seconds * 1000;
  const progress = Math.min(within / phaseMs, 1);
  return {
    cycle: cycle + 1,
    phase: PHASES[idx],
    phaseLeft: Math.max(1, Math.ceil((phaseMs - within) / 1000)),
    progress,
    remaining: Math.max(0, Math.ceil((TOTAL_MS - e) / 1000)),
  };
}

const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

export default function BreathingExercise() {
  const [status, setStatus] = useState<Status>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [pausedByHide, setPausedByHide] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const accRef = useRef(0);              // 暫停前累積的毫秒
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const speedRef = useRef(1);            // ?speed=N 只用於測試完成畫面

  useEffect(() => {
    const s = Number(new URLSearchParams(location.search).get('speed'));
    if (s > 1 && s <= 60) speedRef.current = s;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
  }, []);

  const now = () => performance.now() * speedRef.current;

  const stopLoop = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const loop = useCallback(() => {
    if (startRef.current === null) return;
    const e = accRef.current + (now() - startRef.current);
    if (e >= TOTAL_MS) {
      accRef.current = TOTAL_MS;
      startRef.current = null;
      setElapsed(TOTAL_MS);
      setStatus('completed');
      track('tool_complete', { tool_id: 'breathing' });
      return;
    }
    setElapsed(e);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const run = () => {
    stopLoop();                          // 重複點擊不會產生多組計時
    startRef.current = now();
    setPausedByHide(false);
    setStatus('running');
    rafRef.current = requestAnimationFrame(loop);
  };

  const start = () => {
    accRef.current = 0;
    setElapsed(0);
    track('tool_start', { tool_id: 'breathing' });
    run();
  };

  const pause = (byHide = false) => {
    if (startRef.current === null) return;
    accRef.current += now() - startRef.current;
    startRef.current = null;
    stopLoop();
    setElapsed(accRef.current);
    setPausedByHide(byHide);
    setStatus('paused');
  };

  const end = () => {
    stopLoop();
    startRef.current = null;
    accRef.current = 0;
    setElapsed(0);
    setStatus('idle');
  };

  // 切到背景自動暫停；回來不自動繼續
  useEffect(() => {
    const onHide = () => { if (document.hidden && startRef.current !== null) pause(true); };
    document.addEventListener('visibilitychange', onHide);
    return () => { document.removeEventListener('visibilitychange', onHide); stopLoop(); };
  }, []);

  const info = describe(elapsed);
  const active = status === 'running' || status === 'paused';

  // 圓圈大小由進度推算，暫停時自然凍結
  let scale = 1;
  if (active && !reduceMotion) {
    if (info.phase.key === 'inhale') scale = 1 + 0.22 * info.progress;
    else if (info.phase.key === 'hold') scale = 1.22;
    else scale = 1.22 - 0.22 * info.progress;
  }

  return (
    <div className="text-center">
      {/* 只在階段改變時通知螢幕閱讀器，不每秒朗讀 */}
      <p className="sr-only" aria-live="polite">
        {status === 'running' ? info.phase.label : status === 'paused' ? '已暫停' : status === 'completed' ? '練習完成' : ''}
      </p>

      <div className="relative mx-auto my-4 flex items-center justify-center" style={{ width: 'min(260px, 70vw)', aspectRatio: '1' }}>
        <div className="absolute inset-0 rounded-full" style={{ background: '#EEF3EC' }} aria-hidden="true" />
        <div
          className="tl-motion absolute rounded-full"
          style={{ inset: '12%', background: '#DCE7D8', transform: `scale(${scale})` }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col items-center justify-center rounded-full bg-white" style={{ width: '58%', aspectRatio: '1', boxShadow: '0 2px 10px rgba(74,62,52,.06)' }}>
          {status === 'idle' && (
            <>
              <img src="/images/ui/tools/breathing.png" alt="" width="56" height="56" className="w-14 h-14 object-contain" />
              <span className="mt-1 font-bold text-warmgray-800">準備好了嗎？</span>
            </>
          )}
          {status === 'running' && (
            <>
              <span className="text-[22px] font-bold text-warmgray-800">{info.phase.label}</span>
              <span className="text-[40px] leading-none font-bold mt-1" style={{ color: '#6E8E6A' }}>{info.phaseLeft}</span>
            </>
          )}
          {status === 'paused' && (
            <>
              <span className="text-2xl font-bold" style={{ color: '#6E8E6A' }} aria-hidden="true">❚❚</span>
              <span className="mt-1 font-bold text-warmgray-800">已暫停</span>
              <span className="text-sm tl-muted">{info.phase.label}・{info.phaseLeft} 秒</span>
            </>
          )}
          {status === 'completed' && (
            <>
              <span className="text-[34px] leading-none font-bold" style={{ color: '#6E8E6A' }} aria-hidden="true">✓</span>
              <span className="mt-1 font-bold text-warmgray-800">完成</span>
            </>
          )}
        </div>
      </div>

      {active && (
        <div className="mb-4">
          <p className="text-warmgray-800">剩餘 <span className="text-2xl font-bold tabular-nums">{fmt(info.remaining)}</span></p>
          <p className="text-sm tl-muted">第 {info.cycle} / {TOTAL_CYCLES} 次呼吸</p>
        </div>
      )}

      {status === 'completed' && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-warmgray-800">謝謝你，留了時間給自己</h2>
          <p className="tl-muted">這次練習已完成</p>
        </div>
      )}

      {pausedByHide && status === 'paused' && (
        <p className="tl-notice justify-center mb-4">已暫停，準備好再繼續</p>
      )}

      {/* 節奏說明 */}
      <ol className="grid grid-cols-3 rounded-2xl mb-5 list-none p-0" style={{ background: '#FAF6F1' }} aria-label="這次的呼吸節奏">
        {PHASES.map((p) => (
          <li
            key={p.key}
            className="py-3 text-[15px]"
            style={active && info.phase.key === p.key ? { color: '#4A3E34', fontWeight: 700 } : { color: '#716256' }}
          >
            {p.label}<br />{p.seconds} 秒
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-2.5 max-w-sm mx-auto">
        {status === 'idle' && (
          <>
            <button type="button" className="tl-btn tl-btn-primary w-full" onClick={start}>開始練習</button>
            <p className="text-sm tl-muted">吸 4 秒・停住 4 秒・吐 6 秒，共 13 次，約 3 分鐘</p>
          </>
        )}
        {status === 'running' && (
          <>
            <button type="button" className="tl-btn tl-btn-primary w-full" onClick={() => pause()}>暫停</button>
            <button type="button" className="tl-btn tl-btn-secondary w-full" onClick={end}>結束練習</button>
          </>
        )}
        {status === 'paused' && (
          <>
            <button type="button" className="tl-btn tl-btn-primary w-full" onClick={run}>繼續練習</button>
            <button type="button" className="tl-btn tl-btn-secondary w-full" onClick={end}>結束練習</button>
          </>
        )}
        {status === 'completed' && (
          <>
            <button type="button" className="tl-btn tl-btn-primary w-full" onClick={start}>再練習一次</button>
            <a href="/tools/" className="tl-btn tl-btn-secondary w-full">返回工具館</a>
          </>
        )}
      </div>

      <p className="text-sm tl-muted mt-5">以舒服的方式呼吸；若不舒服，可以隨時停止。</p>
    </div>
  );
}
