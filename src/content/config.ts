import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
    faq: z.array(z.object({
      q: z.string(),
      a: z.string(),
    })).optional(),
    // 文章內商品卡（酷澎分潤），見 components/ProductPicks.astro
    products: z.array(z.object({
      name: z.string(),
      url: z.string(),
      price: z.number().optional(),
      image: z.string().optional(),
      note: z.string().optional(),
    })).optional(),
    productsTitle: z.string().optional(),
    productsIntro: z.string().optional(),
  }),
});

export const collections = { posts };
