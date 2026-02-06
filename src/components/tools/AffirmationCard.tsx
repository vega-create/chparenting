import { useState, useEffect } from 'react';

const affirmations = [
  { text: '你今天也辛苦了，媽媽 ♡', emoji: '💛' },
  { text: '不完美也沒關係，你已經夠好了', emoji: '🌸' },
  { text: '你的存在，就是孩子最大的禮物', emoji: '🎁' },
  { text: '休息不是偷懶，是給自己充電', emoji: '🔋' },
  { text: '深呼吸，你可以的', emoji: '🌿' },
  { text: '今天只需要做到「夠好」就好', emoji: '✨' },
  { text: '你值得被溫柔以待', emoji: '🌷' },
  { text: '允許自己有累的時候', emoji: '☁️' },
  { text: '你不是一個人，我們都在', emoji: '🤝' },
  { text: '慢慢來，比較快', emoji: '🐢' },
  { text: '今天的你，比昨天更勇敢了', emoji: '💪' },
  { text: '不需要跟別人比較，你就是你', emoji: '🦋' },
  { text: '哭完之後，繼續前進也是一種勇敢', emoji: '🌈' },
  { text: '你的努力，孩子都看在眼裡', emoji: '👀' },
  { text: '給自己一個擁抱吧', emoji: '🤗' },
  { text: '每一天都是新的開始', emoji: '🌅' },
  { text: '你比你想像的還要堅強', emoji: '💎' },
  { text: '今天也要記得愛自己', emoji: '❤️‍🩹' },
  { text: '放下完美主義，擁抱真實的自己', emoji: '🪞' },
  { text: '你的笑容是家裡最溫暖的陽光', emoji: '☀️' },
];

const bgColors = ['#E8A87C', '#D4B896', '#B8C4A0', '#C4A0A0', '#8BA888', '#D4956A', '#A0B8C4'];

export default function AffirmationCard() {
  const [current, setCurrent] = useState(0);
  const [bgColor, setBgColor] = useState(bgColors[0]);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    // Use today's date as seed for daily card
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    setCurrent(seed % affirmations.length);
    setBgColor(bgColors[seed % bgColors.length]);
  }, []);

  const nextCard = () => {
    setIsFlipping(true);
    setTimeout(() => {
      const next = (current + 1) % affirmations.length;
      setCurrent(next);
      setBgColor(bgColors[next % bgColors.length]);
      setIsFlipping(false);
    }, 200);
  };

  const card = affirmations[current];

  return (
    <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
      {/* Card */}
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
  );
}
