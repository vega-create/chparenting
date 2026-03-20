import { useState, useEffect } from 'react';

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

const bgColors = ['#E8A87C', '#D4B896', '#B8C4A0', '#C4A0A0', '#8BA888', '#D4956A', '#A0B8C4'];

const moods = [
  { id: 'tired',   label: '😩 好累', color: '#B8C4D0' },
  { id: 'anxious', label: '😰 焦慮', color: '#C4B8D0' },
  { id: 'happy',   label: '😊 開心', color: '#C4D0A0' },
  { id: 'angry',   label: '😤 生氣', color: '#D0B8A0' },
];

export default function AffirmationCard() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [bgColor, setBgColor] = useState(bgColors[0]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [dailyMessage, setDailyMessage] = useState('');
  const [specialCard, setSpecialCard] = useState<{ text: string; emoji: string } | null>(null);

  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    setDailyMessage(weekdayThemes[day]);

    // Check special day
    const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const specials = specialDayQuotes[mmdd];
    if (specials) {
      setSpecialCard(specials[Math.floor(Math.random() * specials.length)]);
    }

    // Auto-select mood from URL param (from homepage MoodCheck)
    const params = new URLSearchParams(window.location.search);
    const moodParam = params.get('mood');
    if (moodParam && moodQuotes[moodParam]) {
      selectMood(moodParam);
    }
  }, []);

  const getQuotes = () => {
    if (!selectedMood) return [];
    return moodQuotes[selectedMood] || [];
  };

  const nextCard = () => {
    const quotes = getQuotes();
    if (quotes.length === 0) return;
    setIsFlipping(true);
    setTimeout(() => {
      const next = (current + 1) % quotes.length;
      setCurrent(next);
      setBgColor(bgColors[next % bgColors.length]);
      setIsFlipping(false);
    }, 200);
  };

  const selectMood = (moodId: string) => {
    setSelectedMood(moodId);
    // Use date + mood as seed for today's card
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const quotes = moodQuotes[moodId] || [];
    const idx = seed % quotes.length;
    setCurrent(idx);
    setBgColor(bgColors[idx % bgColors.length]);
  };

  const quotes = getQuotes();
  const card = quotes[current];

  return (
    <div style={{ textAlign: 'center', padding: '1.5rem', fontFamily: 'Noto Sans TC, sans-serif' }}>

      {/* Daily greeting */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF8F0, #FFF3E6)',
        borderRadius: 16,
        padding: '16px 20px',
        marginBottom: 24,
        border: '1px solid #F0E0D0',
      }}>
        <p style={{ margin: 0, fontSize: 14, color: '#8A7A6A' }}>
          📅 {dailyMessage}
        </p>
      </div>

      {/* Special day banner */}
      {specialCard && (
        <div style={{
          background: 'linear-gradient(135deg, #FFE8E8, #FFF0E0)',
          borderRadius: 16,
          padding: '20px',
          marginBottom: 24,
          border: '2px solid #FFD0C0',
        }}>
          <span style={{ fontSize: 36 }}>{specialCard.emoji}</span>
          <p style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 600, color: '#6B4A3A' }}>
            {specialCard.text}
          </p>
        </div>
      )}

      {/* Mood selector */}
      {!selectedMood ? (
        <div>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#5A4E42', marginBottom: 20 }}>
            媽媽，你今天心情如何？
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            maxWidth: 320,
            margin: '0 auto',
          }}>
            {moods.map(m => (
              <button
                key={m.id}
                onClick={() => selectMood(m.id)}
                style={{
                  background: `linear-gradient(135deg, ${m.color}30, ${m.color}15)`,
                  border: `2px solid ${m.color}50`,
                  borderRadius: 16,
                  padding: '18px 12px',
                  fontSize: 18,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
                  color: '#4A3E34',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p style={{ marginTop: 16, fontSize: 13, color: '#9A8A7A' }}>
            選擇心情，為你抽一張專屬卡片 ♡
          </p>
        </div>
      ) : (
        <div>
          {/* Mood tag + change button */}
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{
              background: moods.find(m => m.id === selectedMood)?.color + '30',
              padding: '6px 16px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              color: '#5A4E42',
            }}>
              {moods.find(m => m.id === selectedMood)?.label}
            </span>
            <button
              onClick={() => setSelectedMood(null)}
              style={{
                background: 'none',
                border: '1px solid #DDD',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 12,
                color: '#9A8A7A',
                cursor: 'pointer',
              }}
            >
              換心情
            </button>
          </div>

          {/* Card */}
          {card && (
            <div
              onClick={nextCard}
              style={{
                width: '100%',
                maxWidth: 360,
                margin: '0 auto 2rem',
                padding: '3rem 2rem',
                borderRadius: 24,
                background: `linear-gradient(135deg, ${bgColor}20, ${bgColor}08)`,
                border: `2px solid ${bgColor}30`,
                cursor: 'pointer',
                transition: 'all 0.3s',
                transform: isFlipping ? 'scale(0.95) rotateY(10deg)' : 'scale(1)',
                opacity: isFlipping ? 0.5 : 1,
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>{card.emoji}</span>
              <p style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#4A3E34',
                lineHeight: 1.6,
                fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
              }}>
                {card.text}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <button
              onClick={nextCard}
              style={{
                background: bgColor,
                color: 'white',
                border: 'none',
                padding: '12px 28px',
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
                boxShadow: `0 4px 20px ${bgColor}30`,
              }}
            >
              🔄 換一張
            </button>
            <button
              onClick={() => {
                if (!card) return;
                if (navigator.share) {
                  navigator.share({
                    title: '今日正能量',
                    text: `${card.emoji} ${card.text}\n\n— 媽媽生活復原力Lab`,
                  });
                } else {
                  navigator.clipboard.writeText(`${card.emoji} ${card.text}\n\n— 媽媽生活復原力Lab`);
                  alert('已複製到剪貼簿！');
                }
              }}
              style={{
                background: 'white',
                color: '#5A4E42',
                border: '2px solid #EDE5DB',
                padding: '12px 28px',
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
              }}
            >
              📤 分享
            </button>
          </div>

          <p style={{ marginTop: 24, fontSize: 13, color: '#9A8A7A' }}>
            點擊卡片或按「換一張」看下一句 ♡
          </p>
        </div>
      )}
    </div>
  );
}
