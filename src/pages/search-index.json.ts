// 站內文章搜尋索引：build 時輸出 /search-index.json，給 PostSearch 元件在瀏覽器端比對。
// 只放已發布、非草稿的文章；h 是預先合併的小寫搜尋字串（標題＋描述＋標籤）。
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../site.config';

export const GET: APIRoute = async () => {
  const now = new Date();
  const posts = await getCollection('posts', ({ data }) => !data.draft && new Date(data.publishDate) <= now);
  posts.sort((a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime());

  const items = posts.map((p) => {
    const cat = siteConfig.categories.find((c) => c.slug === p.data.category || c.name === p.data.category);
    return {
      t: p.data.title,
      d: p.data.description,
      c: cat?.slug ?? p.data.category,
      n: cat?.name ?? p.data.category,
      u: `/posts/${p.slug}/`,
      p: new Date(p.data.publishDate).toISOString().slice(0, 10),
      h: [p.data.title, p.data.description, ...(p.data.tags ?? [])].join(' ').toLowerCase(),
    };
  });

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
