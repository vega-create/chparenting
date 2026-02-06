# 結構化資料 (Schema) 實作指南

## 📌 目前狀態

| 網站 | Article | FAQ | Breadcrumb | WebSite | Product |
|------|---------|-----|------------|---------|---------|
| chparenting ✅ | ✅ BlogPosting | ✅ FAQPage | ✅ BreadcrumbList | ✅ 首頁 | N/A |
| bible.freshblogs.cc | ❌ 需加入 | ❌ 需加入 | ❌ 需加入 | ❌ 需加入 | N/A |
| mommystartup | ❌ 需加入 | ❌ 需加入 | ❌ 需加入 | ❌ 需加入 | ❌ 需加入 |

---

## 一、各站需要複製的 Schema 元件

把 `chparenting/src/components/` 裡的這些檔案複製到其他站：

```
ArticleSchema.astro    → 文章頁用
BreadcrumbSchema.astro → 所有頁面用
FAQSchema.astro        → 有 FAQ 的文章用
WebSiteSchema.astro    → 首頁用
ProductSchema.astro    → mommystartup 商品頁用
```

### 每個站需要修改的：
- `site.config.ts` 裡的 `url`、`name`、`author` 要正確
- `WebSiteSchema.astro` 裡的 `alternateName` 改成對應英文名

---

## 二、PostLayout 使用範例 (已在 chparenting 實作)

```astro
---
import ArticleSchema from '../components/ArticleSchema.astro';
import BreadcrumbSchema from '../components/BreadcrumbSchema.astro';
import FAQSchema from '../components/FAQSchema.astro';
---

<!-- 文章頁自動生成的結構化資料 -->
<ArticleSchema
  title={title}
  description={description}
  publishDate={publishDate}
  image={image}
  url={siteConfig.url + Astro.url.pathname}
  category={categoryInfo?.name}
  tags={tags}
/>
<BreadcrumbSchema items={[
  { name: '首頁', url: '/' },
  { name: '分類名', url: '/category/xxx/' },
  { name: title },
]} />

<!-- FAQ 在文章底部 -->
{faq && <FAQSchema faqs={faq} />}
```

---

## 三、mommystartup 商品頁 Product Schema

在商品內頁加入 ProductSchema：

```astro
---
import ProductSchema from '../components/ProductSchema.astro';
---

<ProductSchema
  name="★原味千尋_好日綻放禮盒 *16入"
  description="經典9口味乳酪絲..."
  image="https://mommystartup.com/images/product.jpg"
  price={2180}
  currency="TWD"
  availability="InStock"
  sku="693292f852447"
  brand="原味千尋"
  url="https://mommystartup.com/shop/product-slug/"
  priceValidUntil="2026-12-31"
  seller="媽咪小編"
  sellerUrl="https://mommystartup.com"
/>
```

### Google Rich Results Test 的「非重大問題」修復：
- `priceValidUntil` → 加上價格有效期限（如 "2026-12-31"）
- 這是選填但建議加上，可消除警告

---

## 四、AI Writer 需要修改的地方

### 問題：AI Writer 產出的 Markdown 本身不含 Schema
### 解法：Schema 由 Astro 元件自動生成，不需要寫在 Markdown 裡

✅ **正確做法**（目前架構）：
- Markdown frontmatter 提供資料（title、description、faq、tags 等）
- Astro 的 PostLayout 讀取 frontmatter → 自動注入 Schema JSON-LD
- **AI Writer 不需要改！** 只需要確保 frontmatter 完整

### AI Writer 產文時 frontmatter 必須包含：

```yaml
---
title: "問句標題"           # → Article.headline
description: "150字摘要"     # → Article.description  
publishDate: "2025-02-06"   # → Article.datePublished
category: "分類slug"         # → Article.articleSection
tags: ["標籤1", "標籤2"]     # → Article.keywords
image: "https://..."         # → Article.image
imageAlt: "圖片描述"
faq:                          # → FAQPage schema
  - q: "問題1"
    a: "回答1"
  - q: "問題2"
    a: "回答2"
  - q: "問題3"
    a: "回答3"
---
```

### 確認清單：
- [x] title 是問句形式
- [x] description 在 150 字內
- [x] faq 有 3-5 個問答
- [x] tags 有 3-5 個標籤
- [x] image 有有效的圖片 URL
- [x] category 對應正確的分類 slug

---

## 五、驗證方式

1. 用 Google Rich Results Test 測試：
   https://search.google.com/test/rich-results?hl=zh-tw

2. 輸入文章 URL，應該偵測到：
   - ✅ 文章 (BlogPosting)
   - ✅ 常見問題 (FAQPage)
   - ✅ 麵包屑 (BreadcrumbList)
   - ✅ 商家資訊 (Organization) — 如果有 WebSiteSchema

3. 商品頁應該偵測到：
   - ✅ 產品摘要 (Product)
   - ✅ 商家資訊 (Organization)

---

## 六、各站需要做的事

### bible.freshblogs.cc
1. 複製 Schema 元件到 src/components/
2. PostLayout 加入 ArticleSchema + BreadcrumbSchema
3. 首頁加入 WebSiteSchema
4. 修改 site.config.ts 的 url 和 name

### mommystartup.com
1. 複製 Schema 元件（含 ProductSchema）
2. PostLayout 加入 ArticleSchema + BreadcrumbSchema
3. 商品頁加入 ProductSchema
4. 首頁加入 WebSiteSchema
5. Supabase 商品資料需要有：name, description, price, image, sku, brand

### 其他站 (aimommywisdom, vega-note)
1. 等建站時直接把 Schema 元件包含進去
