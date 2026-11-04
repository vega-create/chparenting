import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import { CopyButton, Notice, track } from './ui';
import { continents, oceans, regions, getRegion, formatArea, mnemonics, type Region } from '../../data/continents';
import { MAP_W, MAP_H, MAP_OUTLINE, TAIWAN_XY, CONTINENT_PATHS, OCEAN_HIT_AREAS, LABEL_XY } from '../../data/world-map';

// 七大洲五大洋互動地圖：認識模式（點選看資料）、測驗模式（12 題點地圖作答）、口訣與排名；
// 另有列印空白地圖（只有輪廓與編號，用 @media print 處理，見 continents-oceans.astro）。

const TOOL_ID = 'continents-oceans';
type Mode = 'learn' | 'quiz' | 'rank';

const CONTINENT_FILL: Record<string, string> = {
  asia: '#E8A87C', africa: '#8BA888', europe: '#F3CBA5', 'north-america': '#C9D9C4',
  'south-america': '#D9B48F', oceania: '#A7C4A0', antarctica: '#E6E0D8',
};
const OCEAN_FILL = '#D9E9F0';
const OCEAN_HI = '#AFD0E0';
const OCEAN_AREA_TO_ID: Record<string, string> = {
  pacific: 'pacific', 'atlantic-l': 'atlantic', 'atlantic-r': 'atlantic', indian: 'indian', southern: 'southern', arctic: 'arctic',
};
const OCEAN_LABEL_KEYS = ['pacific', 'atlantic-l', 'atlantic-r', 'indian', 'southern', 'arctic'] as const;

// 列印版編號：依地圖左→右排，不照面積排名，避免洩漏「最大＝1」
const PRINT_NUMBERS: Record<string, string> = {
  europe: '1', africa: '2', asia: '3', oceania: '4', antarctica: '5', 'north-america': '6', 'south-america': '7',
  arctic: 'A', 'atlantic-l': 'B', 'atlantic-r': 'B', indian: 'C', pacific: 'D', southern: 'E',
};
const PRINT_CONTINENTS = ['europe', 'africa', 'asia', 'oceania', 'antarctica', 'north-america', 'south-america'];
const PRINT_OCEANS = ['arctic', 'atlantic', 'indian', 'pacific', 'southern'];

interface Question { prompt: string; answer: string; }
const FACT_QUESTIONS: Question[] = [
  { prompt: '哪一個是最大的洲？', answer: 'asia' },
  { prompt: '哪一個是最小的洲？', answer: 'oceania' },
  { prompt: '哪一個是最大的洋？', answer: 'pacific' },
  { prompt: '哪一個是最小的洋？', answer: 'arctic' },
  { prompt: '哪一個是第二大的洲？', answer: 'africa' },
  { prompt: '哪一個洋一整圈環繞著南極洲？', answer: 'southern' },
  { prompt: '台灣在哪一個洲？', answer: 'asia' },
  { prompt: '哪一個洲沒有國家、也沒有長住的居民？', answer: 'antarctica' },
  { prompt: '哪一個洲有亞馬遜雨林？', answer: 'south-america' },
  { prompt: '哪一個洋在美洲與歐洲、非洲之間？', answer: 'atlantic' },
  { prompt: '格陵蘭算在哪一個洲？', answer: 'north-america' },
  { prompt: '哪一個洲和亞洲連在同一塊陸地上？', answer: 'europe' },
];
const QUIZ_LENGTH = 12;
const LEARN_URL = 'https://learn.chparenting.com/history-geo/world/world-geography';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function buildQuiz(): Question[] {
  const point = shuffle(regions).slice(0, 7).map((r) => ({ prompt: `請點出「${r.name}」`, answer: r.id }));
  const facts = shuffle(FACT_QUESTIONS).slice(0, QUIZ_LENGTH - point.length);
  return shuffle([...point, ...facts]);
}

interface Answer { question: Question; chosen: string; }
interface QuizState { questions: Question[]; index: number; answers: Answer[]; }

const pointsAttr = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

export default function ContinentsMap() {
  const [mode, setMode] = useState<Mode>('learn');
  const [selected, setSelected] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [quiz, setQuiz] = useState<QuizState>(() => ({ questions: [], index: 0, answers: [] }));
  const [started, setStarted] = useState(false);

  const touch = useCallback(() => {
    if (!started) { setStarted(true); track('tool_start', { tool_id: TOOL_ID }); }
  }, [started]);

  const current = quiz.questions[quiz.index];
  const quizDone = quiz.questions.length > 0 && quiz.index >= quiz.questions.length;
  const lastAnswer = quiz.answers[quiz.index];   // 目前這題已作答時才有
  const answered = !!lastAnswer;

  const startQuiz = () => {
    touch();
    setQuiz({ questions: buildQuiz(), index: 0, answers: [] });
    setSelected(null);
    setMode('quiz');
  };

  const pick = (id: string) => {
    touch();
    if (mode === 'quiz') {
      if (!current || answered) return;
      setQuiz((q) => ({ ...q, answers: [...q.answers, { question: current, chosen: id }] }));
      return;
    }
    setSelected((s) => (s === id ? null : id));
  };

  const nextQuestion = () => {
    setQuiz((q) => {
      const next = q.index + 1;
      if (next >= q.questions.length) track('tool_complete', { tool_id: TOOL_ID });
      return { ...q, index: next };
    });
  };

  const score = quiz.answers.filter((a) => a.chosen === a.question.answer).length;
  const wrong = quiz.answers.filter((a) => a.chosen !== a.question.answer);
  const resultText = useMemo(() => {
    const lines = [`七大洲五大洋小測驗：${QUIZ_LENGTH} 題答對 ${score} 題`];
    if (wrong.length) {
      lines.push('錯的題目：');
      wrong.forEach((a) => lines.push(`・${a.question.prompt}　正確答案：${getRegion(a.question.answer).name}（我點了${getRegion(a.chosen).name}）`));
    } else {
      lines.push('全部答對！');
    }
    lines.push('', '來玩：https://chparenting.com/tools/continents-oceans/');
    return lines.join('\n');
  }, [score, wrong]);

  // 地圖上要強調的區域：認識模式＝選取；測驗模式作答後＝正解（綠）與點錯（紅）
  const highlight = (id: string): 'none' | 'selected' | 'correct' | 'wrong' => {
    if (mode === 'quiz') {
      if (!answered) return 'none';
      if (id === lastAnswer.question.answer) return 'correct';
      if (id === lastAnswer.chosen) return 'wrong';
      return 'none';
    }
    return selected === id ? 'selected' : 'none';
  };
  const strokeFor = (h: ReturnType<typeof highlight>) =>
    h === 'correct' ? { stroke: '#3F7A4A', strokeWidth: 3 } : h === 'wrong' ? { stroke: '#C0582F', strokeWidth: 3 } : h === 'selected' ? { stroke: '#3A2E24', strokeWidth: 2.5 } : { stroke: '#8C7B6B', strokeWidth: 0.8 };

  const onKey = (e: KeyboardEvent<SVGElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(id); }
  };

  const printBlank = () => {
    touch();
    document.documentElement.classList.add('co-printing');
    const done = () => document.documentElement.classList.remove('co-printing');
    window.addEventListener('afterprint', done, { once: true });
    window.print();
    // 部分瀏覽器不觸發 afterprint，保險起見延遲移除
    setTimeout(done, 3000);
  };

  const regionDetail: Region | null = selected ? getRegion(selected) : null;

  return (
    <div className="co-root">
      {/* 模式切換 */}
      <div className="flex flex-wrap items-center gap-2 mb-4" role="group" aria-label="模式">
        {([['learn', '認識模式'], ['quiz', '測驗模式'], ['rank', '口訣與排名']] as [Mode, string][]).map(([m, label]) => (
          <button
            key={m}
            type="button"
            className="tl-option !min-h-[40px] !px-4 text-[15px] font-bold justify-center"
            aria-pressed={mode === m}
            onClick={() => { touch(); if (m === 'quiz') startQuiz(); else { setMode(m); } }}
          >
            {label}
          </button>
        ))}
        <button type="button" className="tl-btn tl-btn-secondary !min-h-[40px] !px-4 text-[15px] sm:ml-auto" onClick={printBlank}>
          列印空白地圖
        </button>
      </div>

      <div className="grid gap-5 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        {/* 地圖 */}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-sm tl-muted m-0">
              {mode === 'quiz' ? '直接點地圖作答' : '點地圖上的洲或洋，看它的資料'}
            </p>
            <div className="flex items-center gap-1" role="group" aria-label="地圖縮放">
              <button type="button" className="tl-btn tl-btn-secondary !min-h-[36px] !px-3 !text-sm" onClick={() => setScale((s) => Math.max(1, +(s - 0.5).toFixed(1)))} disabled={scale <= 1} aria-label="縮小地圖">－</button>
              <span className="text-sm tl-muted w-10 text-center" aria-live="polite">{scale}×</span>
              <button type="button" className="tl-btn tl-btn-secondary !min-h-[36px] !px-3 !text-sm" onClick={() => setScale((s) => Math.min(3, +(s + 0.5).toFixed(1)))} disabled={scale >= 3} aria-label="放大地圖">＋</button>
            </div>
          </div>
          <div className="co-map-scroll overflow-auto max-w-full rounded-2xl border border-[#E8DFD5] bg-[#F4F8FA]">
            <svg
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              className="co-map block"
              style={{ width: `${scale * 100}%`, minWidth: 560, height: 'auto', maxWidth: 'none' }}
              role="group"
              aria-label="七大洲五大洋互動地圖，太平洋在中間"
            >
              <defs>
                <clipPath id="co-clip"><path d={MAP_OUTLINE} /></clipPath>
              </defs>
              <path d={MAP_OUTLINE} fill={OCEAN_FILL} stroke="#B7CBD6" strokeWidth={1.5} />
              <g clipPath="url(#co-clip)">
                {Object.entries(OCEAN_HIT_AREAS).map(([area, pts]) => {
                  const id = OCEAN_AREA_TO_ID[area];
                  const h = highlight(id);
                  const r = getRegion(id);
                  return (
                    <polygon
                      key={area}
                      points={pointsAttr(pts)}
                      className="co-region"
                      fill={h === 'none' ? OCEAN_FILL : OCEAN_HI}
                      {...(h === 'none' ? { stroke: 'none' } : { ...strokeFor(h), strokeDasharray: '8 6' })}
                      role="button"
                      tabIndex={0}
                      aria-label={r.name}
                      aria-pressed={mode !== 'quiz' && selected === id}
                      onClick={() => pick(id)}
                      onKeyDown={(e) => onKey(e, id)}
                    >
                      <title>{r.name}</title>
                    </polygon>
                  );
                })}
                {continents.map((c) => {
                  const h = highlight(c.id);
                  return (
                    <path
                      key={c.id}
                      d={CONTINENT_PATHS[c.id]}
                      className="co-region"
                      fill={CONTINENT_FILL[c.id]}
                      strokeLinejoin="round"
                      {...strokeFor(h)}
                      role="button"
                      tabIndex={0}
                      aria-label={c.name}
                      aria-pressed={mode !== 'quiz' && selected === c.id}
                      onClick={() => pick(c.id)}
                      onKeyDown={(e) => onKey(e, c.id)}
                    >
                      <title>{c.name}</title>
                    </path>
                  );
                })}
                {/* 標籤不接收點擊，讓底下的區域收到事件 */}
                <g pointerEvents="none" fontFamily="inherit" fontWeight={700}>
                  {continents.map((c) => (
                    <text key={c.id} x={LABEL_XY[c.id][0]} y={LABEL_XY[c.id][1]} textAnchor="middle" fontSize={c.id === 'europe' || c.id === 'oceania' ? 17 : 20} fill="#3A2E24" stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke">{c.name}</text>
                  ))}
                  {OCEAN_LABEL_KEYS.map((k) => (
                    <text key={k} x={LABEL_XY[k][0]} y={LABEL_XY[k][1] + 6} textAnchor="middle" fontSize={k === 'atlantic-r' ? 15 : 18} fill="#2F5B70" stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke">{getRegion(OCEAN_AREA_TO_ID[k]).name}</text>
                  ))}
                  <circle cx={TAIWAN_XY[0]} cy={TAIWAN_XY[1]} r={4.5} fill="#C0582F" stroke="#FFFFFF" strokeWidth={1.5} />
                  <text x={TAIWAN_XY[0] + 8} y={TAIWAN_XY[1] + 5} fontSize={13} fill="#8F3E1D" stroke="#FFFFFF" strokeWidth={3} paintOrder="stroke">台灣</text>
                </g>
              </g>
            </svg>
          </div>
          <p className="text-xs tl-muted mt-2 mb-0">地圖為簡化輪廓，太平洋置中（和台灣課本一樣），所以大西洋在左右兩邊各露出一半。手機上可以左右滑動或按＋放大。</p>

          {mode !== 'quiz' && (
            <div className="mt-3 flex flex-wrap gap-2" aria-label="用名稱選取">
              {regions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="tl-option !min-h-[36px] !px-3 !rounded-full text-sm"
                  aria-pressed={selected === r.id}
                  onClick={() => { setMode('learn'); pick(r.id); }}
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 右側面板（手機在下方） */}
        <aside className="co-panel rounded-2xl border border-[#E8DFD5] bg-[#FDF9F4] p-4 sm:p-5 min-h-[180px]" aria-live="polite">
          {mode === 'learn' && (regionDetail ? <RegionCard r={regionDetail} /> : (
            <div>
              <p className="font-bold text-warmgray-800 mb-1">認識七大洲五大洋</p>
              <p className="text-[15px] tl-muted m-0">點地圖上任何一個洲或洋，這裡會出現它的中英文名稱、面積、排名和幾個好記的特徵。地球上一共有 7 個洲、5 個洋。</p>
            </div>
          ))}

          {mode === 'quiz' && !quizDone && current && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm tl-muted m-0">第 {quiz.index + 1} / {QUIZ_LENGTH} 題</p>
                <p className="text-sm tl-muted m-0">答對 {score}</p>
              </div>
              <div className="tl-progress mb-3"><span style={{ width: `${(quiz.index / QUIZ_LENGTH) * 100}%` }} /></div>
              <p className="text-lg font-bold text-warmgray-800 mb-3">{current.prompt}</p>
              {!answered && <p className="text-[15px] tl-muted m-0">在地圖上點出你的答案。</p>}
              {answered && (
                <div>
                  {lastAnswer.chosen === lastAnswer.question.answer ? (
                    <Notice>答對了！就是{getRegion(lastAnswer.question.answer).name}。</Notice>
                  ) : (
                    <Notice tone="warn">
                      你點的是{getRegion(lastAnswer.chosen).name}，正確答案是<strong>{getRegion(lastAnswer.question.answer).name}</strong>（地圖上綠色虛線）。
                    </Notice>
                  )}
                  <button type="button" className="tl-btn tl-btn-primary w-full mt-3" onClick={nextQuestion}>
                    {quiz.index + 1 >= QUIZ_LENGTH ? '看結果' : '下一題'}
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'quiz' && quizDone && (
            <div>
              <p className="text-sm tl-muted mb-1">測驗結束</p>
              <p className="text-3xl font-bold text-warmgray-800 mb-1">{score} <span className="text-base font-medium tl-muted">/ {QUIZ_LENGTH} 題</span></p>
              <p className="text-[15px] tl-muted mb-3">
                {score === QUIZ_LENGTH ? '全部答對，七大洲五大洋都認得了！' : score >= 9 ? '很不錯，再把錯的幾題看一次就全會了。' : '再多看幾次地圖，很快就會記起來。'}
              </p>
              {wrong.length > 0 && (
                <div className="mb-3">
                  <p className="font-bold text-warmgray-800 mb-1">錯的題目</p>
                  <ul className="m-0 pl-5 text-[15px] text-warmgray-800 space-y-1">
                    {wrong.map((a, i) => (
                      <li key={i}>{a.question.prompt}<br /><span className="tl-muted">正確答案：{getRegion(a.question.answer).name}，你點了{getRegion(a.chosen).name}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button type="button" className="tl-btn tl-btn-primary" onClick={startQuiz}>再測一次</button>
                <CopyButton text={resultText} label="複製結果" toolId={TOOL_ID} />
              </div>
              <p className="mt-4 pt-3 border-t border-[#E8DFD5] text-[15px] text-warmgray-800 mb-0">
                想再練 10 題選擇題？到親子多元學習平台的
                <a href={LEARN_URL} className="font-bold underline underline-offset-2 text-peach-600">世界地理練習</a>
                做一回，考前驗收最剛好。
              </p>
            </div>
          )}

          {mode === 'rank' && (
            <div>
              <p className="font-bold text-warmgray-800 mb-2">記憶口訣</p>
              <div className="space-y-3">
                {mnemonics.map((m) => (
                  <div key={m.title} className="rounded-xl bg-white border border-[#E8DFD5] p-3">
                    <p className="font-bold text-warmgray-800 text-[15px] mb-1">{m.title}</p>
                    <p className="text-sm tl-muted m-0">{m.detail}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs tl-muted mt-3 mb-0">口訣是我們自己整理的方便記法，不是課本的官方說法。</p>
              <p className="mt-3 text-[15px] text-warmgray-800 mb-0">
                背完口訣，去親子多元學習平台的<a href={LEARN_URL} className="font-bold underline underline-offset-2 text-peach-600">世界地理選擇題</a>驗收一下。
              </p>
            </div>
          )}
        </aside>
      </div>

      {mode === 'rank' && (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <RankTable title="七大洲面積排名" rows={continents} onPick={(id) => { setSelected(id); }} selected={selected} />
          <RankTable title="五大洋面積排名" rows={oceans} onPick={(id) => { setSelected(id); }} selected={selected} />
          <p className="text-xs tl-muted m-0 md:col-span-2">面積來源：英文維基百科 Continent（陸地面積）與 Ocean（五大洋分列）條目的數字，取整到萬平方公里。不同課本的數字略有差異，但排名相同。</p>
        </div>
      )}

      {/* 列印專用：只有輪廓與編號，螢幕上隱藏 */}
      <div className="co-print-sheet" aria-hidden="true">
        <h2>七大洲五大洋　空白地圖</h2>
        <p>班級：＿＿＿＿　姓名：＿＿＿＿＿＿　把號碼對應的洲（1～7）和洋（A～E）名稱寫在下面。</p>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="co-print-map" role="img" aria-label="七大洲五大洋空白地圖">
          <path d={MAP_OUTLINE} fill="#FFFFFF" stroke="#333333" strokeWidth={1.5} />
          {continents.map((c) => <path key={c.id} d={CONTINENT_PATHS[c.id]} fill="#FFFFFF" stroke="#333333" strokeWidth={1.2} strokeLinejoin="round" />)}
          <g fontFamily="inherit" fontWeight={700} fontSize={24} fill="#111111" textAnchor="middle">
            {continents.map((c) => (
              <g key={c.id}>
                <circle cx={LABEL_XY[c.id][0]} cy={LABEL_XY[c.id][1] - 8} r={16} fill="#FFFFFF" stroke="#333333" strokeWidth={1.5} />
                <text x={LABEL_XY[c.id][0]} y={LABEL_XY[c.id][1]}>{PRINT_NUMBERS[c.id]}</text>
              </g>
            ))}
            {OCEAN_LABEL_KEYS.map((k) => (
              <g key={k}>
                <rect x={LABEL_XY[k][0] - 16} y={LABEL_XY[k][1] - 24} width={32} height={32} rx={6} fill="#FFFFFF" stroke="#333333" strokeWidth={1.5} />
                <text x={LABEL_XY[k][0]} y={LABEL_XY[k][1]}>{PRINT_NUMBERS[k]}</text>
              </g>
            ))}
          </g>
        </svg>
        <div className="co-print-blanks">
          <div>
            <h3>七大洲</h3>
            <ol>{PRINT_CONTINENTS.map((id) => <li key={id}>{PRINT_NUMBERS[id]}．＿＿＿＿＿＿</li>)}</ol>
          </div>
          <div>
            <h3>五大洋</h3>
            <ol>{PRINT_OCEANS.map((id) => <li key={id}>{PRINT_NUMBERS[id === 'atlantic' ? 'atlantic-l' : id]}．＿＿＿＿＿＿</li>)}</ol>
          </div>
        </div>
        <p className="co-print-foot">薇佳媽媽 chparenting.com/tools/continents-oceans/　地圖輪廓：Natural Earth（公有領域）</p>
      </div>
    </div>
  );
}

function RegionCard({ r }: { r: Region }) {
  const total = r.kind === 'continent' ? 7 : 5;
  return (
    <div>
      <p className="text-sm tl-muted mb-0">{r.kind === 'continent' ? '七大洲之一' : '五大洋之一'}</p>
      <p className="text-2xl font-bold text-warmgray-800 mb-0">{r.name}</p>
      <p className="text-[15px] tl-muted mb-3">{r.en}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[15px] mb-3">
        <dt className="tl-muted">面積</dt><dd className="m-0 text-warmgray-800">約 {formatArea(r.areaKm2)}</dd>
        <dt className="tl-muted">排名</dt><dd className="m-0 text-warmgray-800">{total} 個{r.kind === 'continent' ? '洲' : '洋'}中第 <strong>{r.rank}</strong> 大{r.rank === 1 ? '（最大）' : r.rank === total ? '（最小）' : ''}</dd>
      </dl>
      <ul className="m-0 pl-5 text-[15px] text-warmgray-800 space-y-1 mb-3">
        {r.highlights.map((h) => <li key={h}>{h}</li>)}
      </ul>
      <p className="rounded-xl bg-white border border-[#E8DFD5] px-3 py-2 text-[15px] font-bold text-warmgray-800 m-0">好記一句話：{r.memo}</p>
    </div>
  );
}

function RankTable({ title, rows, onPick, selected }: { title: string; rows: Region[]; onPick: (id: string) => void; selected: string | null }) {
  return (
    <div className="overflow-x-auto">
      <table className="co-table w-full text-[15px] border-collapse">
        <caption className="text-left font-bold text-warmgray-800 mb-2">{title}</caption>
        <thead>
          <tr className="text-left text-sm tl-muted">
            <th className="py-1.5 pr-2 font-medium">排名</th>
            <th className="py-1.5 pr-2 font-medium">名稱</th>
            <th className="py-1.5 font-medium text-right">面積</th>
          </tr>
        </thead>
        <tbody>
          {[...rows].sort((a, b) => a.rank - b.rank).map((r) => (
            <tr key={r.id} className={selected === r.id ? 'bg-[#F3F7F1]' : ''}>
              <td className="py-1.5 pr-2 border-t border-[#E8DFD5] text-warmgray-800">{r.rank}</td>
              <td className="py-1.5 pr-2 border-t border-[#E8DFD5]">
                <button type="button" className="font-bold text-warmgray-800 underline-offset-2 hover:underline" onClick={() => onPick(r.id)}>{r.name}</button>
                <span className="tl-muted text-sm"> {r.en}</span>
              </td>
              <td className="py-1.5 border-t border-[#E8DFD5] text-right text-warmgray-800 whitespace-nowrap">約 {formatArea(r.areaKm2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
