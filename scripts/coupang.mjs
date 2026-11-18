#!/usr/bin/env node
/**
 * 酷澎分潤（Coupang Partners TW）Open API 小工具
 *
 * 用法（在 repo 根目錄）：
 *   node scripts/coupang.mjs search "兒童學習褲" [--limit 8] [--yaml]
 *   node scripts/coupang.mjs deeplink "https://www.tw.coupang.com/vp/products/123" [...更多網址]
 *   node scripts/coupang.mjs plan scripts/coupang-plan.json        # 依計畫檔逐篇列出候選商品
 *
 * 金鑰放在 repo 根目錄的 .env（已 gitignore）：
 *   COUPANG_ACCESS_KEY=...
 *   COUPANG_SECRET_KEY=...
 * 金鑰從 partners.tw.coupang.com → 工具 → Partners API →「生成」取得（只有最終核准會員能生成）。
 *
 * 簽名規則（官方文件 #help/open-api）：
 *   message   = signedDate(yyMMdd'T'HHmmss'Z', GMT) + METHOD + path + query(不含 ?)
 *   signature = HMAC-SHA256(secretKey, message) → hex
 *   Authorization: CEA algorithm=HmacSHA256, access-key=..., signed-date=..., signature=...
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DOMAIN = 'https://api-gateway.tw.coupang.com';
const BASE = '/v2/providers/affiliate_open_api/apis/openapi/v1';

// 讀 .env（Node 20.12+ 內建）
try { process.loadEnvFile(path.resolve('.env')); } catch { /* 沒有 .env 就看環境變數 */ }
const ACCESS = process.env.COUPANG_ACCESS_KEY;
const SECRET = process.env.COUPANG_SECRET_KEY;

function signedDate() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${String(d.getUTCFullYear()).slice(2)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

function authorization(method, fullPath, query) {
  const dt = signedDate();
  const message = dt + method + fullPath + query;
  const signature = crypto.createHmac('sha256', SECRET).update(message, 'utf8').digest('hex');
  return `CEA algorithm=HmacSHA256, access-key=${ACCESS}, signed-date=${dt}, signature=${signature}`;
}

async function call(method, endpoint, { query = '', body } = {}) {
  if (!ACCESS || !SECRET) {
    console.error('缺少 COUPANG_ACCESS_KEY / COUPANG_SECRET_KEY（放在 .env）');
    process.exit(2);
  }
  const fullPath = BASE + endpoint;
  const url = DOMAIN + fullPath + (query ? `?${query}` : '');
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: authorization(method, fullPath, query),
      'Content-Type': 'application/json;charset=UTF-8',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error(`非 JSON 回應 (${res.status}): ${text.slice(0, 300)}`); }
  if (!res.ok || (json.rCode && json.rCode !== '0')) {
    throw new Error(`API 錯誤 (${res.status}): ${json.rMessage || json.message || text.slice(0, 300)}`);
  }
  return json;
}

export async function search(keyword, limit = 8) {
  const q = `keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
  const json = await call('GET', '/products/search', { query: q });
  const list = json.data?.productData ?? json.data ?? [];
  return list.map(normalize);
}

export async function deeplink(urls) {
  const json = await call('POST', '/deeplink', { body: { coupangUrls: urls } });
  return json.data ?? [];
}

function normalize(p) {
  return {
    id: p.productId,
    name: p.productName,
    price: p.productPrice,
    image: p.productImage,
    url: p.productUrl, // 搜尋結果已含分潤追蹤碼
    category: p.categoryName,
    rocket: !!p.isRocket,
  };
}

function toYaml(items) {
  const esc = (s) => String(s ?? '').replace(/"/g, '\\"');
  return items.map((p) =>
    `  - name: "${esc(p.name)}"\n    price: ${Number(p.price) || 0}\n    image: "${esc(p.image)}"\n    url: "${esc(p.url)}"`
  ).join('\n');
}

function printList(items) {
  items.forEach((p, i) => {
    console.log(`${String(i + 1).padStart(2)}. NT$${p.price}${p.rocket ? ' 🚀' : ''}  ${p.name}`);
    console.log(`    ${p.url}`);
  });
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const flags = Object.fromEntries(rest.filter((a) => a.startsWith('--')).map((a) => {
    const i = rest.indexOf(a);
    const v = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[i + 1] : true;
    return [a.slice(2), v];
  }));
  const args = rest.filter((a, i) => !a.startsWith('--') && !(rest[i - 1]?.startsWith('--') && rest[i - 1] !== '--yaml'));

  if (cmd === 'search') {
    const items = await search(args[0], Number(flags.limit) || 8);
    if (flags.yaml) console.log('products:\n' + toYaml(items));
    else printList(items);
  } else if (cmd === 'deeplink') {
    const out = await deeplink(args);
    out.forEach((d) => console.log(`${d.originalUrl}\n  → ${d.shortenUrl}`));
  } else if (cmd === 'plan') {
    const plan = JSON.parse(fs.readFileSync(args[0] || 'scripts/coupang-plan.json', 'utf8'));
    for (const a of plan.articles) {
      console.log(`\n===== ${a.file}`);
      for (const kw of a.keywords) {
        console.log(`--- 關鍵字：${kw}`);
        try { printList(await search(kw, Number(flags.limit) || 6)); }
        catch (e) { console.log('   ✗ ' + e.message); }
        await new Promise((r) => setTimeout(r, 1300)); // 每分鐘上限 50 次
      }
    }
  } else {
    console.log('用法：search <關鍵字> [--limit n] [--yaml] | deeplink <url...> | plan [plan.json]');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
