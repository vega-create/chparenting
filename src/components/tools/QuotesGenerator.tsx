import { useState } from 'react';

const quotes = [
  { text: '我只是想上個廁所，為什麼這也要開會？', category: '日常崩潰' },
  { text: '「安靜」兩個字是我離婚前最浪漫的情話', category: '安靜渴望' },
  { text: '我的人生目標：今天不要吼小孩。結果：9:03 失敗。', category: '日常崩潰' },
  { text: '「媽媽我想要⋯」 不，你不想。', category: '購物篇' },
  { text: '生小孩之前我以為「累」是加班到12點。太天真了。', category: '疲勞篇' },
  { text: '我不是在收玩具，我是在做一場永無止境的尋寶遊戲', category: '家務篇' },
  { text: '煮了兩小時的飯，小孩吃了兩口說「不好吃」。微笑。', category: '廚房篇' },
  { text: '我的衣服上有不明液體，但我已經不在乎了', category: '日常崩潰' },
  { text: '「等一下」是我說最多的三個字', category: '日常崩潰' },
  { text: '睡前故事講到第三遍，睡著的是我', category: '睡眠篇' },
  { text: '我以為我很有耐心，直到我有了小孩', category: '自我認知' },
  { text: '出門前花30分鐘找鞋子，最後發現在冰箱裡', category: '日常崩潰' },
  { text: '「你好棒！」我對自己今天沒崩潰說的', category: '自我鼓勵' },
  { text: '我的休假 = 帶小孩去不同的地方崩潰', category: '假期篇' },
  { text: '以前追星，現在追著小孩跑', category: '人生感悟' },
  { text: '問我幾點？我只知道「小孩睡前」和「小孩睡後」', category: '時間篇' },
  { text: '生完小孩最大的改變：我現在可以站著睡覺', category: '疲勞篇' },
  { text: '「媽媽陪我玩」翻譯：媽媽坐在旁邊看我玩', category: '親子篇' },
  { text: '家裡最乾淨的時候：小孩不在家的時候', category: '家務篇' },
  { text: '我不是超人媽媽，我只是還沒倒下', category: '自我認知' },
];

export default function QuotesGenerator() {
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * quotes.length));
  const [isAnimating, setIsAnimating] = useState(false);

  const next = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent((c) => (c + 1) % quotes.length);
      setIsAnimating(false);
    }, 150);
  };

  const quote = quotes[current];

  return (
    <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
      <div
        style={{
          maxWidth: 400,
          margin: '0 auto 24px',
          padding: '2.5rem 2rem',
          borderRadius: 24,
          background: 'linear-gradient(135deg, #D4956A15, #E8A87C08)',
          border: '2px solid #D4956A20',
          minHeight: 180,
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          transform: isAnimating ? 'scale(0.97)' : 'scale(1)',
          opacity: isAnimating ? 0.5 : 1,
        }}
      >
        <span style={{ fontSize: 12, color: '#D4956A', fontWeight: 600, letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' as const }}>
          — {quote.category} —
        </span>
        <p style={{ fontSize: 20, fontWeight: 600, color: '#4A3E34', lineHeight: 1.8, fontFamily: 'Quicksand, Noto Sans TC, sans-serif' }}>
          「{quote.text}」
        </p>
        <p style={{ fontSize: 13, color: '#9A8A7A', marginTop: 16 }}>— 某位匿名媽媽</p>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const }}>
        <button onClick={next} style={{
          background: '#D4956A', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 999,
          fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
          boxShadow: '0 4px 20px #D4956A30',
        }}>
          🎲 下一句
        </button>
        <button onClick={() => {
          const text = `「${quote.text}」\n— 某位匿名媽媽\n\n#媽媽生活復原力Lab`;
          if (navigator.share) { navigator.share({ text }); }
          else { navigator.clipboard.writeText(text); alert('已複製！'); }
        }} style={{
          background: 'white', color: '#5A4E42', border: '2px solid #EDE5DB', padding: '12px 28px', borderRadius: 999,
          fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
        }}>
          📤 分享
        </button>
      </div>
    </div>
  );
}
