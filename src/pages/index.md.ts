import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../site.config';

export const GET: APIRoute = async () => {
  const origin = 'https://chparenting.com';
  const now = new Date();
  const posts = (await getCollection('posts', ({ data }) => !data.draft && new Date(data.publishDate) <= now))
    .sort((a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime())
    .slice(0, 5);

  const lines: string[] = [];
  lines.push(`# ${siteConfig.name}`);
  lines.push('');
  lines.push(`> ${siteConfig.description}`);
  lines.push('');
  lines.push(`Source: ${origin}/`);
  lines.push('');
  lines.push('這個平台為疲憊的媽媽提供喘息工具與心理支持：呼吸練習、正能量卡片、壓力測驗、白噪音、崩潰語錄、心情日記，以及 薇佳媽咪 撰寫的育兒心聲文章。');
  lines.push('');
  lines.push('## 主要入口');
  lines.push('');
  lines.push(`- **喘息工具** — ${origin}/tools/ — 呼吸、正能量卡、心情日記等`);
  lines.push(`- **文章** — ${origin}/blog/ — 媽媽心聲與育兒心得`);
  lines.push(`- **壓力測驗** — ${origin}/quiz/`);
  lines.push(`- **分類** — ${origin}/category/`);
  lines.push(`- **關於** — ${origin}/about/`);
  lines.push('');

  if (posts.length > 0) {
    lines.push('## 最新文章');
    lines.push('');
    for (const post of posts) {
      const cat = post.data.category ? ` [${post.data.category}]` : '';
      const date = ` — ${new Date(post.data.publishDate).toISOString().slice(0, 10)}`;
      lines.push(`- [${post.data.title}](${origin}/posts/${post.slug}/)${cat}${date}`);
    }
    lines.push('');
  }

  lines.push('## 機器可讀索引');
  lines.push('');
  lines.push(`- ${origin}/llms.txt — AI agent 專用站點導覽`);
  lines.push(`- ${origin}/llms-full.txt — 所有文章的 markdown 全文`);
  lines.push(`- ${origin}/sitemap-index.xml`);

  return new Response(lines.join('\n') + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
