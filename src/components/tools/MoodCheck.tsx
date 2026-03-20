import { useState } from 'react';

const moods = [
  { emoji: '😊', label: '還不錯', color: '#B8C4A0', message: '太好了！保持這份好心情，今天的你真棒 ♡' },
  { emoji: '😐', label: '普通', color: '#D4B896', message: '普通也很好，不需要每天都能量滿滿。來杯茶吧 ☕' },
  { emoji: '😮‍💨', label: '有點累', color: '#E8A87C', message: '辛苦了，媽媽。試試 3 分鐘呼吸練習，讓自己充個電 🫁' },
  { emoji: '😢', label: '需要抱抱', color: '#C4A0A0', message: '抱抱你 ♡ 你已經做得夠好了。今天對自己溫柔一點好嗎？' },
];

const toolSuggestions: Record<string, { name: string; href: string; emoji: string }[]> = {
  '還不錯': [
    { name: '正能量卡片', href: '/tools/affirmation/?mood=happy', emoji: '✨' },
    { name: '今日笑話', href: '/tools/jokes/', emoji: '😂' },
  ],
  '普通': [
    { name: '正能量卡片', href: '/tools/affirmation/?mood=tired', emoji: '✨' },
    { name: '白噪音', href: '/tools/white-noise/', emoji: '🌧️' },
  ],
  '有點累': [
    { name: '呼吸練習', href: '/tools/breathing/', emoji: '🫁' },
    { name: '白噪音', href: '/tools/white-noise/', emoji: '🌧️' },
  ],
  '需要抱抱': [
    { name: '呼吸練習', href: '/tools/breathing/', emoji: '🫁' },
    { name: '正能量卡片', href: '/tools/affirmation/?mood=angry', emoji: '✨' },
    { name: '心情日記', href: '/tools/mood-diary/', emoji: '📝' },
  ],
};

export default function MoodCheck() {
  const [selectedMood, setSelectedMood] = useState<typeof moods[number] | null>(null);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm">
      <h2 className="text-center mb-2" style={{ fontFamily: 'Quicksand, Noto Sans TC, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#4A3E34' }}>
        今天的你，還好嗎？
      </h2>
      <p className="text-center text-sm mb-6" style={{ color: '#9A8A7A' }}>
        選一個最接近你現在的心情
      </p>

      {/* Mood Buttons */}
      <div className="flex justify-center gap-3 sm:gap-4 mb-6">
        {moods.map((mood) => (
          <button
            key={mood.label}
            onClick={() => setSelectedMood(mood)}
            className="flex flex-col items-center gap-1 transition-all duration-300"
            style={{
              transform: selectedMood?.label === mood.label ? 'scale(1.15)' : 'scale(1)',
              opacity: selectedMood && selectedMood.label !== mood.label ? 0.5 : 1,
            }}
          >
            <span
              className="text-4xl sm:text-5xl block rounded-2xl p-2 sm:p-3 transition-all duration-300"
              style={{
                background: selectedMood?.label === mood.label ? `${mood.color}25` : 'transparent',
                boxShadow: selectedMood?.label === mood.label ? `0 4px 20px ${mood.color}30` : 'none',
              }}
            >
              {mood.emoji}
            </span>
            <span className="text-xs font-medium" style={{ 
              color: selectedMood?.label === mood.label ? mood.color : '#9A8A7A',
              fontFamily: 'Noto Sans TC, sans-serif',
            }}>
              {mood.label}
            </span>
          </button>
        ))}
      </div>

      {/* Result */}
      {selectedMood && (
        <div
          className="text-center"
          style={{ animation: 'cardFlip 0.4s ease-out' }}
        >
          <div
            className="inline-block rounded-2xl px-6 py-4 mb-4"
            style={{ background: `${selectedMood.color}15`, border: `1px solid ${selectedMood.color}30` }}
          >
            <p className="text-sm leading-relaxed" style={{ color: '#5A4E42', fontFamily: 'Noto Sans TC, sans-serif' }}>
              {selectedMood.message}
            </p>
          </div>

          {/* Tool suggestions */}
          {toolSuggestions[selectedMood.label] && (
            <div className="flex justify-center gap-2 flex-wrap">
              {toolSuggestions[selectedMood.label].map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: `${selectedMood.color}12`,
                    color: '#5A4E42',
                    border: `1px solid ${selectedMood.color}25`,
                    fontFamily: 'Noto Sans TC, sans-serif',
                  }}
                >
                  <span>{tool.emoji}</span>
                  {tool.name}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
