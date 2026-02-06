import { useState } from 'react';

const questions = [
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

type MomType = { name: string; emoji: string; color: string; desc: string; strength: string; tip: string };

const types: Record<string, MomType> = {
  A: { name: '規劃型超人媽媽', emoji: '🦸‍♀️', color: '#E8A87C', desc: '你是個有條理、重視規矩的媽媽。家裡的大小事都在你的掌控之中。', strength: '孩子會學到紀律和責任感', tip: '記得偶爾也讓自己放鬆一下，不是所有事都要完美 ♡' },
  B: { name: '佛系自在媽媽', emoji: '🧘‍♀️', color: '#8BA888', desc: '你崇尚自然、不強求，相信孩子有自己的節奏。', strength: '孩子會感受到無條件的接納', tip: '適時給一點引導也不錯，在放手和牽手之間找到平衡 ♡' },
  C: { name: '暖心陪伴型媽媽', emoji: '🤗', color: '#D4B896', desc: '你是溫暖的避風港，總是用愛和耐心陪伴孩子。', strength: '孩子會有很強的安全感和自信', tip: '在照顧別人的同時，也別忘了照顧自己的心 ♡' },
  D: { name: '創意冒險型媽媽', emoji: '🚀', color: '#C07D52', desc: '你充滿活力和創意，總是帶給孩子新鮮有趣的體驗。', strength: '孩子會充滿好奇心和探索精神', tip: '有時候平淡的日常也是一種幸福，慢下來也很好 ♡' },
};

export default function MomTypeQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<MomType | null>(null);

  const handleAnswer = (type: string) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 200);
    } else {
      // Calculate result
      const counts: Record<string, number> = {};
      newAnswers.forEach((a) => { counts[a] = (counts[a] || 0) + 1; });
      const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      setTimeout(() => setResult(types[winner]), 300);
    }
  };

  const restart = () => { setCurrentQ(0); setAnswers([]); setResult(null); };

  if (result) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
        <span style={{ fontSize: 64, display: 'block', marginBottom: 16 }}>{result.emoji}</span>
        <h3 style={{ fontSize: 24, fontWeight: 700, color: result.color, fontFamily: 'Quicksand, Noto Sans TC, sans-serif', marginBottom: 8 }}>
          你是：{result.name}
        </h3>
        <p style={{ fontSize: 15, color: '#5A4E42', lineHeight: 1.8, marginBottom: 16, maxWidth: 380, margin: '0 auto 16px' }}>{result.desc}</p>
        <div style={{ background: `${result.color}10`, borderRadius: 16, padding: '1rem 1.5rem', maxWidth: 380, margin: '0 auto 16px', textAlign: 'left' as const }}>
          <p style={{ fontSize: 14, color: '#5A4E42', lineHeight: 1.8 }}>💪 <strong>你的強項：</strong>{result.strength}</p>
          <p style={{ fontSize: 14, color: '#5A4E42', lineHeight: 1.8, marginTop: 8 }}>💡 <strong>小提醒：</strong>{result.tip}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' as const }}>
          <button onClick={() => {
            const text = `我是「${result.name}」${result.emoji}\n${result.desc}\n\n來測測你是哪種媽媽 👉 chparenting.com/tools/mom-type/`;
            if (navigator.share) { navigator.share({ text }); } else { navigator.clipboard.writeText(text); alert('已複製！'); }
          }} style={{ background: result.color, color: 'white', border: 'none', padding: '12px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Quicksand, Noto Sans TC, sans-serif' }}>
            📤 分享結果
          </button>
          <button onClick={restart} style={{ background: 'white', color: '#5A4E42', border: '2px solid #EDE5DB', padding: '12px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Quicksand, Noto Sans TC, sans-serif' }}>
            🔄 重測
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
      <div style={{ marginBottom: 20, textAlign: 'center' as const }}>
        <span style={{ fontSize: 13, color: '#9A8A7A' }}>第 {currentQ + 1} / {questions.length} 題</span>
        <div style={{ height: 6, background: '#EDE5DB', borderRadius: 3, maxWidth: 300, margin: '8px auto 0' }}>
          <div style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, height: '100%', background: '#E8A87C', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>
      <p style={{ fontSize: 18, fontWeight: 600, color: '#4A3E34', lineHeight: 1.6, textAlign: 'center', marginBottom: 24 }}>
        {questions[currentQ].q}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10, maxWidth: 400, margin: '0 auto' }}>
        {questions[currentQ].options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt.type)} style={{
            padding: '14px 20px', borderRadius: 16, border: '2px solid #EDE5DB', background: 'white',
            color: '#4A3E34', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
            textAlign: 'left' as const, fontFamily: 'Noto Sans TC, sans-serif',
          }}
          onMouseOver={(e) => { (e.target as HTMLElement).style.borderColor = '#E8A87C'; (e.target as HTMLElement).style.background = '#E8A87C08'; }}
          onMouseOut={(e) => { (e.target as HTMLElement).style.borderColor = '#EDE5DB'; (e.target as HTMLElement).style.background = 'white'; }}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
