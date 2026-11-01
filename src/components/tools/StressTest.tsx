import { useState, useEffect, useRef } from 'react';
import { CopyButton, Notice, track } from './ui';

// 站方自編的 10 題生活自我覺察題，沒有正式量表來源：
// 每題 0–3 分、總分 0–30，只顯示分數作生活參考，不做低／中／高等級或診斷判定（改版規劃 8.1）。
const questions = [
  '你最近是否常常覺得很疲累，即使睡了也不夠？',
  '你是否經常對孩子或家人發脾氣，事後又後悔？',
  '你是否覺得自己的時間永遠不夠用？',
  '你是否經常覺得自己「不夠好」？',
  '你是否很少有完全屬於自己的時間？',
  '你是否常常感到焦慮或擔心？',
  '你是否覺得做家事是永遠做不完的循環？',
  '你是否很少跟朋友見面或聊天？',
  '你是否覺得自己的興趣和夢想都放下了？',
  '你是否常常忘記好好吃一頓飯？',
];

const options = [
  { label: '從不', score: 0 },
  { label: '偶爾', score: 1 },
  { label: '經常', score: 2 },
  { label: '總是', score: 3 },
];

const MAX_SCORE = questions.length * 3;

const actions = [
  { title: '留 3 分鐘給自己', desc: '暫停一下，跟著節奏慢慢呼吸。', href: '/tools/breathing/' },
  { title: '留下一件可以晚點做的事', desc: '把不急的事往後放，減少此刻的負擔。', href: '/tools/priority/' },
  { title: '找信任的人聊聊', desc: '說出來，讓情緒有個出口。' },
];

type Stage = 'intro' | 'quiz' | 'result';

export default function StressTest() {
  const [stage, setStage] = useState<Stage>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => new Array(questions.length).fill(-1));
  const resultRef = useRef<HTMLHeadingElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);

  const answered = answers.filter((a) => a >= 0).length;
  const total = answers.reduce((s, a) => s + (a >= 0 ? a : 0), 0);
  const isLast = current === questions.length - 1;
  const hasAnswer = answers[current] >= 0;
  const progress = stage === 'result' ? 100 : Math.round((answered / questions.length) * 100);

  // 切到結果時把焦點移到結果標題；切題時移到題目
  useEffect(() => {
    if (stage === 'result') resultRef.current?.focus();
  }, [stage]);
  useEffect(() => {
    if (stage === 'quiz') questionRef.current?.focus();
  }, [stage, current]);

  const select = (score: number) => {
    // 改答只取代該題分數，不累加
    setAnswers((prev) => prev.map((a, i) => (i === current ? score : a)));
  };

  const next = () => {
    if (!hasAnswer) return;
    if (isLast) {
      track('tool_complete', { tool_id: 'stress-test' });
      setStage('result');
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const start = () => {
    track('tool_start', { tool_id: 'stress-test' });
    setStage('quiz');
  };

  const reset = () => {
    setAnswers(new Array(questions.length).fill(-1));
    setCurrent(0);
    setStage('intro');
  };

  const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Taipei' });
  const copyText = `媽媽壓力自我檢視\n${today}\n自我檢視分數：${total} / ${MAX_SCORE}\n（生活自我覺察，不是醫療診斷）\nhttps://chparenting.com/tools/stress-test/`;

  if (stage === 'intro') {
    return (
      <div className="text-center">
        <img src="/images/ui/illustration-mom.webp" alt="" width="200" height="200" className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-2" />
        <p className="text-lg font-bold text-warmgray-800">10 題・約 2 分鐘</p>
        <p className="tl-muted mt-1">依最近一週的感受作答</p>
        <div className="mt-5 text-left">
          <Notice>
            <strong>生活自我覺察，非醫療診斷。</strong>這份檢視只是幫助你看見自己最近的狀態，不是心理量表，也不會給你任何診斷。
          </Notice>
        </div>
        <button type="button" className="tl-btn tl-btn-primary w-full max-w-sm mt-6" onClick={start}>開始檢視</button>
      </div>
    );
  }

  if (stage === 'result') {
    return (
      <div>
        <div className="mb-5">
          <div className="flex justify-between text-sm tl-muted mb-1.5">
            <span>已完成 {questions.length} / {questions.length} 題</span>
            <span>100%</span>
          </div>
          <div className="tl-progress" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}><span style={{ width: '100%' }} /></div>
        </div>

        <img src="/images/ui/illustration-mom.webp" alt="" width="160" height="160" className="w-36 h-36 mx-auto mb-2" />
        <h2 ref={resultRef} tabIndex={-1} className="text-2xl font-bold text-warmgray-800 text-center outline-none">
          先照顧現在的自己
        </h2>
        <p className="text-center mt-3 text-warmgray-800">
          自我檢視分數
          <span className="mx-2 text-4xl font-bold tabular-nums" style={{ color: '#C07D52' }}>{total}</span>
          / {MAX_SCORE}
        </p>
        <p className="text-sm tl-muted text-center mt-2">這份結果只是生活自我覺察的參考，幫助你看見自己目前的狀態與需要，不是醫療診斷。</p>

        <h3 className="font-bold text-warmgray-800 mt-6 mb-2">你可以試試看</h3>
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          {actions.map((a) => (
            <li key={a.title}>
              {a.href ? (
                <a href={a.href} className="tl-option tl-focus no-underline py-3">
                  <span>
                    <span className="block font-bold">{a.title}</span>
                    <span className="block text-sm tl-muted">{a.desc}</span>
                  </span>
                </a>
              ) : (
                <div className="tl-option cursor-default py-3">
                  <span>
                    <span className="block font-bold">{a.title}</span>
                    <span className="block text-sm tl-muted">{a.desc}</span>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>

        <p className="text-sm tl-muted mt-4">若困擾持續影響生活，可以尋求合適的專業支持。</p>

        <div className="flex flex-col gap-2.5 max-w-sm mx-auto mt-6">
          <a href="/tools/breathing/" className="tl-btn tl-btn-primary w-full">開始呼吸練習</a>
          <CopyButton text={copyText} label="複製結果" className="tl-btn tl-btn-secondary w-full" toolId="stress-test" />
        </div>
        <div className="flex justify-center gap-2 mt-3">
          <button type="button" className="tl-btn tl-btn-ghost text-sm" onClick={() => { setCurrent(questions.length - 1); setStage('quiz'); }}>修改答案</button>
          <button type="button" className="tl-btn tl-btn-ghost text-sm" onClick={reset}>重新測驗</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <div className="flex justify-between text-sm tl-muted mb-1.5">
          <span>第 {current + 1} / {questions.length} 題・已完成 {answered} 題</span>
          <span>{progress}%</span>
        </div>
        <div className="tl-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
      </div>

      <img src="/images/ui/illus/thinking-mom.webp" alt="" width="160" height="160" className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-3" />
      <h2 ref={questionRef} tabIndex={-1} id="stress-question" className="text-xl font-bold text-warmgray-800 leading-snug mb-4 outline-none">
        {questions[current]}
      </h2>

      <div role="radiogroup" aria-labelledby="stress-question" className="flex flex-col gap-2">
        {options.map((opt) => {
          const checked = answers[current] === opt.score;
          return (
            <label
              key={opt.label}
              className={`tl-option focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-sage-400 ${checked ? 'is-selected' : ''}`}
            >
              <input
                type="radio"
                name={`stress-q${current}`}
                value={opt.score}
                aria-label={opt.label}
                checked={checked}
                onChange={() => select(opt.score)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="inline-flex w-5 h-5 rounded-full border-2 items-center justify-center shrink-0"
                style={{ borderColor: checked ? '#8BA888' : '#D9CCBF' }}
              >
                {checked && <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#8BA888' }} />}
              </span>
              <span className="font-medium">{opt.label}</span>
            </label>
          );
        })}
      </div>

      {!hasAnswer && <p className="text-sm tl-muted mt-3" role="status">請先選一個答案</p>}

      <div className="flex gap-2.5 mt-5">
        <button type="button" className="tl-btn tl-btn-secondary flex-1" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
          上一題
        </button>
        <button type="button" className="tl-btn tl-btn-primary flex-1" onClick={next} disabled={!hasAnswer}>
          {isLast ? '查看結果' : '下一題'}
        </button>
      </div>
    </div>
  );
}
