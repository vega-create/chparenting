import { useState, useEffect } from 'react';
import { CopyButton, track } from './ui';

/* ── 心情分類語錄庫 ── */
const moodQuotes: Record<string, { text: string; emoji: string }[]> = {
  tired: [
    { text: '你今天也辛苦了，媽媽 ♡', emoji: '💛' },
    { text: '休息不是偷懶，是給自己充電', emoji: '🔋' },
    { text: '允許自己有累的時候', emoji: '☁️' },
    { text: '今天只需要做到「夠好」就好', emoji: '✨' },
    { text: '累了就停下來，世界不會因此崩塌', emoji: '🌙' },
    { text: '你不需要撐到極限才有資格休息', emoji: '🛋️' },
    { text: '深呼吸，今天的你已經很棒了', emoji: '🌿' },
    { text: '躺平一下也沒關係，明天再繼續', emoji: '😴' },
    { text: '疲憊不代表你不夠好，只是你付出太多了', emoji: '🫶' },
    { text: '給自己倒一杯茶，你值得這五分鐘', emoji: '🍵' },
    { text: '今天的任務：活著就好', emoji: '🌱' },
    { text: '你的身體在說話，請溫柔地聽', emoji: '💆' },
    { text: '做不完的事明天還在，但你的健康不能等', emoji: '❤️‍🩹' },
    { text: '「我好累」不是抱怨，是事實', emoji: '🫂' },
    { text: '孩子需要的是快樂的媽媽，不是完美的媽媽', emoji: '😊' },
  ],
  anxious: [
    { text: '深呼吸，你可以的', emoji: '🌿' },
    { text: '焦慮只是情緒，不是事實', emoji: '🧠' },
    { text: '你不需要一次解決所有問題', emoji: '🧩' },
    { text: '不確定的未來，也可能有驚喜', emoji: '🎁' },
    { text: '一步一步來，每一步都算數', emoji: '👣' },
    { text: '你擔心，是因為你在乎', emoji: '💕' },
    { text: '把注意力放在此刻，這一秒你是安全的', emoji: '🕊️' },
    { text: '焦慮的反面不是平靜，而是信任自己', emoji: '🪷' },
    { text: '你不需要看到整條路，只要邁出下一步', emoji: '🌉' },
    { text: '吸氣四秒、吐氣六秒，你正在照顧自己', emoji: '🫁' },
    { text: '完美媽媽不存在，但用心的媽媽就在這裡', emoji: '💗' },
    { text: '擔心是愛的一種形式，但別讓它淹沒你', emoji: '🌊' },
    { text: '你已經做了最好的決定，相信自己', emoji: '🌟' },
    { text: '控制不了的事就放手，能做的事就去做', emoji: '🎈' },
    { text: '你不孤單，很多媽媽跟你有一樣的感受', emoji: '🤝' },
  ],
  happy: [
    { text: '今天的快樂值得被記住！', emoji: '🌈' },
    { text: '開心的你，是全家最棒的風景', emoji: '☀️' },
    { text: '你的笑容是孩子最好的禮物', emoji: '😄' },
    { text: '享受這一刻，你值得所有美好', emoji: '🥰' },
    { text: '快樂的媽媽，快樂的家', emoji: '🏡' },
    { text: '今天的好心情，請打包帶走', emoji: '🎒' },
    { text: '你正在創造孩子最美的童年回憶', emoji: '📸' },
    { text: '開心是一種超能力，而你擁有它', emoji: '⚡' },
    { text: '把這份好心情傳染給身邊的人吧', emoji: '🎉' },
    { text: '你看，熬過低潮後的陽光特別溫暖', emoji: '🌤️' },
    { text: '記住今天的感覺，低潮時翻出來看', emoji: '📝' },
    { text: '快樂不需要理由，你開心就是最好的理由', emoji: '🎶' },
    { text: '今天的你在發光，繼續保持！', emoji: '✨' },
    { text: '幸福不在遠方，就在你每天的日常裡', emoji: '🌻' },
    { text: '謝謝你讓自己開心，這也是一種愛', emoji: '💖' },
  ],
  angry: [
    { text: '生氣是正常的，你不是壞媽媽', emoji: '🔥' },
    { text: '情緒來了就讓它流過，不需要壓抑', emoji: '🌊' },
    { text: '你可以生氣，但記得你比情緒更強大', emoji: '💪' },
    { text: '對不完美的世界生氣，代表你有標準', emoji: '⚡' },
    { text: '先照顧好自己的心，再處理問題', emoji: '🫀' },
    { text: '怒氣是訊號，告訴你某個需求沒被滿足', emoji: '🔔' },
    { text: '離開現場五分鐘，給自己一個暫停鍵', emoji: '⏸️' },
    { text: '你不是在崩潰，你是在承受太多了', emoji: '🏋️' },
    { text: '吼完孩子覺得愧疚？那代表你是好媽媽', emoji: '🤗' },
    { text: '生氣後道歉，也是教孩子勇敢的一課', emoji: '🌱' },
    { text: '把怒氣寫下來，寫完可能就沒那麼氣了', emoji: '📝' },
    { text: '你需要的不是更多耐心，而是更多支援', emoji: '🆘' },
    { text: '發完脾氣不代表失敗，代表你是真實的人', emoji: '💯' },
    { text: '氣完了嗎？喝口水，你還是那個很棒的媽媽', emoji: '💧' },
    { text: '有情緒的媽媽，比壓抑的媽媽更健康', emoji: '🌸' },
  ],
};

/* ── 節日/特殊日語錄 ── */
const specialDayQuotes: Record<string, { text: string; emoji: string }[]> = {
  // 母親節 (5/第二個週日，但這裡用固定日期近似)
  '05-11': [{ text: '母親節快樂！今天你是最閃亮的主角', emoji: '👑' }],
  '05-12': [{ text: '母親節快樂！謝謝你成為媽媽', emoji: '💐' }],
  '05-13': [{ text: '母親節快樂！你是世界上最棒的媽媽', emoji: '🏆' }],
  // 兒童節
  '04-04': [{ text: '兒童節快樂！看見孩子的笑容就是最好的禮物', emoji: '🎠' }],
  // 農曆新年（大約）
  '01-29': [{ text: '新年快樂！新的一年，對自己更溫柔一點', emoji: '🧧' }],
  '01-30': [{ text: '新年快樂！今年的願望：全家健康平安', emoji: '🎊' }],
  '01-31': [{ text: '新年快樂！媽媽辛苦了，紅包給自己', emoji: '🧧' }],
  // 情人節
  '02-14': [{ text: '情人節快樂！別忘了，你也值得被愛', emoji: '💝' }],
  // 聖誕節
  '12-25': [{ text: '聖誕快樂！今年最好的禮物，就是你的陪伴', emoji: '🎄' }],
  // 中秋節（大約）
  '09-17': [{ text: '中秋快樂！和家人一起的時光最珍貴', emoji: '🥮' }],
};

/* ── 星期主題 ── */
const weekdayThemes: Record<number, string> = {
  0: '週日是屬於你的日子，好好放鬆',  // 日
  1: '新的一週開始了，你一定可以的',    // 一
  2: '週二了，你已經撐過最難的週一',    // 二
  3: '週三，一週已經過一半了！',        // 三
  4: '快到週末了，再堅持一下',          // 四
  5: '週五了！今晚犒賞自己一下吧',     // 五
  6: '週末快樂，今天放過自己吧',        // 六
};

const moods = [
  { id: 'tired',   label: '好累', icon: 'tired' },
  { id: 'anxious', label: '焦慮', icon: 'scared' },
  { id: 'happy',   label: '開心', icon: 'happy' },
  { id: 'angry',   label: '生氣', icon: 'angry' },
];

// 資料池多於一筆時避免緊接著重複
const pickNext = (len: number, current: number) => {
  if (len <= 1) return 0;
  let n = Math.floor(Math.random() * len);
  if (n === current) n = (n + 1) % len;
  return n;
};

export default function AffirmationCard() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [dailyMessage, setDailyMessage] = useState('');
  const [specialCard, setSpecialCard] = useState<{ text: string; emoji: string } | null>(null);

  useEffect(() => {
    const today = new Date();
    setDailyMessage(weekdayThemes[today.getDay()]);

    const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const specials = specialDayQuotes[mmdd];
    if (specials) setSpecialCard(specials[Math.floor(Math.random() * specials.length)]);

    // 首頁心情卡帶來的 ?mood= 參數
    const moodParam = new URLSearchParams(window.location.search).get('mood');
    if (moodParam && moodQuotes[moodParam]) selectMood(moodParam);
  }, []);

  const selectMood = (moodId: string) => {
    setSelectedMood(moodId);
    const quotes = moodQuotes[moodId] || [];
    setCurrent(Math.floor(Math.random() * quotes.length));
    track('tool_start', { tool_id: 'affirmation' });
  };

  const quotes = selectedMood ? moodQuotes[selectedMood] || [] : [];
  const card = quotes[current];
  const moodInfo = moods.find((m) => m.id === selectedMood);
  const copyText = card ? `${card.text}\n\n— 媽媽生活復原力Lab` : '';

  return (
    <div className="text-center">
      <p className="text-sm tl-muted mb-4">{dailyMessage}</p>

      {specialCard && (
        <div className="tl-notice justify-center mb-5">
          <span aria-hidden="true">{specialCard.emoji}</span>
          <span className="font-bold">{specialCard.text}</span>
        </div>
      )}

      {!selectedMood ? (
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-lg font-bold text-warmgray-800 mb-1 w-full">現在的你，心情如何？</legend>
          <p className="text-sm tl-muted mb-4">選一個最接近的心情，為現在的你抽一句暖心話</p>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {moods.map((m) => (
              <button
                key={m.id}
                type="button"
                className="tl-option justify-center"
                aria-pressed={false}
                onClick={() => selectMood(m.id)}
              >
                <img src={`/images/ui/moods/${m.icon}.png`} alt="" width={40} height={40} className="w-10 h-10 object-contain" />
                <span className="font-bold">{m.label}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-warmgray-800">
              <img src={`/images/ui/moods/${moodInfo?.icon}.png`} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
              心情：{moodInfo?.label}
            </span>
            <button type="button" className="tl-btn tl-btn-ghost !min-h-[40px] !px-3 text-sm" onClick={() => setSelectedMood(null)}>
              換心情
            </button>
          </div>

          {card && (
            <div className="rounded-[20px] px-6 py-10 mb-5" style={{ background: '#FAF6F1', border: '1px solid #E8DFD5' }} aria-live="polite">
              <p className="text-[22px] sm:text-2xl font-bold leading-relaxed text-warmgray-800 select-text">{card.text}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2.5">
            <button type="button" className="tl-btn tl-btn-primary" onClick={() => setCurrent((c) => pickNext(quotes.length, c))}>
              換一張
            </button>
            <CopyButton text={copyText} label="複製這句話" toolId="affirmation" />
          </div>
        </div>
      )}
    </div>
  );
}
