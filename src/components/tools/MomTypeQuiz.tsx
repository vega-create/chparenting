import { useState, useEffect, useRef } from 'react';
import { CopyButton, track } from './ui';

type TypeKey = 'A' | 'B' | 'C' | 'D';

const questions: { q: string; options: { text: string; type: TypeKey }[] }[] = [
  {
    q: '孩子打翻牛奶時，你的第一反應？',
    options: [
      { text: '立刻拿抹布，邊擦邊教', type: 'A' },
      { text: '深呼吸，告訴自己不生氣', type: 'B' },
      { text: '「沒關係～我們一起擦！」', type: 'C' },
      { text: '拍照發限動，再來處理', type: 'D' },
    ],
  },
  {
    q: '關於孩子的教育，你覺得⋯',
    options: [
      { text: '學習習慣和規矩最重要', type: 'A' },
      { text: '開心健康就好，不要太多壓力', type: 'B' },
      { text: '多陪伴、多鼓勵、給自由', type: 'C' },
      { text: '用最新的教育方法和資源', type: 'D' },
    ],
  },
  {
    q: '週末你最想做什麼？',
    options: [
      { text: '安排學習活動或親子課程', type: 'A' },
      { text: '什麼都不做，躺在沙發上', type: 'B' },
      { text: '全家一起野餐或散步', type: 'C' },
      { text: '帶小孩去新奇的地方探險', type: 'D' },
    ],
  },
  {
    q: '孩子說「我不想上學」，你會⋯',
    options: [
      { text: '了解原因，但堅持該去就去', type: 'A' },
      { text: '好吧，請一天假也沒關係', type: 'B' },
      { text: '抱抱他，慢慢聊是怎麼了', type: 'C' },
      { text: '「那我們在家做更有趣的事！」', type: 'D' },
    ],
  },
  {
    q: '你的包包裡一定會有⋯',
    options: [
      { text: '衛生紙、濕紙巾、備用衣服（一應俱全）', type: 'A' },
      { text: '手機和錢包就夠了', type: 'B' },
      { text: '小零食和小朋友喜歡的貼紙', type: 'C' },
      { text: '平板和各種小道具', type: 'D' },
    ],
  },
];

type MomType = { name: string; desc: string; values: string; tip: string };

// 順序即平手時的優先順序（固定規則，不隨機）
const typeOrder: TypeKey[] = ['A', 'B', 'C', 'D'];
const types: Record<TypeKey, MomType> = {
  A: { name: '規劃型媽媽', desc: '你的回答偏向有條理、重視規矩，喜歡把家裡的大小事安排妥當。', values: '生活有秩序，孩子有清楚的界線', tip: '不是所有事都要做到完美，偶爾也讓自己放鬆一下。' },
  B: { name: '自在型媽媽', desc: '你的回答偏向順其自然、不強求，相信孩子有自己的節奏。', values: '孩子被接納，家裡的氣氛輕鬆', tip: '在放手與牽手之間找到平衡，適時給一點引導也很好。' },
  C: { name: '暖心陪伴型媽媽', desc: '你的回答偏向陪伴與理解，重視和孩子之間的情感連結。', values: '陪孩子一起面對，讓孩子感到被接住', tip: '在照顧別人的同時，也留一點空間給自己。' },
  D: { name: '創意冒險型媽媽', desc: '你的回答偏向嘗試新鮮事，喜歡帶孩子探索不一樣的體驗。', values: '孩子的好奇心，和一起玩的樂趣', tip: '平淡的日常也是一種幸福，慢下來也很好。' },
};

// 回傳得票最高的類型（可能多個），依 typeOrder 排序
function topTypes(answers: (TypeKey | null)[]): TypeKey[] {
  const counts: Record<TypeKey, number> = { A: 0, B: 0, C: 0, D: 0 };
  answers.forEach((a) => { if (a) counts[a] += 1; });
  const max = Math.max(...typeOrder.map((k) => counts[k]));
  return typeOrder.filter((k) => counts[k] === max);
}

type Stage = 'quiz' | 'result';

export default function MomTypeQuiz() {
  const [stage, setStage] = useState<Stage>('quiz');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(TypeKey | null)[]>(() => new Array(questions.length).fill(null));
  const resultRef = useRef<HTMLHeadingElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  const answered = answers.filter(Boolean).length;
  const isLast = current === questions.length - 1;
  const hasAnswer = answers[current] !== null;
  const progress = stage === 'result' ? 100 : Math.round((answered / questions.length) * 100);

  useEffect(() => {
    if (stage === 'result') resultRef.current?.focus();
  }, [stage]);
  useEffect(() => {
    if (stage === 'quiz' && (current > 0 || started.current)) questionRef.current?.focus();
  }, [stage, current]);

  const select = (type: TypeKey) => {
    if (!started.current) { started.current = true; track('tool_start', { tool_id: 'mom-type' }); }
    setAnswers((prev) => prev.map((a, i) => (i === current ? type : a)));
  };

  const next = () => {
    if (!hasAnswer) return;
    if (isLast) {
      track('tool_complete', { tool_id: 'mom-type' });
      setStage('result');
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const reset = () => {
    setAnswers(new Array(questions.length).fill(null));
    setCurrent(0);
    setStage('quiz');
  };

  if (stage === 'result') {
    const winners = topTypes(answers);
    const primary = types[winners[0]];
    const tie = winners.length > 1;
    const tieNames = winners.map((k) => types[k].name);
    const copyText = `你是哪種媽媽？\n我的結果：${primary.name}${tie ? `（同時帶有 ${tieNames.join(' 與 ')} 的特質）` : ''}\n${primary.desc}\n（趣味測驗，沒有好壞之分）\nhttps://chparenting.com/tools/mom-type/`;

    return (
      <div>
        <img src="/images/ui/illus/mom-hug.webp" alt="" width="160" height="160" className="w-36 h-36 mx-auto mb-1" />
        <p className="text-sm tl-muted text-center">趣味測驗，沒有好壞之分</p>
        <h2 ref={resultRef} tabIndex={-1} className="text-center mt-3 outline-none">
          <span className="inline-block rounded-full px-6 py-2.5 text-2xl font-bold text-white" style={{ background: '#8BA888' }}>
            {primary.name}
          </span>
        </h2>
        {tie && (
          <p className="text-center mt-3 text-warmgray-800">你同時帶有 {tieNames.join(' 與 ')} 的特質</p>
        )}
        <p className="text-center mt-3 text-warmgray-800 leading-relaxed">{primary.desc}</p>

        <dl className="mt-5 flex flex-col gap-3">
          <div className="tl-option cursor-default py-3 flex-col items-start gap-0.5">
            <dt className="font-bold">你重視的事：</dt>
            <dd className="m-0 tl-muted">{primary.values}</dd>
          </div>
          <div className="tl-option cursor-default py-3 flex-col items-start gap-0.5">
            <dt className="font-bold">給自己的提醒：</dt>
            <dd className="m-0 tl-muted">{primary.tip}</dd>
          </div>
        </dl>

        <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
          <CopyButton text={copyText} label="複製結果" className="tl-btn tl-btn-primary flex-1" toolId="mom-type" />
          <button type="button" className="tl-btn tl-btn-secondary flex-1" onClick={reset}>重新測驗</button>
        </div>
        <div className="flex justify-center mt-3">
          <button type="button" className="tl-btn tl-btn-ghost text-sm" onClick={() => { setCurrent(questions.length - 1); setStage('quiz'); }}>修改答案</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <img src="/images/ui/illus/mom-hug.webp" alt="" width="176" height="176" className="w-36 h-36 sm:w-44 sm:h-44 mx-auto mb-1" />
      <p className="text-sm tl-muted text-center mb-4">趣味測驗，沒有好壞之分，只是不同的生活風格與特質。</p>
      <div className="mb-5">
        <div className="flex justify-between text-sm tl-muted mb-1.5">
          <span>第 {current + 1} / {questions.length} 題・已完成 {answered} 題</span>
          <span>{progress}%</span>
        </div>
        <div className="tl-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
      </div>

      <h2 ref={questionRef} tabIndex={-1} id="momtype-question" className="text-xl font-bold text-warmgray-800 leading-snug mb-4 outline-none">
        {questions[current].q}
      </h2>

      <div role="radiogroup" aria-labelledby="momtype-question" className="flex flex-col gap-2">
        {questions[current].options.map((opt) => {
          const checked = answers[current] === opt.type;
          return (
            <label
              key={opt.type}
              className={`tl-option focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-sage-400 ${checked ? 'is-selected' : ''}`}
            >
              <input
                type="radio"
                name={`momtype-q${current}`}
                value={opt.type}
                aria-label={opt.text}
                checked={checked}
                onChange={() => select(opt.type)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="inline-flex w-5 h-5 rounded-full border-2 items-center justify-center shrink-0"
                style={{ borderColor: checked ? '#8BA888' : '#D9CCBF' }}
              >
                {checked && <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#8BA888' }} />}
              </span>
              <span className="font-medium">{opt.text}</span>
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
