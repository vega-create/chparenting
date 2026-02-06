import { useState, useEffect, useRef } from 'react';

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale';

const phases: { phase: Phase; duration: number; label: string; color: string }[] = [
  { phase: 'inhale', duration: 4, label: '吸氣', color: '#E8A87C' },
  { phase: 'hold', duration: 4, label: '停住', color: '#D4B896' },
  { phase: 'exhale', duration: 6, label: '吐氣', color: '#8BA888' },
];

export default function BreathingExercise() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalCycles] = useState(13); // ~3 minutes
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIndexRef = useRef(0);

  useEffect(() => {
    if (!isRunning) return;

    if (cycles >= totalCycles) {
      setIsRunning(false);
      setCurrentPhase('idle');
      setCycles(0);
      return;
    }

    const phase = phases[phaseIndexRef.current];
    setCurrentPhase(phase.phase);
    setTimeLeft(phase.duration);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          phaseIndexRef.current = (phaseIndexRef.current + 1) % phases.length;
          if (phaseIndexRef.current === 0) {
            setCycles((c) => c + 1);
          }
          const nextPhase = phases[phaseIndexRef.current];
          setCurrentPhase(nextPhase.phase);
          return nextPhase.duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, cycles, totalCycles]);

  const start = () => {
    phaseIndexRef.current = 0;
    setCycles(0);
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
    setCurrentPhase('idle');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const getScale = () => {
    if (currentPhase === 'inhale') return 1.4;
    if (currentPhase === 'hold') return 1.4;
    if (currentPhase === 'exhale') return 1;
    return 1;
  };

  const getColor = () => {
    const phase = phases.find((p) => p.phase === currentPhase);
    return phase?.color || '#E8A87C';
  };

  const getLabel = () => {
    const phase = phases.find((p) => p.phase === currentPhase);
    return phase?.label || '';
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
      {/* Breathing circle */}
      <div style={{ position: 'relative', width: 240, height: 240, margin: '0 auto 2rem' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${getColor()}25, ${getColor()}08)`,
            border: `3px solid ${getColor()}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            transform: `scale(${getScale()})`,
            transition: `transform ${currentPhase === 'inhale' ? '4s' : currentPhase === 'exhale' ? '6s' : '0.3s'} ease-in-out`,
          }}
        >
          {isRunning ? (
            <>
              <span style={{ fontSize: 32, fontWeight: 700, color: getColor(), fontFamily: 'Quicksand, sans-serif' }}>
                {timeLeft}
              </span>
              <span style={{ fontSize: 16, color: '#5A4E42', marginTop: 4, fontWeight: 500 }}>
                {getLabel()}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 40 }}>🫁</span>
              <span style={{ fontSize: 14, color: '#9A8A7A', marginTop: 8 }}>
                {cycles > 0 ? '做得好！' : '準備好了嗎？'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      {isRunning && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            width: 200, height: 4, background: '#EDE5DB', borderRadius: 2, margin: '0 auto',
          }}>
            <div style={{
              width: `${(cycles / totalCycles) * 100}%`,
              height: '100%',
              background: '#E8A87C',
              borderRadius: 2,
              transition: 'width 0.5s',
            }} />
          </div>
          <p style={{ fontSize: 12, color: '#9A8A7A', marginTop: 8 }}>
            第 {cycles + 1} / {totalCycles} 次呼吸
          </p>
        </div>
      )}

      {/* Controls */}
      <button
        onClick={isRunning ? stop : start}
        style={{
          background: isRunning ? '#9A8A7A' : '#E8A87C',
          color: 'white',
          border: 'none',
          padding: '12px 32px',
          borderRadius: 999,
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
          boxShadow: `0 4px 20px ${isRunning ? '#9A8A7A30' : '#E8A87C30'}`,
          transition: 'all 0.3s',
        }}
      >
        {isRunning ? '⏸ 暫停' : cycles > 0 ? '🔄 再來一次' : '▶ 開始呼吸'}
      </button>

      {/* Instructions */}
      {!isRunning && cycles === 0 && (
        <div style={{
          marginTop: '2rem', padding: '1rem 1.5rem', background: '#F5F0EB',
          borderRadius: 16, maxWidth: 360, margin: '2rem auto 0',
        }}>
          <p style={{ fontSize: 13, color: '#7A6E62', lineHeight: 1.8 }}>
            吸氣 4 秒 → 停住 4 秒 → 吐氣 6 秒<br />
            跟著圓圈的大小一起呼吸，大約 3 分鐘
          </p>
        </div>
      )}

      {/* Completion */}
      {!isRunning && cycles >= totalCycles && (
        <div style={{
          marginTop: '2rem', padding: '1.5rem', background: '#B8C4A015',
          borderRadius: 16, border: '1px solid #B8C4A030', maxWidth: 360, margin: '2rem auto 0',
        }}>
          <p style={{ fontSize: 14, color: '#5A4E42', lineHeight: 1.8 }}>
            🎉 太棒了！你完成了 3 分鐘的呼吸練習。<br />
            感覺好一點了嗎？記得隨時回來充電 ♡
          </p>
        </div>
      )}
    </div>
  );
}
