import { useState, useRef, useEffect } from 'react';
import { CopyButton, Notice, track } from './ui';

// 只在記憶體：沒有 localStorage、沒有伺服器，離頁即消失。
const MAX_NOTE = 2000;

const moodOptions = [
  { key: 'happy', label: '超開心', msg: '太好了！把這份開心好好收藏起來，下次心情低落時翻出來看看。' },
  { key: 'calm', label: '還不錯', msg: '不錯的一天呢！偶爾這樣平靜的好心情，就是最好的禮物。' },
  { key: 'neutral', label: '普普通通', msg: '普通的一天也很好，不是每天都要精彩，平淡也是一種幸福。' },
  { key: 'down', label: '有點低落', msg: '辛苦了，今天的你已經很努力了。允許自己休息一下吧。' },
  { key: 'bad', label: '不太好', msg: '抱抱你。不好的日子會過去的，你比自己想像的更堅強。' },
] as const;
type MoodKey = typeof moodOptions[number]['key'];

const reflections = [
  '今天最感恩的一件事是什麼？',
  '今天有什麼讓你微笑的瞬間？',
  '此刻你最需要什麼？',
  '今天你為自己做了什麼？',
  '如果可以對今天的自己說一句話？',
];

// 以台灣時間為準，避免伺服器／裝置 UTC 跨日
const todayLabel = () =>
  new Date().toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

export default function MoodDiary() {
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [note, setNote] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [today, setToday] = useState('');
  const [reflection, setReflection] = useState(reflections[0]);
  const resultRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setToday(todayLabel());
    setReflection(reflections[Math.floor(Math.random() * reflections.length)]);
  }, []);
  useEffect(() => { if (showResult) resultRef.current?.focus(); }, [showResult]);

  const moodInfo = mood ? moodOptions.find((m) => m.key === mood)! : null;

  const generate = () => {
    if (!mood) return;
    track('tool_complete', { tool_id: 'mood-diary' });
    setShowResult(true);
  };

  const restart = () => {
    if ((mood || note.trim()) && !window.confirm('重新記錄會清空這次的心情與小記，確定嗎？')) return;
    setMood(null);
    setNote('');
    setShowResult(false);
  };

  const resultText = () => {
    if (!moodInfo) return '';
    let text = `媽媽心情日記\n${today}\n\n心情：${moodInfo.label}\n`;
    if (note.trim()) text += `\n今日小記：\n${note.trim()}\n`;
    text += `\n${moodInfo.msg}\n`;
    return text;
  };

  if (showResult && moodInfo) {
    return (
      <div className="max-w-md mx-auto">
        <h2 ref={resultRef} tabIndex={-1} className="sr-only">心情卡</h2>
        <div className="rounded-2xl p-6 text-center" style={{ background: '#FAF6F1', border: '1px solid #E8DFD5' }}>
          <p className="text-sm tl-muted">{today}</p>
          <img src={`/images/ui/moods/${moodInfo.key}.png`} alt="" width="72" height="72" className="w-[72px] h-[72px] mx-auto my-3 object-contain" />
          <p className="text-2xl font-bold text-warmgray-800">{moodInfo.label}</p>

          {note.trim() && (
            <div className="mt-5 text-left rounded-2xl bg-white p-4" style={{ border: '1px solid #E8DFD5' }}>
              <p className="text-sm font-bold text-warmgray-800 mb-1">今日小記</p>
              <p className="text-[15px] text-warmgray-800 leading-relaxed whitespace-pre-wrap break-words">{note.trim()}</p>
            </div>
          )}

          <div className="mt-4 rounded-2xl px-4 py-3 text-[15px] text-warmgray-800 leading-relaxed" style={{ background: '#F3F7F1' }}>
            {moodInfo.msg}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 mt-5">
          <CopyButton text={resultText()} label="複製紀錄" className="tl-btn tl-btn-primary w-full" toolId="mood-diary" />
          <button type="button" className="tl-btn tl-btn-secondary w-full" onClick={() => setShowResult(false)}>返回修改</button>
          <button type="button" className="tl-btn tl-btn-ghost w-full" onClick={restart}>重新記錄</button>
        </div>

        <div className="mt-4">
          <Notice tone="warn">尚未另行保存，請先複製到備忘錄。</Notice>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <p className="text-sm tl-muted text-center">{today}</p>
      <fieldset className="mt-4">
        <legend className="font-bold text-warmgray-800 mb-3">今天的心情是？</legend>
        <div className="grid grid-cols-5 gap-2">
          {moodOptions.map((m) => (
            <button
              key={m.key}
              type="button"
              className="tl-option tl-motion flex-col justify-center gap-1 !px-1 py-2 text-center"
              aria-pressed={mood === m.key}
              onClick={() => setMood(m.key)}
            >
              <img src={`/images/ui/moods/${m.key}.png`} alt="" width="40" height="40" className="w-10 h-10 object-contain" />
              <span className="text-xs leading-tight font-medium">{m.label}</span>
              {mood === m.key && <span className="sr-only">已選取</span>}
            </button>
          ))}
        </div>
      </fieldset>

      {mood && (
        <p className="mt-4 text-sm rounded-2xl px-4 py-3" style={{ background: '#FAF6F1', color: '#4A3E34' }}>
          今日小提問：{reflection}
        </p>
      )}

      <label htmlFor="mood-note" className="block font-bold text-warmgray-800 mt-5 mb-2">寫下今天的小記錄（選填）</label>
      <textarea
        id="mood-note"
        value={note}
        maxLength={MAX_NOTE}
        onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE))}
        placeholder="想寫點什麼嗎？也可以不寫。"
        rows={4}
        className="w-full rounded-2xl bg-white p-4 text-[15px] text-warmgray-800 leading-relaxed outline-none tl-focus"
        style={{ border: '1.5px solid #E8DFD5' }}
      />
      <p className="text-sm tl-muted text-right mt-1" aria-live="polite">
        {note.length}/{MAX_NOTE}{note.length >= MAX_NOTE && '，已達字數上限'}
      </p>

      <div className="mt-3">
        <Notice>此頁不提供歷史日記，離開可能失去本次內容；完成後請複製保存。</Notice>
      </div>

      <button
        type="button"
        className="tl-btn tl-btn-primary w-full mt-4"
        onClick={generate}
        disabled={!mood}
        aria-disabled={!mood}
      >
        產生心情卡
      </button>
      {!mood && <p className="text-sm tl-muted text-center mt-2">請先選一個心情</p>}
    </div>
  );
}
