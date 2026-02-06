import { useState } from 'react';

const moodOptions = [
  { emoji: '😄', label: '超開心', value: 5, color: '#B8C4A0', msg: '太好了！把這份開心好好收藏起來，下次心情低落時翻出來看看 ☀️' },
  { emoji: '😊', label: '還不錯', value: 4, color: '#8BA888', msg: '不錯的一天呢！偶爾這樣平靜的好心情，就是最好的禮物 🌿' },
  { emoji: '😐', label: '普普通通', value: 3, color: '#D4B896', msg: '普通的一天也很好，不是每天都要精彩，平淡也是一種幸福 🍵' },
  { emoji: '😔', label: '有點低落', value: 2, color: '#E8A87C', msg: '辛苦了，今天的你已經很努力了。允許自己休息一下吧 🫂' },
  { emoji: '😢', label: '不太好', value: 1, color: '#C4A0A0', msg: '抱抱你。不好的日子會過去的，你比自己想像的更堅強 💗' },
];

const reflections = [
  '今天最感恩的一件事是什麼？',
  '今天有什麼讓你微笑的瞬間？',
  '此刻你最需要什麼？',
  '今天你為自己做了什麼？',
  '如果可以對今天的自己說一句話？',
];

export default function MoodDiary() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [recorded, setRecorded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reflection] = useState(() => reflections[Math.floor(Math.random() * reflections.length)]);

  const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  const moodInfo = selectedMood !== null ? moodOptions.find((m) => m.value === selectedMood) : null;

  const record = () => {
    if (selectedMood === null) return;
    setRecorded(true);
  };

  const getResultText = () => {
    if (!moodInfo) return '';
    let text = `🌸 媽媽心情日記 🌸\n`;
    text += `📅 ${today}\n\n`;
    text += `心情：${moodInfo.emoji} ${moodInfo.label}\n`;
    if (note.trim()) {
      text += `\n✏️ 今日小記：\n${note}\n`;
    }
    text += `\n💬 ${moodInfo.msg}\n`;
    text += `\n—— 來自 Mom Life Recovery Lab 🧡\n`;
    text += `chparenting.com/tools/mood-diary`;
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
        await navigator.share({ title: '媽媽心情日記', text: getResultText() });
      } catch {}
    } else {
      copyResult();
    }
  };

  const reset = () => {
    setSelectedMood(null);
    setNote('');
    setRecorded(false);
    setCopied(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif', maxWidth: 420, margin: '0 auto' }}>
      {!recorded ? (
        <>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 4 }}>{today}</p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#4A3E34', fontFamily: 'Quicksand, Noto Sans TC, sans-serif' }}>
              媽媽，今天心情如何？
            </h3>
            <p style={{ fontSize: 13, color: '#B8A99A', marginTop: 6 }}>
              選一個最接近的心情，記錄今天的自己
            </p>
          </div>

          {/* Mood Selector */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {moodOptions.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMood(m.value)}
                style={{
                  padding: '10px', borderRadius: 16,
                  border: selectedMood === m.value ? `2px solid ${m.color}` : '2px solid #EDE5DB',
                  background: selectedMood === m.value ? `${m.color}15` : 'white',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' as const, minWidth: 60,
                }}
              >
                <span style={{ fontSize: 28, display: 'block' }}>{m.emoji}</span>
                <span style={{ fontSize: 11, color: selectedMood === m.value ? m.color : '#9A8A7A', fontWeight: 500 }}>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Reflection Prompt */}
          {selectedMood !== null && (
            <div style={{
              background: '#FFF8F0', borderRadius: 16, padding: '12px 16px', marginBottom: 12,
              border: '1px dashed #E8A87C40',
            }}>
              <p style={{ fontSize: 13, color: '#E8A87C', fontWeight: 500 }}>✨ 今日小提問：{reflection}</p>
            </div>
          )}

          {/* Note */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="想寫點什麼嗎？也可以不寫 ☺️"
            style={{
              width: '100%', minHeight: 80, padding: '12px 16px', borderRadius: 16, border: '2px solid #EDE5DB',
              background: 'white', fontSize: 14, color: '#4A3E34', resize: 'vertical' as const,
              fontFamily: 'Noto Sans TC, sans-serif', outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#E8A87C')}
            onBlur={(e) => (e.target.style.borderColor = '#EDE5DB')}
          />

          {/* Record Button */}
          <button
            onClick={record}
            disabled={selectedMood === null}
            style={{
              width: '100%', marginTop: 12, padding: '14px', borderRadius: 16, border: 'none',
              background: selectedMood !== null ? '#E8A87C' : '#EDE5DB',
              color: selectedMood !== null ? 'white' : '#B8A99A',
              fontSize: 15, fontWeight: 600, cursor: selectedMood !== null ? 'pointer' : 'default',
              fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
            }}
          >
            📝 完成今天的心情紀錄
          </button>

          {/* Info */}
          <p style={{ fontSize: 12, color: '#B8A99A', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
            💡 紀錄完成後可以複製結果，貼到 LINE 或備忘錄保存
          </p>
        </>
      ) : (
        <>
          {/* Result Card */}
          <div style={{
            background: 'linear-gradient(135deg, #FFF8F0, #FFFCF8)', borderRadius: 24,
            padding: '2rem', border: '2px solid #E8A87C30', textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 8 }}>{today}</p>
            <span style={{ fontSize: 56, display: 'block', marginBottom: 8 }}>{moodInfo?.emoji}</span>
            <h3 style={{
              fontSize: 22, fontWeight: 700, color: moodInfo?.color,
              fontFamily: 'Quicksand, Noto Sans TC, sans-serif', marginBottom: 16,
            }}>
              {moodInfo?.label}
            </h3>

            {note.trim() && (
              <div style={{
                background: 'white', borderRadius: 16, padding: '14px 18px', marginBottom: 16,
                border: '1px solid #EDE5DB', textAlign: 'left' as const,
              }}>
                <p style={{ fontSize: 12, color: '#9A8A7A', marginBottom: 4 }}>✏️ 今日小記</p>
                <p style={{ fontSize: 14, color: '#4A3E34', lineHeight: 1.8 }}>{note}</p>
              </div>
            )}

            <div style={{
              background: `${moodInfo?.color}10`, borderRadius: 16, padding: '14px 18px',
              border: `1px solid ${moodInfo?.color}30`,
            }}>
              <p style={{ fontSize: 14, color: '#4A3E34', lineHeight: 1.8 }}>{moodInfo?.msg}</p>
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
              {copied ? '✓ 已複製！' : '📋 複製紀錄'}
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
            🔄 重新記錄
          </button>

          <p style={{ fontSize: 12, color: '#B8A99A', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
            💡 點「複製紀錄」可以貼到 LINE、備忘錄或日記 App 保存喔！
          </p>
        </>
      )}
    </div>
  );
}
