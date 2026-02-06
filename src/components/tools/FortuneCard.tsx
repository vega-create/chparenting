import { useState } from 'react';

const fortunes = [
  { number: 1, title: '大吉', color: '#B8C4A0', poem: '春風輕拂暖心房', message: '今天會有意想不到的小確幸，保持開放的心迎接它吧！', advice: '放下手機 15 分鐘，好好享受一杯熱茶的時光。' },
  { number: 2, title: '吉', color: '#8BA888', poem: '細雨潤物無聲來', message: '你默默付出的一切，孩子都感受到了。你的愛正在發芽。', advice: '今天試著對自己說三次「我做得很好」。' },
  { number: 3, title: '大吉', color: '#B8C4A0', poem: '朝陽初昇萬物新', message: '新的機會正在靠近你！相信自己的直覺。', advice: '寫下一個你一直想做的事，今天就踏出第一步。' },
  { number: 4, title: '中吉', color: '#D4B896', poem: '靜水深流藏力量', message: '看似平凡的日子裡，你正在累積巨大的能量。', advice: '找一首喜歡的歌，閉上眼睛聽完整首。' },
  { number: 5, title: '吉', color: '#8BA888', poem: '微風送來花香氣', message: '今天適合和重要的人聊聊天，溫暖會在對話中流動。', advice: '傳一則訊息給好久沒聯絡的朋友。' },
  { number: 6, title: '大吉', color: '#B8C4A0', poem: '雲開月明照前路', message: '困擾你的事情即將有轉機，再堅持一下！', advice: '把煩惱寫在紙上，然後把紙折起來放到看不見的地方。' },
  { number: 7, title: '中吉', color: '#D4B896', poem: '小溪蜿蜒終入海', message: '不要急，你走的每一步都算數。慢慢來比較快。', advice: '今天做事放慢 20% 的速度，你會發現更多細節。' },
  { number: 8, title: '吉', color: '#8BA888', poem: '綠葉成蔭護花開', message: '你就是家裡最溫暖的存在，孩子因你而安心。', advice: '給自己一個擁抱，你值得被好好對待。' },
  { number: 9, title: '大吉', color: '#B8C4A0', poem: '彩虹橫跨萬里天', message: '今天的運氣特別好！把握機會，好事會接連發生。', advice: '做一件平常不會做的事，給自己一點小冒險。' },
  { number: 10, title: '中吉', color: '#D4B896', poem: '秋月圓滿照人間', message: '知足常樂。看看身邊，你已經擁有很多很多了。', advice: '拍一張今天讓你感恩的東西，存在手機裡。' },
  { number: 11, title: '吉', color: '#8BA888', poem: '竹節堅韌不畏風', message: '你比自己想像的更堅強。困難只是暫時的。', advice: '回想一次你成功克服困難的經歷，你做到過，就能再做到。' },
  { number: 12, title: '大吉', color: '#B8C4A0', poem: '桃花盛開迎春來', message: '好人緣今天特別旺！多和人互動會有好事發生。', advice: '對遇到的每個人微笑，快樂會加倍回來。' },
  { number: 13, title: '中吉', color: '#D4B896', poem: '星光點點引方向', message: '答案就在你心裡，靜下來聽聽自己的聲音。', advice: '找一個安靜的角落，閉眼深呼吸 10 次。' },
  { number: 14, title: '吉', color: '#8BA888', poem: '泉水清澈映天心', message: '今天適合整理思緒。理清了就會輕鬆很多。', advice: '花 5 分鐘寫下今天最重要的 3 件事。' },
  { number: 15, title: '大吉', color: '#B8C4A0', poem: '金風送爽豐收時', message: '你之前的努力開始有了回報！好好享受這份成就感。', advice: '犒賞自己一個小禮物，你值得。' },
  { number: 16, title: '中吉', color: '#D4B896', poem: '蝴蝶翩翩訪花園', message: '美好的事物正在向你飛來，保持耐心。', advice: '今天出門走走，大自然會給你力量。' },
  { number: 17, title: '吉', color: '#8BA888', poem: '暖陽輕灑滿窗台', message: '平凡的日常就是最大的幸福。好好珍惜每一刻。', advice: '跟孩子玩一個小遊戲，享受純粹的快樂。' },
  { number: 18, title: '大吉', color: '#B8C4A0', poem: '東風化雨萬物生', message: '今天開始的事情會順利發展！放膽去做吧。', advice: '那個你猶豫的決定，今天就做吧，宇宙支持你。' },
  { number: 19, title: '中吉', color: '#D4B896', poem: '明月千里寄相思', message: '今天特別適合表達愛意，讓身邊的人知道你在乎他們。', advice: '跟家人說一句「謝謝你」或「我愛你」。' },
  { number: 20, title: '吉', color: '#8BA888', poem: '松柏常青不畏寒', message: '你的堅持終究會被看見。繼續做對的事就好。', advice: '列出 3 個你很棒的優點，大聲唸出來。' },
];

export default function FortuneCard() {
  const [fortune, setFortune] = useState<typeof fortunes[number] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const draw = () => {
    setIsDrawing(true);
    setIsRevealed(false);
    setFortune(null);

    // Simulate shaking/drawing animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * fortunes.length);
      setFortune(fortunes[randomIndex]);
      setIsDrawing(false);
    }, 1500);
  };

  const reveal = () => {
    setIsRevealed(true);
  };

  const getResultText = () => {
    if (!fortune) return '';
    const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
    let text = `🏮 媽媽安心籤 第${fortune.number}籤 🏮\n`;
    text += `📅 ${today}\n\n`;
    text += `【${fortune.title}】\n`;
    text += `📜 ${fortune.poem}\n\n`;
    text += `💌 ${fortune.message}\n\n`;
    text += `🌿 今日建議：${fortune.advice}\n\n`;
    text += `—— 來自 Mom Life Recovery Lab 🧡\n`;
    text += `每天一籤 👉 chparenting.com/tools/fortune`;
    return text;
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(getResultText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = getResultText();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareResult = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: '媽媽安心籤', text: getResultText() });
      } catch {}
    } else {
      copyResult();
    }
  };

  const reset = () => {
    setFortune(null);
    setIsRevealed(false);
    setCopied(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif', maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>🏮</span>
        <h3 style={{ fontSize: 22, fontWeight: 700, color: '#4A3E34', fontFamily: 'Quicksand, Noto Sans TC, sans-serif' }}>
          媽媽安心籤
        </h3>
        <p style={{ fontSize: 13, color: '#9A8A7A', marginTop: 6 }}>
          每天一籤，給自己一句溫暖的話
        </p>
      </div>

      {!fortune && !isDrawing && (
        <>
          {/* Fortune Box */}
          <div style={{
            width: 200, height: 260, margin: '0 auto 24px', borderRadius: 20,
            background: 'linear-gradient(180deg, #E8A87C, #D4956A)', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(232, 168, 124, 0.3)',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', background: '#FFF5ED',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'absolute', top: -15,
            }}>
              <span style={{ fontSize: 10, color: '#E8A87C', fontWeight: 700 }}>安心籤</span>
            </div>
            <div style={{ color: 'white', padding: 20 }}>
              <p style={{ fontSize: 48, marginBottom: 8 }}>🙏</p>
              <p style={{ fontSize: 14, fontWeight: 500, opacity: 0.9 }}>誠心默念</p>
              <p style={{ fontSize: 14, fontWeight: 500, opacity: 0.9 }}>再點下方抽籤</p>
            </div>
          </div>

          <button
            onClick={draw}
            style={{
              padding: '14px 48px', borderRadius: 20, border: 'none',
              background: 'linear-gradient(135deg, #E8A87C, #D4956A)', color: 'white',
              fontSize: 18, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
              boxShadow: '0 4px 16px rgba(232, 168, 124, 0.4)',
              transition: 'transform 0.2s',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            🏮 抽一籤
          </button>
        </>
      )}

      {/* Drawing Animation */}
      {isDrawing && (
        <div style={{ padding: '60px 0' }}>
          <div style={{
            width: 80, height: 80, margin: '0 auto', borderRadius: '50%',
            background: '#E8A87C20', display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'shake 0.3s infinite alternate',
          }}>
            <span style={{ fontSize: 48 }}>🏮</span>
          </div>
          <p style={{ fontSize: 16, color: '#E8A87C', fontWeight: 600, marginTop: 20 }}>
            誠心抽籤中⋯
          </p>
          <style>{`@keyframes shake { 0% { transform: rotate(-5deg); } 100% { transform: rotate(5deg); } }`}</style>
        </div>
      )}

      {/* Fortune Stick (before reveal) */}
      {fortune && !isRevealed && (
        <>
          <div style={{
            width: 80, height: 200, margin: '0 auto 24px',
            background: 'linear-gradient(180deg, #F5D5BD, #E8A87C)',
            borderRadius: '8px 8px 4px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(232, 168, 124, 0.3)',
            transform: 'rotate(-5deg)',
          }}>
            <div style={{
              writingMode: 'vertical-rl' as const, color: 'white', fontSize: 18, fontWeight: 700,
              letterSpacing: 8,
            }}>
              第{fortune.number}籤
            </div>
          </div>

          <button
            onClick={reveal}
            style={{
              padding: '14px 48px', borderRadius: 20, border: 'none',
              background: '#E8A87C', color: 'white',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
              boxShadow: '0 4px 16px rgba(232, 168, 124, 0.3)',
            }}
          >
            🔮 解籤
          </button>
        </>
      )}

      {/* Revealed Fortune */}
      {fortune && isRevealed && (
        <>
          <div style={{
            background: '#FFFCF8', borderRadius: 24, padding: '2rem',
            border: `2px solid ${fortune.color}40`, textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            {/* Header */}
            <p style={{ fontSize: 12, color: '#9A8A7A', marginBottom: 4 }}>第 {fortune.number} 籤</p>
            <div style={{
              display: 'inline-block', padding: '6px 24px', borderRadius: 12,
              background: `${fortune.color}15`, border: `1px solid ${fortune.color}40`, marginBottom: 16,
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: fortune.color, fontFamily: 'Quicksand, Noto Sans TC, sans-serif' }}>
                {fortune.title}
              </span>
            </div>

            {/* Poem */}
            <div style={{
              background: 'white', borderRadius: 16, padding: '16px', marginBottom: 16,
              border: '1px solid #EDE5DB',
            }}>
              <p style={{ fontSize: 11, color: '#B8A99A', marginBottom: 4 }}>📜 籤詩</p>
              <p style={{ fontSize: 18, color: '#4A3E34', fontWeight: 600, letterSpacing: 2 }}>
                {fortune.poem}
              </p>
            </div>

            {/* Message */}
            <div style={{
              background: `${fortune.color}08`, borderRadius: 16, padding: '16px', marginBottom: 16,
              border: `1px solid ${fortune.color}20`,
            }}>
              <p style={{ fontSize: 11, color: fortune.color, marginBottom: 4, fontWeight: 600 }}>💌 籤語</p>
              <p style={{ fontSize: 15, color: '#4A3E34', lineHeight: 1.8 }}>{fortune.message}</p>
            </div>

            {/* Advice */}
            <div style={{
              background: '#F0F7ED', borderRadius: 16, padding: '16px',
              border: '1px solid #D4EDDA',
            }}>
              <p style={{ fontSize: 11, color: '#8BA888', marginBottom: 4, fontWeight: 600 }}>🌿 今日建議</p>
              <p style={{ fontSize: 14, color: '#4A3E34', lineHeight: 1.8 }}>{fortune.advice}</p>
            </div>

            <p style={{ fontSize: 12, color: '#B8A99A', marginTop: 16 }}>
              — Mom Life Recovery Lab 🧡 —
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              onClick={copyResult}
              style={{
                flex: 1, padding: '12px', borderRadius: 16, border: '2px solid #E8A87C',
                background: copied ? '#E8A87C' : 'white', color: copied ? 'white' : '#E8A87C',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Noto Sans TC, sans-serif', transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ 已複製！' : '📋 複製籤詩'}
            </button>
            <button
              onClick={shareResult}
              style={{
                flex: 1, padding: '12px', borderRadius: 16, border: 'none',
                background: '#E8A87C', color: 'white',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Noto Sans TC, sans-serif',
              }}
            >
              📤 分享給朋友
            </button>
          </div>

          <button
            onClick={reset}
            style={{
              width: '100%', marginTop: 8, padding: '10px', borderRadius: 16,
              border: '1px solid #EDE5DB', background: 'transparent',
              color: '#9A8A7A', fontSize: 13, cursor: 'pointer',
              fontFamily: 'Noto Sans TC, sans-serif',
            }}
          >
            🔄 再抽一籤
          </button>

          <p style={{ fontSize: 12, color: '#B8A99A', marginTop: 12, lineHeight: 1.6 }}>
            💡 點「複製籤詩」可以貼到 LINE 分享給朋友喔！
          </p>
        </>
      )}
    </div>
  );
}
