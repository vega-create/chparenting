import { useState } from 'react';
import { CopyButton, Notice, track } from './ui';

// 依選擇的心情，從既有語句中取一句鼓勵語；選填小記只作心情小記，不參與產生。
const cheerMessages: Record<string, string[]> = {
  tired: [
    '你今天真的辛苦了。能撐到現在的你，已經超級厲害了。',
    '累了就停下來吧，世界不會因為你休息就崩塌。但你會因為休息而更有力量。',
    '有一種堅強，叫做承認自己累了。你很勇敢。',
    '孩子不會記得家裡有多乾淨，但會記得媽媽的笑容。今天，允許自己偷懶一下。',
  ],
  frustrated: [
    '被氣到想尖叫？你沒有不好，你只是太認真了。',
    '深呼吸。這一刻會過去的，而你會更強大。',
    '生氣不代表你是壞媽媽，代表你是有血有肉、真實的人。',
    '有時候最好的育兒策略，就是先去廁所躲五分鐘。真的。',
  ],
  lonely: [
    '當媽媽有時候很孤獨，但請記得，有好多媽媽跟你一樣。你不是一個人。',
    '你的付出或許沒人說謝謝，但每一份愛都在孩子心裡生根發芽。',
    '今天就算只是活著，也已經足夠了。你正在做一件很偉大的事。',
    '如果今天沒有人跟你說，那讓我來：你做得很好，真的。',
  ],
  happy: [
    '太好了！把這份快樂好好記住，它會是低潮時最好的能量！',
    '開心的你，就是孩子最好的禮物。繼續閃閃發光吧！',
    '你值得每一個快樂的瞬間。好好享受今天！',
    '看到你開心，全世界都亮了。繼續做讓你快樂的事！',
  ],
  anxious: [
    '焦慮只是你太在乎的證明。但親愛的，你已經做得夠好了。',
    '不需要什麼都想好、什麼都準備好。走一步算一步，也是一種智慧。',
    '那些讓你焦慮的事，十年後回頭看，大多數都不重要。深呼吸。',
    '完美媽媽不存在，但「夠好的媽媽」就在這裡——就是你。',
  ],
  guilty: [
    '有罪惡感的媽媽，通常都是最用心的媽媽。因為不在乎的人不會愧疚。',
    '你對孩子發了脾氣？沒關係，修復比完美更重要。抱抱他，也抱抱自己。',
    '媽媽也是人，也會犯錯。但你的愛從來沒有少過，孩子知道的。',
    '放下那個「應該」。你不需要應該怎樣，你只需要做你自己。',
  ],
};

const feelings = [
  { key: 'tired', label: '好累', icon: 'tired' },
  { key: 'frustrated', label: '好氣', icon: 'frustrated' },
  { key: 'lonely', label: '孤單', icon: 'down' },
  { key: 'anxious', label: '焦慮', icon: 'scared' },
  { key: 'guilty', label: '愧疚', icon: 'shy' },
  { key: 'happy', label: '開心', icon: 'happy' },
];

const MAX_LEN = 500;

const pickNext = (len: number, current: number) => {
  if (len <= 1) return 0;
  let n = Math.floor(Math.random() * len);
  if (n === current) n = (n + 1) % len;
  return n;
};

export default function CheerCard() {
  const [feeling, setFeeling] = useState<string | null>(null);
  const [story, setStory] = useState('');
  const [cheerIdx, setCheerIdx] = useState(-1);
  const [submitted, setSubmitted] = useState(false);
  const [includeStory, setIncludeStory] = useState(false);

  const feelingInfo = feelings.find((f) => f.key === feeling);
  const pool = feeling ? cheerMessages[feeling] : [];
  const cheer = cheerIdx >= 0 ? pool[cheerIdx] : null;

  const submit = () => {
    if (!feeling) return;
    setCheerIdx(pickNext(pool.length, -1));
    setSubmitted(true);
    track('tool_complete', { tool_id: 'cheer' });
  };

  // 返回修改：保留心情與輸入
  const backToEdit = () => setSubmitted(false);

  // 重新填寫：才清空
  const resetAll = () => {
    setFeeling(null);
    setStory('');
    setCheerIdx(-1);
    setSubmitted(false);
    setIncludeStory(false);
  };

  const today = new Date().toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: 'long', day: 'numeric' });
  const copyText = cheer
    ? `媽媽加油卡｜${today}\n心情：${feelingInfo?.label}\n` +
      (includeStory && story.trim() ? `\n我的小記：\n${story.trim()}\n` : '') +
      `\n給你的話：\n${cheer}\n\n— 媽媽生活復原力Lab\nhttps://chparenting.com/tools/cheer/`
    : '';

  if (submitted && cheer) {
    return (
      <div className="max-w-md mx-auto">
        <article className="rounded-[20px] p-5 sm:p-7 text-center" style={{ background: '#FAF6F1', border: '1px solid #E8DFD5' }} aria-live="polite">
          <p className="text-sm tl-muted">{today}</p>
          <p className="inline-flex items-center justify-center gap-2 mt-1 mb-4 font-bold text-warmgray-800">
            <img src={`/images/ui/moods/${feelingInfo?.icon}.png`} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
            心情：{feelingInfo?.label}
          </p>
          {story.trim() && (
            <div className="rounded-2xl bg-white px-4 py-3 mb-4 text-left" style={{ border: '1px solid #E8DFD5' }}>
              <p className="text-sm tl-muted mb-1">我的小記</p>
              <p className="text-[15px] leading-relaxed text-warmgray-800 whitespace-pre-wrap">{story.trim()}</p>
            </div>
          )}
          <div className="rounded-2xl px-4 py-5" style={{ background: '#F3F7F1' }}>
            <p className="text-sm font-bold mb-1" style={{ color: '#6E8E6A' }}>給你的話</p>
            <p className="text-lg font-bold leading-relaxed text-warmgray-800 select-text">{cheer}</p>
          </div>
        </article>

        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm text-warmgray-800 min-h-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={includeStory}
              onChange={(e) => setIncludeStory(e.target.checked)}
              disabled={!story.trim()}
              className="w-5 h-5 accent-[#8BA888]"
            />
            複製時一併加入我的小記{!story.trim() && '（沒有填寫小記）'}
          </label>
          <details className="tl-guide rounded-2xl px-4" style={{ background: '#FAF6F1' }}>
            <summary className="text-sm">預覽將複製的完整文字</summary>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-warmgray-800 pb-3 font-sans">{copyText}</pre>
          </details>
        </div>

        <div className="flex flex-col gap-2.5 mt-4">
          <CopyButton text={copyText} label="複製加油卡" className="tl-btn tl-btn-primary w-full" toolId="cheer" />
          <button type="button" className="tl-btn tl-btn-secondary w-full" onClick={() => setCheerIdx((i) => pickNext(pool.length, i))}>
            換一句
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" className="tl-btn tl-btn-secondary" onClick={backToEdit}>返回修改</button>
            <button type="button" className="tl-btn tl-btn-ghost" onClick={resetAll}>重新填寫</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <fieldset className="border-0 p-0 m-0 mb-5">
        <legend className="font-bold text-warmgray-800 mb-3">現在的心情是？</legend>
        <div className="grid grid-cols-3 gap-2.5">
          {feelings.map((f) => (
            <button
              key={f.key}
              type="button"
              className="tl-option flex-col justify-center gap-1 !px-2 py-3"
              aria-pressed={feeling === f.key}
              onClick={() => setFeeling(f.key)}
            >
              <img src={`/images/ui/moods/${f.icon}.png`} alt="" width={40} height={40} className="w-10 h-10 object-contain" />
              <span className="text-sm font-bold">{f.label}{feeling === f.key && <span className="sr-only">（已選）</span>}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label htmlFor="cheer-story" className="block font-bold text-warmgray-800 mb-2">
        想說些什麼嗎？<span className="font-normal tl-muted">（選填）</span>
      </label>
      <textarea
        id="cheer-story"
        value={story}
        maxLength={MAX_LEN}
        onChange={(e) => setStory(e.target.value.slice(0, MAX_LEN))}
        placeholder="今天發生了什麼事？寫下來當作心情小記。"
        rows={4}
        className="w-full rounded-2xl bg-white px-4 py-3 text-[15px] leading-relaxed text-warmgray-800 focus:outline-none focus:border-[#8BA888]"
        style={{ border: '1.5px solid #E8DFD5' }}
      />
      <p className="text-right text-sm tl-muted mt-1" aria-live="polite">{story.length} / {MAX_LEN}</p>

      <div className="my-4">
        <Notice>依你選擇的心情提供鼓勵語；小記只會留在這個頁面，不會上傳，也不會用來分析內容。</Notice>
      </div>

      <button type="button" className="tl-btn tl-btn-primary w-full" onClick={submit} disabled={!feeling}>
        給我一句加油的話
      </button>
      {!feeling && <p className="text-sm tl-muted text-center mt-2">請先選一個心情</p>}
    </div>
  );
}
