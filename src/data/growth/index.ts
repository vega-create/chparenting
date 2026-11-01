// 兒童生長曲線計算：WHO LMS 法。
// 0–5 歲用 WHO Child Growth Standards（逐日表，見 who-standards-0-5.ts），
// 5–19 歲用 WHO Growth Reference 2007（逐月表，見 who-reference-2007.ts）。
// z = ((y/M)^L − 1) / (L·S)（L≠0）或 ln(y/M)/S（L=0）；百分位 = 標準常態累積機率。
// 體重與 BMI 在 |z| > 3 時依 WHO 的「restricted」作法以 SD2／SD3 距離線性延伸，與 WHO Anthro 一致。

import { lengthForAge, weightForAge, headForAge, type LmsRow } from './who-standards-0-5';
import { heightForAge2007, weightForAge2007, bmiForAge2007 } from './who-reference-2007';

export type Sex = 'boys' | 'girls';
export type Measure = 'height' | 'weight' | 'head' | 'bmi';

export const DAYS_PER_MONTH = 30.4375;
export const MAX_AGE_DAYS = Math.round(228 * DAYS_PER_MONTH); // 19 歲
const DAYS_0_5 = 1856; // WHO 0–5 歲標準最後一天（60 個月）

export interface Lms { L: number; M: number; S: number }

/** 在表內以相鄰兩列線性內插 L／M／S；超出範圍回 null（差距在 tol 內則貼齊表的兩端，處理天→月換算的小數誤差）。 */
function interp(rows: LmsRow[], age: number, tol = 0): Lms | null {
  const first = rows[0], last = rows[rows.length - 1];
  if (age < first[0] - tol || age > last[0] + tol) return null;
  age = Math.min(Math.max(age, first[0]), last[0]);
  // 二分搜尋最後一個 age <= 目標的列
  let lo = 0, hi = rows.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (rows[mid][0] <= age) lo = mid; else hi = mid - 1;
  }
  const a = rows[lo];
  if (a[0] === age || lo === rows.length - 1) return { L: a[1], M: a[2], S: a[3] };
  const b = rows[lo + 1];
  const t = (age - a[0]) / (b[0] - a[0]);
  return { L: a[1] + (b[1] - a[1]) * t, M: a[2] + (b[2] - a[2]) * t, S: a[3] + (b[3] - a[3]) * t };
}

/** 依測量項目、性別與年齡（天）取得 LMS；該年齡沒有參考值時回 null。 */
export function lmsFor(measure: Measure, sex: Sex, ageDays: number): Lms | null {
  if (!Number.isFinite(ageDays) || ageDays < 0 || ageDays > MAX_AGE_DAYS) return null;
  // 0–5 歲標準到第 1856 天，2007 參考值從第 61 個月（1856.7 天）起；
  // 天→月換算有小數誤差，表的兩端允許 0.05 個月（約 1.5 天）的容差並貼齊。
  const months = ageDays / DAYS_PER_MONTH;
  const TOL = 0.05;
  switch (measure) {
    case 'height':
      return ageDays <= DAYS_0_5 ? interp(lengthForAge[sex], ageDays) : interp(heightForAge2007[sex], months, TOL);
    case 'weight':
      return ageDays <= DAYS_0_5 ? interp(weightForAge[sex], ageDays) : interp(weightForAge2007[sex], months, TOL);
    case 'head':
      return ageDays <= DAYS_0_5 ? interp(headForAge[sex], ageDays) : null;
    case 'bmi':
      return ageDays > DAYS_0_5 ? interp(bmiForAge2007[sex], months, TOL) : null;
  }
}

/** 由 z 值反推測量值（畫百分位曲線用）。 */
export function valueAtZ({ L, M, S }: Lms, z: number): number {
  return Math.abs(L) < 1e-9 ? M * Math.exp(S * z) : M * Math.pow(1 + L * S * z, 1 / L);
}

function rawZ({ L, M, S }: Lms, y: number): number {
  return Math.abs(L) < 1e-9 ? Math.log(y / M) / S : (Math.pow(y / M, L) - 1) / (L * S);
}

/** 計算 z-score。體重／BMI 超過 ±3 時依 WHO restricted 作法延伸。 */
export function zScore(measure: Measure, lms: Lms, y: number): number {
  const z = rawZ(lms, y);
  if (measure === 'weight' || measure === 'bmi') {
    if (z > 3) {
      const sd3 = valueAtZ(lms, 3), sd2 = valueAtZ(lms, 2);
      return 3 + (y - sd3) / (sd3 - sd2);
    }
    if (z < -3) {
      const sd3 = valueAtZ(lms, -3), sd2 = valueAtZ(lms, -2);
      return -3 + (y - sd3) / (sd2 - sd3);
    }
  }
  return z;
}

/** 標準常態累積機率（Abramowitz & Stegun 7.1.26，誤差 < 1.5e-7）。 */
export function normalCdf(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const poly = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  const erf = 1 - poly * Math.exp(-x * x);
  return 0.5 * (1 + (z < 0 ? -erf : erf));
}

/** 百分位對應的 z 值（畫曲線用）。 */
export const PERCENTILE_Z: Record<3 | 15 | 50 | 85 | 97, number> = {
  3: -1.8808, 15: -1.0364, 50: 0, 85: 1.0364, 97: 1.8808,
};

export interface Result {
  measure: Measure;
  value: number;
  z: number;
  percentile: number; // 0–100
}

export function assess(measure: Measure, sex: Sex, ageDays: number, value: number): Result | null {
  const lms = lmsFor(measure, sex, ageDays);
  if (!lms || !(value > 0)) return null;
  const z = zScore(measure, lms, value);
  return { measure, value, z, percentile: normalCdf(z) * 100 };
}

/** 顯示用的百分位文字：小於 1 顯示「<1」，大於 99 顯示「>99」。 */
export function formatPercentile(p: number): string {
  if (p < 1) return '<1';
  if (p > 99) return '>99';
  return String(Math.round(p));
}

/** 產生某百分位曲線的點（年齡以「天」為單位，間隔 stepDays）。 */
export function curvePoints(measure: Measure, sex: Sex, fromDays: number, toDays: number, z: number, stepDays: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let d = fromDays; d <= toDays + 1e-9; d += stepDays) {
    const lms = lmsFor(measure, sex, Math.min(d, toDays));
    if (lms) pts.push([Math.min(d, toDays), valueAtZ(lms, z)]);
  }
  return pts;
}
