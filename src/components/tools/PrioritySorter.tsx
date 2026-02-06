import { useState } from 'react';

type Priority = 'must' | 'later' | 'drop';
type TodoItem = { id: string; text: string; priority: Priority | null };

const priorities: Record<Priority, { label: string; emoji: string; color: string; desc: string }> = {
  must: { label: '今天必做', emoji: '✅', color: '#8BA888', desc: '不做會怎樣的事' },
  later: { label: '可以晚點', emoji: '⏳', color: '#D4B896', desc: '重要但不急的事' },
  drop: { label: '放掉吧', emoji: '🎈', color: '#E8A87C', desc: '其實不做也不會怎樣' },
};

export default function PrioritySorter() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const addItem = () => {
    if (!input.trim()) return;
    setItems([...items, { id: Date.now().toString(), text: input.trim(), priority: null }]);
    setInput('');
  };

  const setPriority = (id: string, p: Priority) => {
    setItems(items.map((item) => item.id === id ? { ...item, priority: p } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const allSorted = items.length > 0 && items.every((item) => item.priority !== null);

  const getResultText = () => {
    const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    let text = `📋 媽媽的待辦清單\n📅 ${today}\n\n`;
    const must = items.filter((i) => i.priority === 'must');
    const later = items.filter((i) => i.priority === 'later');
    const drop = items.filter((i) => i.priority === 'drop');
    if (must.length) { text += `✅ 今天必做：\n`; must.forEach((i) => { text += `  • ${i.text}\n`; }); text += `\n`; }
    if (later.length) { text += `⏳ 可以晚點：\n`; later.forEach((i) => { text += `  • ${i.text}\n`; }); text += `\n`; }
    if (drop.length) { text += `🎈 放掉吧：\n`; drop.forEach((i) => { text += `  • ${i.text}\n`; }); text += `\n`; }
    text += `💬 專注「今天必做」就好，其他的放輕鬆 ♡\n\n`;
    text += `—— Mom Life Recovery Lab 🧡\nchparenting.com/tools/priority`;
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
      try { await navigator.share({ title: '媽媽的待辦清單', text: getResultText() }); } catch {}
    } else { copyResult(); }
  };

  const reset = () => { setItems([]); setInput(''); setDone(false); setCopied(false); };

  if (done) {
    const must = items.filter((i) => i.priority === 'must');
    const later = items.filter((i) => i.priority === 'later');
    const drop = items.filter((i) => i.priority === 'drop');

    return (
      <div style={{ padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ background: '#FFFCF8', borderRadius: 24, padding: '2rem', border: '2px solid #E8A87C30', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#4A3E34', textAlign: 'center', fontFamily: 'Quicksand, Noto Sans TC, sans-serif', marginBottom: 20 }}>
            📋 你的待辦清單整理好了！
          </h3>

          {[
            { items: must, ...priorities.must },
            { items: later, ...priorities.later },
            { items: drop, ...priorities.drop },
          ].map((group) => group.items.length > 0 && (
            <div key={group.label} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: group.color, marginBottom: 8 }}>
                {group.emoji} {group.label}
              </p>
              {group.items.map((item) => (
                <div key={item.id} style={{
                  padding: '10px 14px', borderRadius: 12, background: `${group.color}08`,
                  border: `1px solid ${group.color}20`, marginBottom: 6, fontSize: 14, color: '#4A3E34',
                }}>
                  {item.text}
                </div>
              ))}
            </div>
          ))}

          <div style={{ background: '#F0F7ED', borderRadius: 16, padding: '14px', marginTop: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#5A8F6A', lineHeight: 1.6 }}>
              🌿 專注在「今天必做」的 {must.length} 件事就好，<br />其他的放輕鬆，妳已經很棒了 ♡
            </p>
          </div>

          <p style={{ fontSize: 12, color: '#B8A99A', textAlign: 'center', marginTop: 12 }}>— Mom Life Recovery Lab 🧡 —</p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={copyResult} style={{
            flex: 1, padding: '12px', borderRadius: 16, border: '2px solid #E8A87C',
            background: copied ? '#E8A87C' : 'white', color: copied ? 'white' : '#E8A87C',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Noto Sans TC, sans-serif', transition: 'all 0.2s',
          }}>
            {copied ? '✓ 已複製！' : '📋 複製清單'}
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
          🔄 重新排序
        </button>
        <p style={{ fontSize: 12, color: '#B8A99A', textAlign: 'center', marginTop: 12 }}>
          💡 複製後可以貼到 LINE 或備忘錄，隨時提醒自己今天的重點！
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Noto Sans TC, sans-serif', maxWidth: 480, margin: '0 auto' }}>
      {/* Input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="輸入待辦事項⋯"
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 16, border: '2px solid #EDE5DB',
            fontSize: 14, color: '#4A3E34', outline: 'none', fontFamily: 'Noto Sans TC, sans-serif',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#E8A87C')}
          onBlur={(e) => (e.target.style.borderColor = '#EDE5DB')}
        />
        <button onClick={addItem} style={{
          padding: '12px 20px', borderRadius: 16, border: 'none', background: '#E8A87C', color: 'white',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const,
        }}>
          + 加入
        </button>
      </div>

      {/* Unsorted items */}
      {items.filter((i) => !i.priority).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#9A8A7A', marginBottom: 8, fontWeight: 500 }}>📝 點選分類：</p>
          {items.filter((i) => !i.priority).map((item) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              borderRadius: 12, background: 'white', border: '1px solid #EDE5DB', marginBottom: 6,
            }}>
              <span style={{ flex: 1, fontSize: 14, color: '#4A3E34' }}>{item.text}</span>
              {Object.entries(priorities).map(([key, p]) => (
                <button key={key} onClick={() => setPriority(item.id, key as Priority)} style={{
                  padding: '4px 8px', borderRadius: 8, border: '1px solid #EDE5DB', background: 'white',
                  fontSize: 11, cursor: 'pointer', color: p.color, fontWeight: 500,
                }} title={p.label}>
                  {p.emoji}
                </button>
              ))}
              <button onClick={() => removeItem(item.id)} style={{
                padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#B8A99A', fontSize: 16,
              }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Sorted groups */}
      {Object.entries(priorities).map(([key, p]) => {
        const groupItems = items.filter((i) => i.priority === key);
        if (groupItems.length === 0) return null;
        return (
          <div key={key} style={{
            marginBottom: 16, padding: '16px', borderRadius: 20,
            background: `${p.color}06`, border: `1px solid ${p.color}20`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: p.color }}>{p.emoji} {p.label}</span>
              <span style={{ fontSize: 12, color: '#B8A99A' }}>{p.desc}</span>
            </div>
            {groupItems.map((item) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                borderRadius: 10, background: 'white', border: '1px solid #EDE5DB', marginBottom: 4,
              }}>
                <span style={{ flex: 1, fontSize: 14, color: '#4A3E34' }}>{item.text}</span>
                <button onClick={() => setPriority(item.id, key === 'must' ? 'later' : key === 'later' ? 'drop' : 'must')} style={{
                  padding: '2px 6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#B8A99A', fontSize: 12,
                }} title="移到其他分類">↔</button>
                <button onClick={() => removeItem(item.id)} style={{
                  padding: '2px 6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#B8A99A', fontSize: 14,
                }}>×</button>
              </div>
            ))}
          </div>
        );
      })}

      {/* Finish button */}
      {allSorted && (
        <>
          <p style={{ textAlign: 'center', fontSize: 14, color: '#8BA888', fontWeight: 500, marginBottom: 12 }}>
            🎉 全部分好了！
          </p>
          <button onClick={finishSort} style={{
            width: '100%', padding: '14px', borderRadius: 16, border: 'none',
            background: '#E8A87C', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Quicksand, Noto Sans TC, sans-serif',
          }}>
            ✨ 完成整理 → 複製 / 分享
          </button>
        </>
      )}

      {items.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 13, color: '#B8A99A', marginTop: 20 }}>
          💡 把你腦中的待辦事項都輸入進來，<br />我幫你分出哪些是「今天真的要做的」！
        </p>
      )}
    </div>
  );

  function finishSort() { setDone(true); }
}
