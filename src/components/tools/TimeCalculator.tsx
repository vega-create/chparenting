import { useState } from 'react';

const activities = [
  { id: 'sleep', name: '睡眠', emoji: '😴', default: 6 },
  { id: 'work', name: '上班/工作', emoji: '💼', default: 8 },
  { id: 'commute', name: '通勤', emoji: '🚗', default: 1 },
  { id: 'cooking', name: '煮飯/準備食物', emoji: '🍳', default: 1.5 },
  { id: 'cleaning', name: '打掃/家務', emoji: '🧹', default: 1 },
  { id: 'childcare', name: '照顧孩子', emoji: '👶', default: 3 },
  { id: 'homework', name: '陪寫功課', emoji: '📚', default: 0.5 },
  { id: 'bath', name: '洗澡/盥洗', emoji: '🚿', default: 0.5 },
  { id: 'errands', name: '採購/雜事', emoji: '🛒', default: 0.5 },
];

export default function TimeCalculator() {
  const [hours, setHours] = useState<Record<string, number>>(
    Object.fromEntries(activities.map((a) => [a.id, a.default]))
  );

  const totalUsed = Object.values(hours).reduce((a, b) => a + b, 0);
  const myTime = Math.max(0, 24 - totalUsed);
  const myTimePercent = (myTime / 24) * 100;

  const getColor = () => {
    if (myTime >= 3) return '#B8C4A0';
    if (myTime >= 1) return '#E8A87C';
    return '#C4A0A0';
  };

  const getMessage = () => {
    if (myTime >= 3) return '你有一些自己的時間，記得好好利用！';
    if (myTime >= 1) return '你的自己時間很少了，要想辦法多留一點給自己。';
    if (myTime > 0) return '你幾乎沒有自己的時間了⋯⋯該求救了！';
    return '你已經透支了！一天只有 24 小時，請重新分配。';
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, marginBottom: 24 }}>
        {activities.map((a) => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20, width: 28 }}>{a.emoji}</span>
            <span style={{ fontSize: 14, color: '#4A3E34', flex: 1, minWidth: 100 }}>{a.name}</span>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={hours[a.id]}
              onChange={(e) => setHours({ ...hours, [a.id]: parseFloat(e.target.value) })}
              style={{ flex: 1, accentColor: '#E8A87C' }}
            />
            <span style={{ fontSize: 14, color: '#5A4E42', fontWeight: 600, width: 50, textAlign: 'right' as const }}>
              {hours[a.id]}h
            </span>
          </div>
        ))}
      </div>

      {/* Result */}
      <div style={{
        textAlign: 'center', padding: '1.5rem', borderRadius: 20,
        background: `${getColor()}12`, border: `2px solid ${getColor()}25`,
      }}>
        <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 4 }}>
          一天 24 小時，你已經用了 {totalUsed.toFixed(1)} 小時
        </p>
        <div style={{ fontSize: 48, fontWeight: 700, color: getColor(), fontFamily: 'Quicksand, sans-serif', marginBottom: 4 }}>
          {myTime.toFixed(1)}h
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#4A3E34', marginBottom: 8 }}>
          是留給你自己的時間
        </p>

        {/* Progress bar */}
        <div style={{ height: 12, background: '#EDE5DB', borderRadius: 6, margin: '12px 0', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${100 - myTimePercent}%`, background: '#D4B896', transition: 'width 0.3s' }} />
          <div style={{ width: `${myTimePercent}%`, background: getColor(), transition: 'width 0.3s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9A8A7A' }}>
          <span>其他事 {totalUsed.toFixed(1)}h</span>
          <span>我的時間 {myTime.toFixed(1)}h</span>
        </div>

        <p style={{ fontSize: 14, color: '#5A4E42', marginTop: 16, lineHeight: 1.8 }}>
          {getMessage()}
        </p>
      </div>
    </div>
  );
}
