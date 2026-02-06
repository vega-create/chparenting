import { useState } from 'react';

const emotions = [
  { emoji: '😊', name: '開心', color: '#B8C4A0', body: '嘴角上揚、眼睛亮亮的', how: '「你現在看起來很開心呢！是什麼事讓你這麼高興？」' },
  { emoji: '😢', name: '難過', color: '#A0B8C4', body: '眼睛紅紅、想哭、肩膀垂下來', how: '「你看起來有點難過。想跟媽媽說說嗎？沒關係，哭出來也可以。」' },
  { emoji: '😠', name: '生氣', color: '#D4956A', body: '臉紅紅、握拳頭、想大叫', how: '「你現在在生氣。生氣是可以的。我們一起深呼吸好不好？」' },
  { emoji: '😰', name: '害怕', color: '#C4A0A0', body: '身體縮起來、心跳很快', how: '「你是不是有點害怕？媽媽在這裡，我會保護你。」' },
  { emoji: '😮', name: '驚訝', color: '#D4B896', body: '眼睛睜大、嘴巴張開', how: '「哇！你嚇到了嗎？是什麼讓你這麼驚訝？」' },
  { emoji: '🥱', name: '累了', color: '#9A8A7A', body: '打哈欠、揉眼睛、軟趴趴', how: '「你看起來累了。要不要休息一下？媽媽陪你。」' },
  { emoji: '🤗', name: '被愛', color: '#E8A87C', body: '想要抱抱、感覺溫暖', how: '「你知道嗎？媽媽好愛你。來，讓我抱抱你。」' },
  { emoji: '😤', name: '挫折', color: '#C07D52', body: '跺腳、想放棄', how: '「做不到很生氣對不對？沒關係，我們可以慢慢來，或者換個方式試試。」' },
];

export default function EmotionCard() {
  const [selected, setSelected] = useState<typeof emotions[number] | null>(null);
  const [mode, setMode] = useState<'child' | 'parent'>('child');

  return (
    <div style={{ padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif', maxWidth: 480, margin: '0 auto' }}>
      {/* Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        <button onClick={() => { setMode('child'); setSelected(null); }} style={{
          padding: '8px 20px', borderRadius: 12, border: mode === 'child' ? '2px solid #E8A87C' : '2px solid #EDE5DB',
          background: mode === 'child' ? '#E8A87C10' : 'white', color: mode === 'child' ? '#E8A87C' : '#9A8A7A',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Noto Sans TC, sans-serif',
        }}>
          👶 孩子版
        </button>
        <button onClick={() => { setMode('parent'); setSelected(null); }} style={{
          padding: '8px 20px', borderRadius: 12, border: mode === 'parent' ? '2px solid #E8A87C' : '2px solid #EDE5DB',
          background: mode === 'parent' ? '#E8A87C10' : 'white', color: mode === 'parent' ? '#E8A87C' : '#9A8A7A',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Noto Sans TC, sans-serif',
        }}>
          👩 媽媽版
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 16, color: '#4A3E34', marginBottom: 20, fontWeight: 600 }}>
        {mode === 'child' ? '寶貝，你現在的感覺是什麼？' : '媽媽，你現在的感覺是⋯'}
      </p>

      {/* Emotion Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {emotions.map((e) => (
          <button
            key={e.name}
            onClick={() => setSelected(e)}
            style={{
              padding: '12px 8px', borderRadius: 16,
              border: selected?.name === e.name ? `2px solid ${e.color}` : '2px solid #EDE5DB',
              background: selected?.name === e.name ? `${e.color}15` : 'white',
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' as const,
            }}
          >
            <span style={{ fontSize: 32, display: 'block', marginBottom: 4 }}>{e.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: selected?.name === e.name ? e.color : '#5A4E42' }}>{e.name}</span>
          </button>
        ))}
      </div>

      {/* Result */}
      {selected && (
        <div style={{
          padding: '1.5rem', borderRadius: 20, background: `${selected.color}08`,
          border: `2px solid ${selected.color}20`, animation: 'cardFlip 0.3s ease-out',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 48 }}>{selected.emoji}</span>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: selected.color, fontFamily: 'Quicksand, Noto Sans TC, sans-serif' }}>
              {selected.name}
            </h3>
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: '#9A8A7A', fontWeight: 600, marginBottom: 4 }}>🫀 身體感覺：</p>
            <p style={{ fontSize: 14, color: '#5A4E42', lineHeight: 1.8 }}>{selected.body}</p>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 13, color: '#9A8A7A', fontWeight: 600, marginBottom: 4 }}>
              {mode === 'child' ? '💬 媽媽可以這樣說：' : '💬 對自己說：'}
            </p>
            <p style={{ fontSize: 15, color: '#4A3E34', lineHeight: 1.8, fontStyle: 'italic' as const }}>
              {mode === 'parent'
                ? selected.how.replace('你', '我').replace('媽媽', '').replace('我們', '我')
                : selected.how
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
