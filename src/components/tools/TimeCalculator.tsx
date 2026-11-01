import { useState } from 'react';
import { Notice } from './ui';

// 一律用「分鐘」整數計算，避免 0.1+0.2 之類的浮點誤差；顯示時再換回小時。
const DAY_MIN = 24 * 60;
const STEP_MIN = 15;

const activities = [
  { id: 'sleep', name: '睡眠', defaultH: 6 },
  { id: 'work', name: '上班／工作', defaultH: 8 },
  { id: 'commute', name: '通勤', defaultH: 1 },
  { id: 'cooking', name: '煮飯／準備食物', defaultH: 1.5 },
  { id: 'cleaning', name: '打掃／家務', defaultH: 1 },
  { id: 'childcare', name: '照顧孩子', defaultH: 3 },
  { id: 'homework', name: '陪寫功課', defaultH: 0.5 },
  { id: 'bath', name: '洗澡／盥洗', defaultH: 0.5 },
  { id: 'errands', name: '採購／雜事', defaultH: 0.5 },
];

type Field = { raw: string; error: string | null }; // raw 是輸入框文字；空白＝待填

const defaults = (): Record<string, Field> =>
  Object.fromEntries(activities.map((a) => [a.id, { raw: String(a.defaultH), error: null }]));

// 解析輸入：回傳分鐘或錯誤。接受 0–24、最多兩位小數。
function parse(raw: string): { minutes: number | null; error: string | null } {
  const s = raw.trim();
  if (s === '') return { minutes: null, error: null };
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return { minutes: null, error: '請輸入 0 到 24 之間的數字，最多兩位小數' };
  const h = Number(s);
  if (h < 0) return { minutes: null, error: '不能是負數' };
  if (h > 24) return { minutes: null, error: '一天最多 24 小時' };
  return { minutes: Math.round(h * 60), error: null };
}

const toHours = (min: number) => (min / 60).toFixed(2).replace(/\.?0+$/, '');
const fmtDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} 分鐘`;
  return m === 0 ? `${h} 小時` : `${h} 小時 ${m} 分鐘`;
};

export default function TimeCalculator() {
  const [fields, setFields] = useState<Record<string, Field>>(defaults);

  const set = (id: string, raw: string) => {
    const { error } = parse(raw);
    setFields((f) => ({ ...f, [id]: { raw, error } }));
  };

  const nudge = (id: string, dir: 1 | -1) => {
    const { minutes } = parse(fields[id].raw);
    const base = minutes ?? 0;
    const next = Math.min(DAY_MIN, Math.max(0, base + dir * STEP_MIN));
    set(id, toHours(next));
  };

  const parsed = activities.map((a) => ({ a, ...parse(fields[a.id].raw) }));
  const hasError = parsed.some((p) => p.error);
  const pending = parsed.filter((p) => p.minutes === null && !p.error).map((p) => p.a.name);
  const complete = !hasError && pending.length === 0;
  const totalMin = parsed.reduce((s, p) => s + (p.minutes ?? 0), 0);
  const over = totalMin > DAY_MIN;
  const freeMin = Math.max(0, DAY_MIN - totalMin);
  const usedPct = Math.min(100, Math.round((totalMin / DAY_MIN) * 100));

  return (
    <div className="max-w-md mx-auto">
      <Notice>同時進行的活動，請勿重複計算。例如：陪孩子時煮飯，這段時間只計一次。</Notice>

      <ul className="list-none p-0 m-0 mt-5 flex flex-col gap-3">
        {activities.map((a) => {
          const f = fields[a.id];
          const isPending = f.raw.trim() === '';
          return (
            <li key={a.id} className="rounded-2xl bg-white px-4 py-3" style={{ border: '1.5px solid #E8DFD5' }}>
              <div className="flex items-center gap-2">
                <label htmlFor={`tc-${a.id}`} className="flex-1 text-[15px] text-warmgray-800 min-w-0">{a.name}</label>
                <button type="button" className="tl-btn tl-btn-secondary !min-h-[44px] !px-0 w-11 shrink-0" aria-label={`${a.name}減少 15 分鐘`} onClick={() => nudge(a.id, -1)}>－</button>
                <input
                  id={`tc-${a.id}`}
                  type="text"
                  inputMode="decimal"
                  value={f.raw}
                  onChange={(e) => set(a.id, e.target.value)}
                  aria-invalid={!!f.error}
                  aria-describedby={f.error ? `tc-${a.id}-err` : undefined}
                  className="w-[72px] h-11 rounded-xl text-center text-[15px] font-bold text-warmgray-800 outline-none tl-focus"
                  style={{ border: `1.5px solid ${f.error ? '#C0582F' : '#E8DFD5'}` }}
                />
                <button type="button" className="tl-btn tl-btn-secondary !min-h-[44px] !px-0 w-11 shrink-0" aria-label={`${a.name}增加 15 分鐘`} onClick={() => nudge(a.id, 1)}>＋</button>
                <span className="text-sm tl-muted shrink-0">小時</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="0.25"
                value={parse(f.raw).minutes != null ? parse(f.raw).minutes! / 60 : 0}
                onChange={(e) => set(a.id, e.target.value)}
                aria-label={`${a.name}（滑桿）`}
                className="w-full mt-2"
                style={{ accentColor: '#8BA888' }}
              />
              {f.error && <p id={`tc-${a.id}-err`} className="text-sm mt-1" style={{ color: '#C0582F' }}>{f.error}</p>}
              {isPending && !f.error && <p className="text-sm tl-muted mt-1">待填</p>}
            </li>
          );
        })}
      </ul>

      <div className="flex justify-end mt-3">
        <button type="button" className="tl-btn tl-btn-ghost text-sm" onClick={() => setFields(defaults())}>恢復預設</button>
      </div>

      <section className="mt-5 rounded-2xl p-5" style={{ background: '#FAF6F1', border: '1px solid #E8DFD5' }} aria-live="polite">
        <h2 className="font-bold text-warmgray-800">目前合計</h2>
        <p className="mt-1">
          <span className="text-[40px] leading-none font-bold" style={{ color: over ? '#C0582F' : '#4A3E34' }}>{toHours(totalMin)}</span>
          <span className="ml-1 tl-muted">小時</span>
        </p>

        {!complete && (
          <p className="text-sm tl-muted mt-2">
            {hasError ? '有欄位輸入有誤，修正後才會計算結果。' : `還有「${pending.join('、')}」待填，填好後才會計算結果。`}
          </p>
        )}

        {complete && over && (
          <div className="mt-3">
            <Notice tone="warn">
              目前合計 {fmtDuration(totalMin)}，超過一天 {fmtDuration(totalMin - DAY_MIN)}。先檢查是否有重複計時。
            </Notice>
          </div>
        )}

        {complete && !over && (
          <>
            <div className="mt-3">
              <p className="text-[15px] text-warmgray-800">尚未安排的時間：<strong>{fmtDuration(freeMin)}</strong></p>
              <div className="tl-progress mt-2" role="img" aria-label={`已安排 ${usedPct}%`}>
                <span style={{ width: `${usedPct}%` }} />
              </div>
              <div className="flex justify-between text-sm tl-muted mt-1">
                <span>已安排 {usedPct}%</span>
                <span>尚未安排 {100 - usedPct}%</span>
              </div>
            </div>
            <p className="text-sm tl-muted mt-3">這是粗略整理，不代表你真的有完整空檔；但看見數字，是重新安排的第一步。</p>
          </>
        )}
      </section>
    </div>
  );
}
