import { useState, useEffect } from 'react';

const jokes = [
  { setup: '為什麼媽媽都很會數學？', punchline: '因為每天都在算「還有幾分鐘小孩才睡」', emoji: '🧮' },
  { setup: '媽媽的超能力是什麼？', punchline: '可以一邊煮飯一邊接電話一邊阻止小孩把貓塞進洗衣機', emoji: '🦸‍♀️' },
  { setup: '什麼時候家裡最安靜？', punchline: '小孩在搗蛋你還沒發現的時候', emoji: '🤫' },
  { setup: '媽媽的一天有幾個小時？', punchline: '24 小時，但屬於自己的大概 3 分鐘', emoji: '⏰' },
  { setup: '為什麼媽媽記性不好？', punchline: '因為腦容量都被「孩子的水壺放哪了」佔滿了', emoji: '🧠' },
  { setup: '媽媽的理想週末是什麼？', punchline: '一個人去超市，慢慢逛，不被叫「媽媽～」', emoji: '🛒' },
  { setup: '什麼比恐怖片更可怕？', punchline: '浴室突然安靜下來', emoji: '🚿' },
  { setup: '媽媽的時尚準則是什麼？', punchline: '今天這件衣服上面沒有食物殘渣', emoji: '👗' },
  { setup: '為什麼媽媽都是偵探？', punchline: '因為每天都在破解「是誰把牆壁畫成那樣」的懸案', emoji: '🔍' },
  { setup: '媽媽最浪漫的夢是什麼？', punchline: '連續睡 8 小時', emoji: '💤' },
  { setup: '什麼東西永遠找不到？', punchline: '小孩的另一隻襪子', emoji: '🧦' },
  { setup: '媽媽的早餐通常是什麼？', punchline: '小孩吃剩的半片吐司和冷掉的咖啡', emoji: '☕' },
  { setup: '為什麼媽媽說話要重複三次？', punchline: '第一次小孩沒聽到，第二次假裝沒聽到，第三次才是認真的', emoji: '📢' },
  { setup: '媽媽最害怕的四個字是什麼？', punchline: '「媽我無聊」', emoji: '😱' },
  { setup: '什麼時候媽媽跑最快？', punchline: '聽到「碰」一聲然後安靜三秒的時候', emoji: '🏃‍♀️' },
];

export default function DailyJokes() {
  const [current, setCurrent] = useState(0);
  const [showPunchline, setShowPunchline] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    setCurrent(seed % jokes.length);
  }, []);

  const next = () => {
    setIsFlipping(true);
    setShowPunchline(false);
    setTimeout(() => {
      setCurrent((c) => (c + 1) % jokes.length);
      setIsFlipping(false);
    }, 200);
  };

  const joke = jokes[current];

  return (
    <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
      <div style={{
        maxWidth: 400, margin: '0 auto 24px', padding: '2rem', borderRadius: 24,
        background: 'linear-gradient(135deg, #E8A87C12, #D4B89608)',
        border: '2px solid #E8A87C20', minHeight: 200,
        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', transform: isFlipping ? 'scale(0.97)' : 'scale(1)', opacity: isFlipping ? 0.5 : 1,
      }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>{joke.emoji}</span>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#4A3E34', lineHeight: 1.6, marginBottom: 16 }}>
          {joke.setup}
        </p>
        {showPunchline ? (
          <div style={{ animation: 'cardFlip 0.3s ease-out' }}>
            <p style={{ fontSize: 16, color: '#D4956A', fontWeight: 600, lineHeight: 1.6, padding: '12px 20px', background: '#D4956A10', borderRadius: 12 }}>
              😂 {joke.punchline}
            </p>
          </div>
        ) : (
          <button onClick={() => setShowPunchline(true)} style={{
            background: '#E8A87C', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 999,
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
          }}>
            👀 看答案
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={next} style={{
          background: '#E8A87C', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 999,
          fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Quicksand, Noto Sans TC, sans-serif', boxShadow: '0 4px 20px #E8A87C30',
        }}>
          🔄 下一則
        </button>
        <button onClick={() => {
          const text = `${joke.setup}\n${joke.punchline} 😂\n\n— 媽媽生活復原力Lab`;
          if (navigator.share) { navigator.share({ text }); } else { navigator.clipboard.writeText(text); alert('已複製！'); }
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
