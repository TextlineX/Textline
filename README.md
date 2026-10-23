# Textline v2

个人网站重做版：React 19 + Vite + GSAP，中英双语，深浅色，移动端适配。

## 开发

```bash
npm install
npm run dev      # 本地开发
npm run build    # 生产构建 → dist/
```

## 部署

1. 复制 `.env.example` 为 `.env`，把 `VITE_SITE_URL` 改成你的域名（如 `https://textline.dev`）。
   这样分享卡片（`og.png`）用的是绝对地址，构建时也会生成 `sitemap.xml`。
2. `npm run build`，把 `dist/` 上传。各平台都已经配好单页应用回退：
   - Vercel：`vercel.json`（顺带给 `/assets` 加了长缓存）
   - Netlify / Cloudflare Pages：`public/_redirects`
   - GitHub Pages：构建时自动生成 `404.html`
   - 自己的服务器：参考 `deploy/nginx.conf`

## 快捷键

- `/` 或 `⌘K` / `Ctrl+K`：打开命令面板，可以搜作品、技术、页面，切换主题和语言，复制邮箱
- 作品详情页 `←` / `→`：上一个 / 下一个作品
- `Tab`：第一下会出现“跳到正文”

## 改内容去哪里

- 作品：`src/data/works.ts`（名称、类型、简介、亮点、技术栈、截图）
- 所有界面文案（中/英）、邮箱、GitHub：`src/i18n.tsx`
- 颜色与字体：`src/styles/tokens.css`（`:root` 浅色，`[data-theme='dark']` 深色）
- 截图放在 `public/images/`，建议 webp、宽度 ≤ 1600px，并在 `works.ts` 里填好 `size`（宽、高）
- 分享卡片图：`public/og.png`（1200×630）

## 页面

| 路径 | 内容 |
| --- | --- |
| `/` | 首页：首屏、作品索引、简介、联系 |
| `/work` | 全部作品：按方向/技术筛选（`?cat=server&tech=Go` 可直接分享），列表/网格切换 |
| `/work/:id` | 作品详情：方向、亮点、技术栈都可点回筛选页 |
| `/about` | 关于：方向概览、技术 × 项目矩阵 |
| 其他 | 404 页 |

新增作品时，在 `src/data/works.ts` 里给它填 `categories`，筛选、矩阵和计数会自动更新。

## 结构

- `src/sections/Hero.tsx` 首屏：载入时逐字"渲染"，鼠标/自动游走的镜头把字母拉回线框
- `src/sections/Works.tsx` 作品索引，悬停预览图跟随鼠标（触屏显示内联缩略图）
- `src/sections/About.tsx` / `Contact.tsx`
- `src/pages/WorkPage.tsx` 作品详情页 `/work/:id`

部署为单页应用时，服务器需把未知路径回退到 `index.html`（如 Nginx `try_files $uri /index.html;`）。
