import { useState } from 'react';

const cheerMessages: Record<string, { emoji: string; cheers: string[] }> = {
  tired: {
    emoji: '🫂',
    cheers: [
      '你今天真的辛苦了。能撐到現在的你，已經超級厲害了。',
      '累了就停下來吧，世界不會因為你休息就崩塌。但你會因為休息而更有力量。',
      '有一種堅強，叫做承認自己累了。你很勇敢。',
      '孩子不會記得家裡有多乾淨，但會記得媽媽的笑容。今天，允許自己偷懶一下。',
    ],
  },
  frustrated: {
    emoji: '💪',
    cheers: [
      '被氣到想尖叫？你沒有不好，你只是太認真了。',
      '深呼吸。這一刻會過去的，而你會更強大。',
      '生氣不代表你是壞媽媽，代表你是有血有肉、真實的人。',
      '有時候最好的育兒策略，就是先去廁所躲五分鐘。真的。',
    ],
  },
  lonely: {
    emoji: '💗',
    cheers: [
      '當媽媽有時候很孤獨，但請記得，有好多媽媽跟你一樣。你不是一個人。',
      '你的付出或許沒人說謝謝，但每一份愛都在孩子心裡生根發芽。',
      '今天就算只是活著，也已經足夠了。你正在做一件很偉大的事。',
      '如果今天沒有人跟你說，那讓我來：你做得很好，真的。',
    ],
  },
  happy: {
    emoji: '✨',
    cheers: [
      '太好了！把這份快樂好好記住，它會是低潮時最好的能量！',
      '開心的你，就是孩子最好的禮物。繼續閃閃發光吧！',
      '你值得每一個快樂的瞬間。好好享受今天！',
      '看到你開心，全世界都亮了。繼續做讓你快樂的事！',
    ],
  },
  anxious: {
    emoji: '🌸',
    cheers: [
      '焦慮只是你太在乎的證明。但親愛的，你已經做得夠好了。',
      '不需要什麼都想好、什麼都準備好。走一步算一步，也是一種智慧。',
      '那些讓你焦慮的事，十年後回頭看，大多數都不重要。深呼吸。',
      '完美媽媽不存在，但「夠好的媽媽」就在這裡——就是你。',
    ],
  },
  guilty: {
    emoji: '🧸',
    cheers: [
      '有罪惡感的媽媽，通常都是最用心的媽媽。因為不在乎的人不會愧疚。',
      '你對孩子發了脾氣？沒關係，修復比完美更重要。抱抱他，也抱抱自己。',
      '媽媽也是人，也會犯錯。但你的愛從來沒有少過，孩子知道的。',
      '放下那個「應該」。你不需要應該怎樣，你只需要做你自己。',
    ],
  },
};

const feelings = [
  { key: 'tired', emoji: '😮‍💨', label: '好累' },
  { key: 'frustrated', emoji: '😤', label: '好氣' },
  { key: 'lonely', emoji: '🥺', label: '孤單' },
  { key: 'anxious', emoji: '😰', label: '焦慮' },
  { key: 'guilty', emoji: '😔', label: '愧疚' },
  { key: 'happy', emoji: '😊', label: '開心' },
];

export default function CheerCard() {
  const [feeling, setFeeling] = useState<string | null>(null);
  const [story, setStory] = useState('');
  const [cheer, setCheer] = useState<string | null>(null);
  const [cheerEmoji, setCheerEmoji] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const submit = () => {
    if (!feeling) return;
    const group = cheerMessages[feeling];
    const randomCheer = group.cheers[Math.floor(Math.random() * group.cheers.length)];
    setCheer(randomCheer);
    setCheerEmoji(group.emoji);
    setSubmitted(true);
  };

  const getResultText = () => {
    const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
    const feelingInfo = feelings.find((f) => f.key === feeling);
    let text = `🌸 媽媽加油卡 🌸\n`;
    text += `📅 ${today}\n\n`;
    text += `今天的心情：${feelingInfo?.emoji} ${feelingInfo?.label}\n`;
    if (story.trim()) {
      text += `\n✏️ 媽媽說：\n${story}\n`;
    }
    text += `\n${cheerEmoji} 給你的話：\n${cheer}\n\n`;
    text += `妳很棒，記得今天也要愛自己 💗\n\n`;
    text += `—— Mom Life Recovery Lab 🧡\n`;
    text += `chparenting.com/tools/cheer`;
    return text;
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(getResultText());
    } catch {
      const ta = document.createElement('textarea');
      ta.value = getResultText();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareResult = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: '媽媽加油卡', text: getResultText() }); } catch {}
    } else { copyResult(); }
  };

  const reset = () => {
    setFeeling(null);
    setStory('');
    setCheer(null);
    setSubmitted(false);
    setCopied(false);
  };

  if (submitted && cheer) {
    const feelingInfo = feelings.find((f) => f.key === feeling);
    return (
      <div style={{ padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif', maxWidth: 420, margin: '0 auto' }}>
        {/* Result Card */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF8F0, #FFFCF8)', borderRadius: 24,
          padding: '2rem', border: '2px solid #E8A87C30', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 8 }}>🌸</span>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#E8A87C', fontFamily: 'Quicksand, Noto Sans TC, sans-serif', marginBottom: 16 }}>
            給 {feelingInfo?.emoji} 的你
          </h3>

          {story.trim() && (
            <div style={{
              background: 'white', borderRadius: 16, padding: '14px 18px', marginBottom: 16,
              border: '1px solid #EDE5DB', textAlign: 'left' as const,
            }}>
              <p style={{ fontSize: 12, color: '#9A8A7A', marginBottom: 4 }}>✏️ 你說：</p>
              <p style={{ fontSize: 14, color: '#4A3E34', lineHeight: 1.8, fontStyle: 'italic' as const }}>{story}</p>
            </div>
          )}

          <div style={{
            background: '#E8A87C08', borderRadius: 16, padding: '20px 18px',
            border: '1px solid #E8A87C20',
          }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>{cheerEmoji}</span>
            <p style={{ fontSize: 16, color: '#4A3E34', lineHeight: 2, fontWeight: 500 }}>
              {cheer}
            </p>
          </div>

          <p style={{ fontSize: 13, color: '#E8A87C', marginTop: 16, fontWeight: 500 }}>
            妳很棒，記得今天也要愛自己 💗
          </p>
          <p style={{ fontSize: 12, color: '#B8A99A', marginTop: 8 }}>— Mom Life Recovery Lab 🧡 —</p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={copyResult} style={{
            flex: 1, padding: '12px', borderRadius: 16, border: '2px solid #E8A87C',
            background: copied ? '#E8A87C' : 'white', color: copied ? 'white' : '#E8A87C',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Noto Sans TC, sans-serif', transition: 'all 0.2s',
          }}>
            {copied ? '✓ 已複製！' : '📋 複製加油卡'}
          </button>
          <button onClick={shareResult} style={{
            flex: 1, padding: '12px', borderRadius: 16, border: 'none',
            background: '#E8A87C', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Noto Sans TC, sans-serif',
          }}>
            📤 分享給朋友
          </button>
        </div>
        <button onClick={reset} style={{
          width: '100%', marginTop: 8, padding: '10px', borderRadius: 16,
          border: '1px solid #EDE5DB', background: 'transparent', color: '#9A8A7A', fontSize: 13, cursor: 'pointer',
        }}>
          🔄 再寫一次
        </button>
        <p style={{ fontSize: 12, color: '#B8A99A', textAlign: 'center', marginTop: 12 }}>
          💡 複製後可以貼到 LINE 送給自己或朋友！
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif', maxWidth: 420, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>🌸</span>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#4A3E34', fontFamily: 'Quicksand, Noto Sans TC, sans-serif' }}>
          媽媽加油卡
        </h3>
        <p style={{ fontSize: 13, color: '#9A8A7A', marginTop: 6 }}>
          寫下你的心情，讓我給你一句溫暖的話
        </p>
      </div>

      {/* Feeling Selector */}
      <p style={{ fontSize: 14, color: '#5A4E42', fontWeight: 600, marginBottom: 10 }}>今天的心情是？</p>
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 20 }}>
        {feelings.map((f) => (
          <button
            key={f.key}
            onClick={() => setFeeling(f.key)}
            style={{
              padding: '10px 16px', borderRadius: 16,
              border: feeling === f.key ? '2px solid #E8A87C' : '2px solid #EDE5DB',
              background: feeling === f.key ? '#E8A87C10' : 'white',
              cursor: 'pointer', transition: 'all 0.2s', fontSize: 14,
              color: feeling === f.key ? '#E8A87C' : '#5A4E42',
            }}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* Story Input */}
      {feeling && (
        <>
          <p style={{ fontSize: 14, color: '#5A4E42', fontWeight: 600, marginBottom: 10 }}>
            想說些什麼嗎？（也可以不寫）
          </p>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="今天發生了什麼事？有什麼想說的都可以寫在這裡⋯"
            style={{
              width: '100%', minHeight: 120, padding: '14px 16px', borderRadius: 16, border: '2px solid #EDE5DB',
              background: 'white', fontSize: 14, color: '#4A3E34', resize: 'vertical' as const,
              fontFamily: 'Noto Sans TC, sans-serif', outline: 'none', lineHeight: 1.8,
            }}
            onFocus={(e) => (e.target.style.borderColor = '#E8A87C')}
            onBlur={(e) => (e.target.style.borderColor = '#EDE5DB')}
          />

          <button
            onClick={submit}
            style={{
              width: '100%', marginTop: 14, padding: '14px', borderRadius: 16, border: 'none',
              background: '#E8A87C', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
            }}
          >
            🌸 給我一句加油的話
          </button>
        </>
      )}
    </div>
  );
}
