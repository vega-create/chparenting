#!/usr/bin/env node
// 部署後把「剛上線／剛更新」的頁面提交給 IndexNow（Bing / Yahoo / DuckDuckGo 共用索引）。
//
// 主站的文章是排程式的：publishDate 到了、每天 08:30 的建置把它放進 dist。
// 沒有 commit 可以 diff，所以用 publishDate 判斷：最近 INDEXNOW_DAYS 天內
// 上線（publishDate <= 今天）的文章，加上首頁與文章列表頁。
// 若是 push 觸發且抓得到上一個 commit，改到的文章也一併提交。
// 失敗只印訊息不擋部署（workflow 用 continue-on-error）。
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "chparenting.com";
const KEY = "eaba7a414a18bb24b472bd8618967eae"; // public/<KEY>.txt 已上線
const DAYS = Number(process.env.INDEXNOW_DAYS || 3);
const DRY = process.argv.includes("--dry-run");
const POSTS = path.join(ROOT, "src/content/posts");

const tz = (d) => new Date(d.getTime() + 8 * 3600e3); // 以台灣日期為準
const todayISO = tz(new Date()).toISOString().slice(0, 10);
const sinceISO = tz(new Date(Date.now() - DAYS * 86400e3)).toISOString().slice(0, 10);

const postUrl = (file) => `https://${HOST}/posts/${encodeURIComponent(path.basename(file, ".md"))}/`;
const urls = new Set([`https://${HOST}/`, `https://${HOST}/blog/`, `https://${HOST}/category/kids-learning/`]);

for (const f of fs.readdirSync(POSTS).filter((x) => x.endsWith(".md"))) {
  const fm = fs.readFileSync(path.join(POSTS, f), "utf8").split("---")[1] || "";
  if (/^draft:\s*true/m.test(fm)) continue;
  const m = fm.match(/^publishDate:\s*(\d{4}-\d{2}-\d{2})/m);
  if (m && m[1] >= sinceISO && m[1] <= todayISO) urls.add(postUrl(f));
}
try {
  const changed = execSync("git diff --name-only HEAD~1 HEAD -- src/content/posts", { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
    .split("\n").filter((x) => x.endsWith(".md") && fs.existsSync(path.join(ROOT, x)));
  for (const x of changed) {
    const fm = fs.readFileSync(path.join(ROOT, x), "utf8").split("---")[1] || "";
    const m = fm.match(/^publishDate:\s*(\d{4}-\d{2}-\d{2})/m);
    if (m && m[1] <= todayISO) urls.add(postUrl(x)); // 未來日期的文章還沒上線，不提交
  }
} catch { /* 淺層 clone 或首次 commit：略過 */ }
for (const u of (process.env.INDEXNOW_URLS || "").split(",").map((s) => s.trim()).filter(Boolean)) urls.add(u);

const urlList = [...urls].slice(0, 10000);
console.log(`[indexnow] 準備提交 ${urlList.length} 個網址（publishDate ${sinceISO}～${todayISO}）：`);
urlList.forEach((u) => console.log("  " + decodeURIComponent(u)));
if (DRY) process.exit(0);
try {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
  });
  console.log(`[indexnow] HTTP ${res.status} ${res.statusText}`);
  if (res.status !== 200 && res.status !== 202) console.log(await res.text());
} catch (e) { console.log("[indexnow] 提交失敗（不影響部署）：", e.message); }
