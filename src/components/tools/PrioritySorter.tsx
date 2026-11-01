import { useState, useRef, useEffect } from 'react';
import { CopyButton, Notice, track } from './ui';

// 只在記憶體：沒有 localStorage、沒有伺服器，離頁即消失。
const MAX_LEN = 100;
const MAX_ITEMS = 30;

type Priority = 'must' | 'later' | 'drop';
type TodoItem = { id: string; text: string; priority: Priority | null };

const priorities: { key: Priority; label: string; desc: string; color: string }[] = [
  { key: 'must', label: '今天必做', desc: '不做會怎樣的事', color: '#C0582F' },
  { key: 'later', label: '可以晚點', desc: '重要但不急的事', color: '#B07A2A' },
  { key: 'drop', label: '今天先放下', desc: '其實不做也不會怎樣', color: '#6E8E6A' },
];
const labelOf = (p: Priority) => priorities.find((x) => x.key === p)!.label;

let seq = 0;
const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `item-${++seq}-${Date.now()}`);

export default function PrioritySorter() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [input, setInput] = useState('');
  const [inputMsg, setInputMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [removed, setRemoved] = useState<{ item: TodoItem; index: number } | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (done) resultRef.current?.focus(); }, [done]);
  useEffect(() => () => { if (undoTimer.current) clearTimeout(undoTimer.current); }, []);

  const addItem = () => {
    const text = input.trim();
    if (!text) { setInputMsg('請先輸入內容'); return; }
    if (text.length > MAX_LEN) { setInputMsg(`每項最多 ${MAX_LEN} 字，目前 ${text.length} 字`); return; }
    if (items.length >= MAX_ITEMS) { setInputMsg(`最多 ${MAX_ITEMS} 項，先整理現有的吧`); return; }
    setItems((list) => [...list, { id: newId(), text, priority: null }]);
    setInput('');
    setInputMsg(null);
    inputRef.current?.focus();
    if (items.length === 0) track('tool_start', { tool_id: 'priority' });
  };

  const setPriority = (id: string, p: Priority) =>
    setItems((list) => list.map((it) => (it.id === id ? { ...it, priority: p } : it)));

  const removeItem = (id: string) => {
    const index = items.findIndex((it) => it.id === id);
    if (index < 0) return;
    setRemoved({ item: items[index], index });
    setItems((list) => list.filter((it) => it.id !== id));
    if (editingId === id) setEditingId(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setRemoved(null), 6000);
  };

  const undoRemove = () => {
    if (!removed) return;
    setItems((list) => {
      const next = [...list];
      next.splice(Math.min(removed.index, next.length), 0, removed.item);
      return next;
    });
    setRemoved(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  const startEdit = (it: TodoItem) => { setEditingId(it.id); setEditText(it.text); };
  const saveEdit = () => {
    const text = editText.trim();
    if (!text || text.length > MAX_LEN) return;
    setItems((list) => list.map((it) => (it.id === editingId ? { ...it, text } : it)));
    setEditingId(null);
  };
  const cancelEdit = () => setEditingId(null);

  const unsorted = items.filter((it) => it.priority === null);
  const grouped = (p: Priority) => items.filter((it) => it.priority === p);

  const resultText = () => {
    const lines: string[] = ['媽媽的待辦清單', ''];
    for (const p of priorities) {
      const g = grouped(p.key);
      lines.push(`${p.label}：${g.length}`);
      if (g.length === 0) lines.push('　目前沒有');
      g.forEach((it) => lines.push(`　• ${it.text}`));
      lines.push('');
    }
    if (unsorted.length) {
      lines.push(`尚未分類：${unsorted.length}`);
      unsorted.forEach((it) => lines.push(`　• ${it.text}`));
      lines.push('');
    }
    return lines.join('\n').trimEnd();
  };

  const restart = () => {
    if (items.length && !window.confirm('重新開始會清空目前所有事項，確定嗎？')) return;
    setItems([]); setInput(''); setInputMsg(null); setEditingId(null); setRemoved(null); setDone(false);
  };

  /* ── 完成畫面 ── */
  if (done) {
    return (
      <div className="max-w-md mx-auto">
        <h2 ref={resultRef} tabIndex={-1} className="text-xl font-bold text-warmgray-800 text-center outline-none">今天的清單</h2>
        <div className="mt-4 flex flex-col gap-3">
          {priorities.map((p) => {
            const g = grouped(p.key);
            return (
              <section key={p.key} className="rounded-2xl bg-white p-4" style={{ border: '1.5px solid #E8DFD5', borderLeft: `6px solid ${p.color}` }}>
                <h3 className="font-bold text-warmgray-800">{p.label}：{g.length}</h3>
                {g.length === 0 ? (
                  <p className="text-sm tl-muted mt-1">目前沒有</p>
                ) : (
                  <ul className="mt-2 list-disc pl-5 text-[15px] text-warmgray-800 leading-relaxed">
                    {g.map((it) => <li key={it.id} className="break-words">{it.text}</li>)}
                  </ul>
                )}
              </section>
            );
          })}
          {unsorted.length > 0 && (
            <section className="rounded-2xl p-4" style={{ background: '#FCEFE6', border: '1.5px solid #E8DFD5' }}>
              <h3 className="font-bold text-warmgray-800">尚未分類：{unsorted.length}</h3>
              <ul className="mt-2 list-disc pl-5 text-[15px] text-warmgray-800 leading-relaxed">
                {unsorted.map((it) => <li key={it.id} className="break-words">{it.text}</li>)}
              </ul>
              <p className="text-sm tl-muted mt-2">按「返回修改」可以替這些事項選分類。</p>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-2.5 mt-5">
          <CopyButton text={resultText()} label="複製清單" className="tl-btn tl-btn-primary w-full" toolId="priority" />
          <button type="button" className="tl-btn tl-btn-secondary w-full" onClick={() => setDone(false)}>返回修改</button>
          <button type="button" className="tl-btn tl-btn-ghost w-full" onClick={restart}>重新開始</button>
        </div>
        <div className="mt-4">
          <Notice>此頁不提供跨裝置保存，請複製保存。</Notice>
        </div>
      </div>
    );
  }

  /* ── 編輯畫面 ── */
  const renderItem = (it: TodoItem) => {
    const isEditing = editingId === it.id;
    return (
      <li key={it.id} className="rounded-2xl bg-white p-3" style={{ border: '1.5px solid #E8DFD5' }}>
        {isEditing ? (
          <div>
            <label htmlFor={`edit-${it.id}`} className="sr-only">編輯事項</label>
            <input
              id={`edit-${it.id}`}
              value={editText}
              maxLength={MAX_LEN}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
              autoFocus
              className="w-full h-11 rounded-xl px-3 text-[15px] text-warmgray-800 outline-none tl-focus"
              style={{ border: '1.5px solid #8BA888' }}
            />
            <p className="text-xs tl-muted mt-1 text-right">{editText.length}/{MAX_LEN}</p>
            <div className="flex gap-2 mt-2">
              <button type="button" className="tl-btn tl-btn-primary !min-h-[44px] !px-4 text-sm flex-1" onClick={saveEdit} disabled={!editText.trim()}>儲存</button>
              <button type="button" className="tl-btn tl-btn-secondary !min-h-[44px] !px-4 text-sm flex-1" onClick={cancelEdit}>取消</button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-[15px] text-warmgray-800 break-words">{it.text}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {priorities.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className="tl-option !min-h-[40px] !px-3 !rounded-xl text-sm"
                  aria-pressed={it.priority === p.key}
                  onClick={() => setPriority(it.id, p.key)}
                >
                  {it.priority === p.key ? `✓ ${p.label}` : p.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              <button type="button" className="tl-btn tl-btn-ghost !min-h-[40px] !px-3 text-sm" onClick={() => startEdit(it)}>編輯</button>
              <button type="button" className="tl-btn tl-btn-ghost !min-h-[40px] !px-3 text-sm" onClick={() => removeItem(it.id)}>移除</button>
            </div>
          </>
        )}
      </li>
    );
  };

  return (
    <div className="max-w-md mx-auto">
      <p className="text-[15px] text-warmgray-800 text-center">把待辦寫下來，再由你決定先做什麼。</p>

      <div className="mt-4">
        <label htmlFor="todo-input" className="sr-only">新增待辦事項</label>
        <div className="flex gap-2">
          <input
            id="todo-input"
            ref={inputRef}
            value={input}
            maxLength={MAX_LEN}
            onChange={(e) => { setInput(e.target.value); setInputMsg(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
            placeholder="例如：接孩子、整理書桌"
            className="flex-1 min-w-0 h-12 rounded-xl bg-white px-4 text-[15px] text-warmgray-800 outline-none tl-focus"
            style={{ border: '1.5px solid #E8DFD5' }}
          />
          <button type="button" className="tl-btn tl-btn-primary shrink-0" onClick={addItem}>加入</button>
        </div>
        <div className="flex justify-between text-sm tl-muted mt-1">
          <span role="status">{inputMsg ?? ''}</span>
          <span>{items.length}/{MAX_ITEMS} 項・{input.length}/{MAX_LEN} 字</span>
        </div>
      </div>

      {removed && (
        <div className="mt-3 tl-notice justify-between items-center" role="status">
          <span>已移除「{removed.item.text}」</span>
          <button type="button" className="tl-btn tl-btn-secondary !min-h-[40px] !px-3 text-sm shrink-0" onClick={undoRemove}>復原</button>
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm tl-muted text-center mt-6">先寫下一件事，再替它選「今天必做」「可以晚點」或「今天先放下」。</p>
      )}

      {unsorted.length > 0 && (
        <section className="mt-5">
          <h2 className="font-bold text-warmgray-800 mb-2">尚未分類：{unsorted.length}</h2>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">{unsorted.map(renderItem)}</ul>
        </section>
      )}

      {priorities.map((p) => {
        const g = grouped(p.key);
        if (g.length === 0) return null;
        return (
          <section key={p.key} className="mt-5">
            <h2 className="font-bold text-warmgray-800 mb-0.5" style={{ borderLeft: `6px solid ${p.color}`, paddingLeft: 10 }}>{p.label}：{g.length}</h2>
            <p className="text-sm tl-muted mb-2 pl-4">{p.desc}</p>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">{g.map(renderItem)}</ul>
          </section>
        );
      })}

      {items.length > 0 && (
        <div className="flex flex-col gap-2.5 mt-6">
          <button type="button" className="tl-btn tl-btn-primary w-full" onClick={() => { track('tool_complete', { tool_id: 'priority' }); setDone(true); }}>
            完成整理
          </button>
          {unsorted.length > 0 && <p className="text-sm tl-muted text-center">還有 {unsorted.length} 項未分類，完成時會列在「尚未分類」。</p>}
          <button type="button" className="tl-btn tl-btn-ghost w-full" onClick={restart}>重新開始</button>
        </div>
      )}

      <div className="mt-5">
        <Notice>此頁不提供跨裝置保存，請複製保存。</Notice>
      </div>
    </div>
  );
}
