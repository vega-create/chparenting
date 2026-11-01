import { useEffect, useMemo, useState } from 'react';
import { CopyButton, Notice, track } from './ui';
import {
  assess, formatPercentile, curvePoints, lmsFor, PERCENTILE_Z, DAYS_PER_MONTH, MAX_AGE_DAYS,
  type Sex, type Measure, type Result,
} from '../../data/growth';

// 兒童生長曲線百分位計算器：輸入性別、年齡、身高、體重（頭圍選填），
// 依 WHO 標準算 z-score 與百分位。只顯示位置與中性說明，不做診斷。

const TOOL_ID = 'growth-chart';
const DAYS_0_5 = 1856;
const DAYS_10Y = Math.round(120 * DAYS_PER_MONTH);

type AgeMode = 'date' | 'months';

const measureLabel: Record<Measure, string> = { height: '身高', weight: '體重', head: '頭圍', bmi: 'BMI' };
const measureUnit: Record<Measure, string> = { height: 'cm', weight: 'kg', head: 'cm', bmi: '' };
// 「約有 X% 的同齡孩子比他…」
const lowerWord: Record<Measure, string> = { height: '矮', weight: '輕', head: '的頭圍小', bmi: '的 BMI 低' };

const pad2 = (n: number) => String(n).padStart(2, '0');
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const parseIso = (s: string): number | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(t);
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
  return t;
};
const parseNum = (s: string): number | null => {
  const t = s.trim();
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
};

/** 兩個日期間的「年／月／日」（依曆法，不是除以 30.4375）。 */
function calendarAge(birth: number, measured: number) {
  const b = new Date(birth), m = new Date(measured);
  let years = m.getUTCFullYear() - b.getUTCFullYear();
  let months = m.getUTCMonth() - b.getUTCMonth();
  let days = m.getUTCDate() - b.getUTCDate();
  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), 0)).getUTCDate();
    days += prevMonthDays;
  }
  if (months < 0) { years -= 1; months += 12; }
  return { years, months, days };
}

function ageText(a: { years: number; months: number; days?: number }) {
  const parts: string[] = [];
  if (a.years > 0) parts.push(`${a.years} 歲`);
  if (a.months > 0 || a.years === 0) parts.push(`${a.months} 個月`);
  if (a.years === 0 && a.months < 3 && a.days != null) parts.push(`${a.days} 天`);
  return parts.join(' ');
}

interface Computed {
  sex: Sex;
  ageDays: number;
  ageLabel: string;
  results: Result[];
  notes: string[];
}

const fmtZ = (z: number) => `${z >= 0 ? '+' : '−'}${Math.abs(z).toFixed(2)}`;
const fmtVal = (r: Result) => (r.measure === 'bmi' ? r.value.toFixed(1) : `${r.value.toFixed(1)} ${measureUnit[r.measure]}`);

function sentence(r: Result, sex: Sex): string {
  const he = sex === 'boys' ? '他' : '她';
  const p = r.percentile;
  const word = lowerWord[r.measure];
  if (p < 1) return `在同齡同性別的孩子中，不到 1% 比${he}${word}。`;
  if (p > 99) return `在同齡同性別的孩子中，超過 99% 比${he}${word}。`;
  return `在同齡同性別的孩子中，約有 ${Math.round(p)}% 比${he}${word}。`;
}

export default function GrowthChart() {
  const [sex, setSex] = useState<Sex | null>(null);
  const [ageMode, setAgeMode] = useState<AgeMode>('date');
  const [birth, setBirth] = useState('');
  const [measured, setMeasured] = useState('');
  const [months, setMonths] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [head, setHead] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [computed, setComputed] = useState<Computed | null>(null);
  const [started, setStarted] = useState(false);

  // 測量日期預設今天；放在 effect 裡避免 SSR 與瀏覽器日期不一致
  useEffect(() => { setMeasured((m) => m || todayIso()); }, []);

  const touch = () => {
    if (!started) { setStarted(true); track('tool_start', { tool_id: TOOL_ID }); }
  };

  const submit = () => {
    const errs: Record<string, string> = {};
    let ageDays = 0;
    let ageLabel = '';

    if (!sex) errs.sex = '請選擇性別。';

    if (ageMode === 'date') {
      const b = parseIso(birth), m = parseIso(measured);
      if (b == null) errs.birth = '請輸入出生日期。';
      if (m == null) errs.measured = '請輸入測量日期。';
      if (b != null && m != null) {
        ageDays = Math.round((m - b) / 86400000);
        if (ageDays < 0) errs.birth = '出生日期不能晚於測量日期。';
        else if (ageDays > MAX_AGE_DAYS) errs.birth = '本工具適用 0 到 19 歲。';
        else {
          const a = calendarAge(b, m);
          ageLabel = ageText(a);
        }
      }
    } else {
      const mo = parseNum(months);
      if (mo == null) errs.months = '請輸入月齡，例如 18 或 18.5。';
      else if (mo > 228) errs.months = '本工具適用 0 到 19 歲（228 個月）。';
      else {
        ageDays = Math.round(mo * DAYS_PER_MONTH);
        const whole = Math.floor(mo);
        ageLabel = ageText({ years: Math.floor(whole / 12), months: whole % 12 });
      }
    }

    const h = parseNum(height), w = parseNum(weight), hc = head.trim() === '' ? undefined : parseNum(head);
    if (h == null || h < 20 || h > 250) errs.height = '請輸入 20 到 250 之間的身高（公分）。';
    if (w == null || w < 0.5 || w > 200) errs.weight = '請輸入 0.5 到 200 之間的體重（公斤）。';
    if (hc === null || (hc != null && (hc < 20 || hc > 70))) errs.head = '頭圍請輸入 20 到 70 之間的數字（公分），或留空。';

    setErrors(errs);
    if (Object.keys(errs).length > 0 || !sex || h == null || w == null) { setComputed(null); return; }

    const results: Result[] = [];
    const notes: string[] = [];
    const rh = assess('height', sex, ageDays, h);
    if (rh) results.push(rh);
    const rw = assess('weight', sex, ageDays, w);
    if (rw) results.push(rw);
    else if (ageDays > DAYS_10Y) notes.push('WHO 對 10 歲以上沒有「體重對年齡」的參考值，這個年齡改用 BMI 看體重與身高是否相稱。');
    if (ageDays > DAYS_0_5) {
      const bmi = w / ((h / 100) ** 2);
      const rb = assess('bmi', sex, ageDays, bmi);
      if (rb) results.push(rb);
    }
    if (hc != null) {
      const rc = assess('head', sex, ageDays, hc);
      if (rc) results.push(rc);
      else notes.push('WHO 頭圍標準只到 5 歲，這個年齡不計算頭圍百分位。');
    }
    setComputed({ sex, ageDays, ageLabel, results, notes });
    track('tool_complete', { tool_id: TOOL_ID });
  };

  const copyText = useMemo(() => {
    if (!computed) return '';
    const lines = [
      '兒童生長曲線百分位（WHO 標準）',
      `${computed.sex === 'boys' ? '男孩' : '女孩'}，${computed.ageLabel}`,
      ...computed.results.map((r) => `${measureLabel[r.measure]} ${fmtVal(r)}：第 ${formatPercentile(r.percentile)} 百分位（z ${fmtZ(r.z)}）`),
      '計算：薇佳媽媽 chparenting.com/tools/growth-chart/',
    ];
    return lines.join('\n');
  }, [computed]);

  const flagged = computed?.results.filter((r) => r.percentile < 3 || r.percentile > 97) ?? [];

  const field = (id: string, label: string, value: string, set: (v: string) => void, opts: { unit?: string; placeholder?: string; type?: string; hint?: string }) => (
    <div>
      <label htmlFor={`gc-${id}`} className="block text-[15px] font-medium text-warmgray-800 mb-1">{label}{opts.hint && <span className="tl-muted font-normal text-sm">（{opts.hint}）</span>}</label>
      <div className="flex items-center gap-2">
        <input
          id={`gc-${id}`}
          type={opts.type ?? 'text'}
          inputMode={opts.type ? undefined : 'decimal'}
          value={value}
          placeholder={opts.placeholder}
          onChange={(e) => { touch(); set(e.target.value); }}
          aria-invalid={!!errors[id]}
          aria-describedby={errors[id] ? `gc-${id}-err` : undefined}
          max={opts.type === 'date' ? '2100-12-31' : undefined}
          min={opts.type === 'date' ? '1990-01-01' : undefined}
          className="w-full h-12 rounded-xl px-3 text-[16px] text-warmgray-800 bg-white outline-none tl-focus"
          style={{ border: `1.5px solid ${errors[id] ? '#C0582F' : '#E8DFD5'}` }}
        />
        {opts.unit && <span className="text-sm tl-muted shrink-0 w-7">{opts.unit}</span>}
      </div>
      {errors[id] && <p id={`gc-${id}-err`} className="text-sm mt-1" style={{ color: '#C0582F' }}>{errors[id]}</p>}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-[15px] font-medium text-warmgray-800 mb-2">性別</legend>
          <div className="grid grid-cols-2 gap-3">
            {(['boys', 'girls'] as Sex[]).map((s) => (
              <button
                key={s}
                type="button"
                className="tl-option justify-center font-bold"
                aria-pressed={sex === s}
                onClick={() => { touch(); setSex(s); }}
              >
                {sex === s && <span aria-hidden="true" style={{ color: '#6E8E6A' }}>✓</span>}
                {s === 'boys' ? '男孩' : '女孩'}
              </button>
            ))}
          </div>
          {errors.sex && <p className="text-sm mt-1" style={{ color: '#C0582F' }}>{errors.sex}</p>}
        </fieldset>

        <fieldset className="border-0 p-0 m-0 mt-5">
          <legend className="text-[15px] font-medium text-warmgray-800 mb-2">年齡</legend>
          <div className="flex gap-2 mb-3" role="group" aria-label="年齡輸入方式">
            <button type="button" className="tl-option !min-h-[40px] !px-3 text-sm" aria-pressed={ageMode === 'date'} onClick={() => setAgeMode('date')}>用出生日期</button>
            <button type="button" className="tl-option !min-h-[40px] !px-3 text-sm" aria-pressed={ageMode === 'months'} onClick={() => setAgeMode('months')}>直接輸入月齡</button>
          </div>
          {ageMode === 'date' ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {field('birth', '出生日期', birth, setBirth, { type: 'date' })}
              {field('measured', '測量日期', measured, setMeasured, { type: 'date' })}
            </div>
          ) : (
            field('months', '月齡', months, setMonths, { unit: '個月', placeholder: '例如 18 或 18.5', hint: '1 歲＝12 個月' })
          )}
        </fieldset>

        <div className="grid sm:grid-cols-3 gap-3 mt-5">
          {field('height', '身高', height, setHeight, { unit: 'cm', placeholder: '例如 85.5' })}
          {field('weight', '體重', weight, setWeight, { unit: 'kg', placeholder: '例如 11.2' })}
          {field('head', '頭圍', head, setHead, { unit: 'cm', placeholder: '選填', hint: '5 歲以下' })}
        </div>

        <button type="submit" className="tl-btn tl-btn-primary w-full mt-6">計算百分位</button>
      </form>

      {computed && (
        <section className="mt-6" aria-live="polite" aria-label="計算結果">
          <h2 className="font-bold text-warmgray-800 text-lg">
            {computed.sex === 'boys' ? '男孩' : '女孩'}，{computed.ageLabel}
          </h2>
          <ul className="list-none p-0 m-0 mt-3 flex flex-col gap-3">
            {computed.results.map((r) => (
              <li key={r.measure} className="rounded-2xl p-4" style={{ background: '#FAF6F1', border: '1px solid #E8DFD5' }}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[15px] tl-muted">{measureLabel[r.measure]} {fmtVal(r)}</span>
                  <span className="text-[26px] leading-none font-bold" style={{ color: '#4A3E34' }}>第 {formatPercentile(r.percentile)} 百分位</span>
                  <span className="text-sm tl-muted">z {fmtZ(r.z)}</span>
                </div>
                <p className="text-[15px] text-warmgray-800 mt-2">{sentence(r, computed.sex)}</p>
              </li>
            ))}
          </ul>

          {flagged.length > 0 && (
            <div className="mt-3">
              <Notice tone="warn">
                「{flagged.map((r) => measureLabel[r.measure]).join('、')}」落在第 3 百分位以下或第 97 百分位以上。單次測量不代表有問題，但可以帶著兒童健康手冊，在下次健檢時與兒科醫師討論。
              </Notice>
            </div>
          )}
          {computed.notes.map((n) => <div key={n} className="mt-3"><Notice>{n}</Notice></div>)}

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            {computed.results.filter((r) => r.measure !== 'head').slice(0, 2).map((r) => (
              <Curve key={r.measure} sex={computed.sex} ageDays={computed.ageDays} result={r} />
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <CopyButton text={copyText} label="複製結果" toolId={TOOL_ID} />
          </div>
          <p className="text-sm tl-muted mt-3">百分位只是孩子在同齡孩子中的位置，不是分數，也不是診斷。穩定沿著自己的曲線成長，比落在哪一條線更重要。</p>
        </section>
      )}
    </div>
  );
}

/* ── SVG 百分位曲線（3／15／50／85／97）與孩子的點 ── */

const CURVE_PS = [3, 15, 50, 85, 97] as const;

function windowFor(measure: Measure, ageDays: number): { from: number; to: number; ticks: { d: number; label: string }[]; xLabel: string } {
  if (ageDays <= 730) {
    return { from: 0, to: 730, ticks: [0, 6, 12, 18, 24].map((m) => ({ d: m * DAYS_PER_MONTH, label: String(m) })), xLabel: '月齡' };
  }
  if (ageDays <= DAYS_0_5) {
    return { from: 731, to: DAYS_0_5, ticks: [24, 36, 48, 60].map((m) => ({ d: Math.min(m * DAYS_PER_MONTH, DAYS_0_5), label: String(m) })), xLabel: '月齡' };
  }
  const toMonths = measure === 'weight' ? 120 : 228;
  const years = measure === 'weight' ? [5, 6, 7, 8, 9, 10] : [5, 7, 9, 11, 13, 15, 17, 19];
  return { from: 61 * DAYS_PER_MONTH, to: toMonths * DAYS_PER_MONTH, ticks: years.map((y) => ({ d: Math.max(61, y * 12) * DAYS_PER_MONTH, label: String(y) })), xLabel: '歲' };
}

function Curve({ sex, ageDays, result }: { sex: Sex; ageDays: number; result: Result }) {
  const { measure } = result;
  const W = 320, H = 210, padL = 38, padR = 30, padT = 12, padB = 26;
  const win = windowFor(measure, ageDays);
  const step = (win.to - win.from) / 40;
  const curves = CURVE_PS.map((p) => ({ p, pts: curvePoints(measure, sex, win.from, win.to, PERCENTILE_Z[p], step) }));
  if (curves.some((c) => c.pts.length < 2) || !lmsFor(measure, sex, ageDays)) return null;

  const ys = curves.flatMap((c) => c.pts.map((pt) => pt[1])).concat(result.value);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const span = Math.max(yMax - yMin, 1);
  const y0 = yMin - span * 0.08, y1 = yMax + span * 0.08;
  const sx = (d: number) => padL + ((d - win.from) / (win.to - win.from)) * (W - padL - padR);
  const sy = (v: number) => padT + (1 - (v - y0) / (y1 - y0)) * (H - padT - padB);
  const path = (pts: [number, number][]) => pts.map((pt, i) => `${i ? 'L' : 'M'}${sx(pt[0]).toFixed(1)},${sy(pt[1]).toFixed(1)}`).join(' ');

  // y 軸刻度：取 4 個整數刻度
  const rawStep = (y1 - y0) / 4;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const tickStep = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= rawStep) ?? mag * 10;
  const yTicks: number[] = [];
  for (let v = Math.ceil(y0 / tickStep) * tickStep; v <= y1; v += tickStep) yTicks.push(v);

  const unit = measure === 'bmi' ? '' : ` ${measureUnit[measure]}`;
  const label = `${measureLabel[measure]}生長曲線：${sex === 'boys' ? '男孩' : '女孩'}第 3、15、50、85、97 百分位曲線，孩子的點在第 ${formatPercentile(result.percentile)} 百分位`;

  return (
    <figure className="m-0">
      <figcaption className="text-sm font-medium text-warmgray-800 mb-1">{measureLabel[measure]}曲線（{sex === 'boys' ? '男孩' : '女孩'}）</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="w-full h-auto rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #E8DFD5' }}>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke="#EDE5DB" strokeWidth="1" />
            <text x={padL - 4} y={sy(v) + 3} fontSize="9" textAnchor="end" fill="#716256">{Number.isInteger(tickStep) ? v : v.toFixed(1)}</text>
          </g>
        ))}
        {win.ticks.map((t) => (
          <g key={t.label}>
            <line x1={sx(t.d)} x2={sx(t.d)} y1={padT} y2={H - padB} stroke="#F3EDE6" strokeWidth="1" />
            <text x={sx(t.d)} y={H - padB + 11} fontSize="9" textAnchor="middle" fill="#716256">{t.label}</text>
          </g>
        ))}
        <text x={W - padR} y={H - 3} fontSize="9" textAnchor="end" fill="#716256">{win.xLabel}</text>
        <text x={padL - 4} y={9} fontSize="9" textAnchor="end" fill="#716256">{unit.trim() || 'BMI'}</text>
        {curves.map((c) => (
          <g key={c.p}>
            <path d={path(c.pts)} fill="none" stroke={c.p === 50 ? '#6E8E6A' : '#B5C9B2'} strokeWidth={c.p === 50 ? 1.8 : 1.2} />
            <text x={W - padR + 9} y={sy(c.pts[c.pts.length - 1][1]) + 3} fontSize="8.5" fill="#716256">{c.p}</text>
          </g>
        ))}
        <circle cx={sx(Math.min(Math.max(ageDays, win.from), win.to))} cy={sy(result.value)} r="5" fill="#E8A87C" stroke="#3A2E24" strokeWidth="1.5" />
      </svg>
    </figure>
  );
}
