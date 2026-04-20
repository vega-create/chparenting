import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../site.config';

export const GET: APIRoute = async () => {
  const origin = 'https://chparenting.com';
  const now = new Date();
  const posts = (await getCollection('posts', ({ data }) => !data.draft && new Date(data.publishDate) <= now))
    .sort((a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime());

  const lines: string[] = [];
  lines.push(`# ${siteConfig.name}（${siteConfig.nameEn}）`);
  lines.push('');
  lines.push(`> ${siteConfig.description}`);
  lines.push('');
  lines.push('chparenting.com 是台灣媽媽的舒壓與支持平台，提供喘息工具（呼吸練習、正能量卡片、壓力測驗、白噪音、崩潰語錄、心情日記）、媽媽心聲文章、以及實用的情緒支持資源。內容由 薇佳媽咪 撰寫，關注點是幫助媽媽在育兒壓力下找回自己。');
  lines.push('');
  lines.push('## 主要分類');
  lines.push('');
  lines.push(`- [文章](${origin}/blog/): 所有媽媽心聲、育兒心得、舒壓筆記`);
  lines.push(`- [喘息工具](${origin}/tools/): 線上舒壓小工具（呼吸練習、正能量卡片、心情日記等）`);
  lines.push(`- [壓力測驗](${origin}/quiz/): 互動式測驗`);
  lines.push(`- [分類總覽](${origin}/category/): 依類別瀏覽`);
  lines.push('');
  lines.push('## 主要頁面');
  lines.push('');
  lines.push(`- [首頁](${origin}/): 平台總覽、最新文章、舒壓工具`);
  lines.push(`- [關於](${origin}/about/): 關於薇佳媽咪與這個平台`);
  lines.push(`- [隱私權](${origin}/privacy/)`);
  lines.push('');

  const recent = posts.slice(0, 10);
  if (recent.length > 0) {
    lines.push('## 最新文章');
    lines.push('');
    for (const post of recent) {
      const cat = post.data.category ? ` [${post.data.category}]` : '';
      const date = ` — ${new Date(post.data.publishDate).toISOString().slice(0, 10)}`;
      lines.push(`- [${post.data.title}](${origin}/posts/${post.slug}/)${cat}${date}`);
    }
    lines.push('');
  }

  lines.push('## Optional');
  lines.push('');
  lines.push(`- [Sitemap](${origin}/sitemap-index.xml): 完整頁面清單`);
  lines.push(`- [全文索引](${origin}/llms-full.txt): 所有文章的 markdown 全文`);

  return new Response(lines.join('\n') + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
