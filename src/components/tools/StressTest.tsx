import { useState } from 'react';

const questions = [
  { q: '你最近是否常常覺得很疲累，即使睡了也不夠？', emoji: '😴' },
  { q: '你是否經常對孩子或家人發脾氣，事後又後悔？', emoji: '😤' },
  { q: '你是否覺得自己的時間永遠不夠用？', emoji: '⏰' },
  { q: '你是否經常覺得自己「不夠好」？', emoji: '😞' },
  { q: '你是否很少有完全屬於自己的時間？', emoji: '🙋‍♀️' },
  { q: '你是否常常感到焦慮或擔心？', emoji: '😰' },
  { q: '你是否覺得做家事是永遠做不完的循環？', emoji: '🏠' },
  { q: '你是否很少跟朋友見面或聊天？', emoji: '📱' },
  { q: '你是否覺得自己的興趣和夢想都放下了？', emoji: '🎨' },
  { q: '你是否常常忘記好好吃一頓飯？', emoji: '🍽️' },
];

const options = [
  { label: '從不', score: 0 },
  { label: '偶爾', score: 1 },
  { label: '經常', score: 2 },
  { label: '總是', score: 3 },
];

type Result = {
  level: string;
  emoji: string;
  color: string;
  message: string;
  tips: string[];
};

const getResult = (score: number): Result => {
  if (score <= 8) {
    return {
      level: '壓力尚可',
      emoji: '😊',
      color: '#B8C4A0',
      message: '你的壓力指數在可控範圍內，繼續保持對自己的關注！',
      tips: ['保持目前的自我照顧習慣', '偶爾給自己小獎勵', '持續和朋友保持聯繫'],
    };
  } else if (score <= 16) {
    return {
      level: '中等壓力',
      emoji: '😐',
      color: '#D4B896',
      message: '你承受著不少壓力，是時候多花點時間照顧自己了。',
      tips: ['每天留 10 分鐘給自己', '試試呼吸練習或冥想', '和信任的人聊聊你的感受', '減少不必要的待辦事項'],
    };
  } else if (score <= 24) {
    return {
      level: '壓力偏高',
      emoji: '😮‍💨',
      color: '#E8A87C',
      message: '你的壓力已經很高了，請認真考慮為自己安排一些喘息時間。',
      tips: ['每天做 3 分鐘呼吸練習', '試著說「不」，減少負擔', '找人幫忙分擔家務', '考慮找心理諮商師聊聊'],
    };
  } else {
    return {
      level: '壓力爆表',
      emoji: '😢',
      color: '#C4A0A0',
      message: '你承受了太多壓力了！你不是一個人，請讓身邊的人幫你分擔。',
      tips: ['立刻找一個信任的人傾訴', '考慮尋求專業心理諮商', '暫時放下「完美」的標準', '你的健康比任何事都重要'],
    };
  }
};

export default function StressTest() {
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [showResult, setShowResult] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = score;
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 200);
    }
  };

  const totalScore = answers.reduce((a, b) => a + (b >= 0 ? b : 0), 0);
  const allAnswered = answers.every((a) => a >= 0);
  const result = getResult(totalScore);

  if (showResult) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
        <span style={{ fontSize: 64, display: 'block', marginBottom: 16 }}>{result.emoji}</span>
        <h3 style={{ fontSize: 24, fontWeight: 700, color: result.color, fontFamily: 'Quicksand, Noto Sans TC, sans-serif', marginBottom: 8 }}>
          {result.level}
        </h3>
        <p style={{ fontSize: 14, color: '#5A4E42', marginBottom: 8 }}>
          壓力指數：{totalScore} / 30
        </p>
        <div style={{ width: 200, height: 8, background: '#EDE5DB', borderRadius: 4, margin: '0 auto 20px' }}>
          <div style={{ width: `${(totalScore / 30) * 100}%`, height: '100%', background: result.color, borderRadius: 4, transition: 'width 1s' }} />
        </div>
        <p style={{ fontSize: 15, color: '#5A4E42', lineHeight: 1.8, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
          {result.message}
        </p>

        <div style={{ background: `${result.color}10`, borderRadius: 16, padding: '1.5rem', maxWidth: 400, margin: '0 auto 24px', textAlign: 'left' as const }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#4A3E34', marginBottom: 12 }}>💡 建議：</p>
          {result.tips.map((tip, i) => (
            <p key={i} style={{ fontSize: 14, color: '#5A4E42', lineHeight: 1.8, paddingLeft: 16, position: 'relative' as const }}>
              <span style={{ position: 'absolute' as const, left: 0 }}>•</span>
              {tip}
            </p>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <a href="/tools/breathing/" style={{
            background: '#E8A87C', color: 'white', padding: '12px 24px', borderRadius: 999,
            fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
          }}>
            🫁 試試呼吸練習
          </a>
          <button onClick={() => { setShowResult(false); setCurrentQ(0); setAnswers(new Array(questions.length).fill(-1)); }}
            style={{ background: 'white', color: '#5A4E42', border: '2px solid #EDE5DB', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Quicksand, Noto Sans TC, sans-serif' }}>
            🔄 重新測驗
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif' }}>
      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#9A8A7A' }}>第 {currentQ + 1} / {questions.length} 題</span>
          <span style={{ fontSize: 13, color: '#9A8A7A' }}>{Math.round(((currentQ) / questions.length) * 100)}%</span>
        </div>
        <div style={{ height: 6, background: '#EDE5DB', borderRadius: 3 }}>
          <div style={{ width: `${(currentQ / questions.length) * 100}%`, height: '100%', background: '#E8A87C', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>{questions[currentQ].emoji}</span>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#4A3E34', lineHeight: 1.6 }}>
          {questions[currentQ].q}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10, maxWidth: 360, margin: '0 auto' }}>
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleAnswer(opt.score)}
            style={{
              padding: '14px 20px',
              borderRadius: 16,
              border: answers[currentQ] === opt.score ? '2px solid #E8A87C' : '2px solid #EDE5DB',
              background: answers[currentQ] === opt.score ? '#E8A87C10' : 'white',
              color: '#4A3E34',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Noto Sans TC, sans-serif',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, maxWidth: 360, margin: '24px auto 0' }}>
        <button
          onClick={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
          disabled={currentQ === 0}
          style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: currentQ === 0 ? '#EDE5DB' : '#F5F0EB', color: currentQ === 0 ? '#B8A99A' : '#5A4E42', cursor: currentQ === 0 ? 'default' : 'pointer', fontSize: 14, fontFamily: 'Noto Sans TC, sans-serif' }}
        >
          ← 上一題
        </button>
        {allAnswered ? (
          <button
            onClick={() => setShowResult(true)}
            style={{ padding: '10px 24px', borderRadius: 12, border: 'none', background: '#E8A87C', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'Quicksand, Noto Sans TC, sans-serif' }}
          >
            看結果 ✨
          </button>
        ) : currentQ < questions.length - 1 ? (
          <button
            onClick={() => answers[currentQ] >= 0 && setCurrentQ(currentQ + 1)}
            disabled={answers[currentQ] < 0}
            style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: answers[currentQ] >= 0 ? '#F5F0EB' : '#EDE5DB', color: answers[currentQ] >= 0 ? '#5A4E42' : '#B8A99A', cursor: answers[currentQ] >= 0 ? 'pointer' : 'default', fontSize: 14, fontFamily: 'Noto Sans TC, sans-serif' }}
          >
            下一題 →
          </button>
        ) : null}
      </div>
    </div>
  );
}
