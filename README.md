# Paper Scanner Website

Marketing site + blog for the Paper Scanner app (iOS & Android).

Deployed to GitHub Pages · 8 locales (en/zh/es/fr/de/ja/ko/pt) · black theme · zero runtime JS.

## 技术栈

- **Astro 4.x** — 静态站点生成、原生 i18n 路由、Content Collections
- **Tailwind CSS 3** + CSS Custom Properties（设计 token 一处修改全站生效）
- **MDX + Shiki** — 构建期代码高亮，零运行时
- **TypeScript** 严格模式

## 快速开始

```bash
pnpm install
pnpm dev          # http://localhost:4321/
pnpm build        # 静态产物到 dist/
pnpm preview      # 本地预览生产构建
pnpm test         # Vitest 单元测试
```

## 项目结构

```
paperscan_website/
├── astro.config.mjs         # i18n + sitemap + mdx + tailwind
├── src/
│   ├── pages/[lang]/        # 8 语言路由（en/zh/es/fr/de/ja/ko/pt）
│   ├── layouts/             # BaseLayout
│   ├── components/
│   │   ├── home/            # 首页区块（Hero / FeatureGrid / FAQ …）
│   │   ├── blog/            # 博客卡片、TOC、相关文章
│   │   ├── layout/          # Header / Footer / FeaturePage
│   │   └── seo/             # SeoHead / JsonLd
│   ├── content/blog/        # MDX 博客（按 locale 与 category 分目录）
│   ├── content/config.ts    # Content Collections 的 Zod schema
│   ├── i18n/                # en.json + zh.json（其余 6 语言 fallback 到 en）
│   ├── styles/              # tokens / effects / prose / global
│   └── consts.ts            # 站点常量（站点名、locales、社交链接）
├── public/                  # 静态资源（图标、manifest、CNAME）
├── tests/                   # Vitest 单测
└── .github/workflows/       # CI + Deploy
```

## 多语言

- 首版上线：**English + Simplified Chinese**
- 其余 6 语言（es/fr/de/ja/ko/pt）目前 fallback 到 en
- URL 模式：`/en/`, `/zh/`, ...（所有路径加 locale 前缀）
- 语言切换：Header 中 `<details>` CSS-only 下拉，零 JS
- hreflang：BaseLayout 自动输出所有 locale 互链

## 黑色主题

`src/styles/tokens.css` 定义所有 CSS Custom Properties：

- Surfaces: `--bg-0` (#000) → `--bg-3` (#1F1F23)
- Text: `--text-primary` (#FAFAFA) → `--text-muted` (#75757B)
- Brand: 单色（白/黑）+ `--pro-grad` 渐变
- 玻璃拟态、渐变网格、扫描线动画

## 添加新博客

1. 在 `src/content/blog/<lang>/<category>/` 创建 `slug.mdx`（category ∈ scanning/documents/ocr/pdf-export/cloud-sync/pro/releases/troubleshooting）
2. frontmatter 必填字段：`title`（≤80 字符）、`description`（80-180 字符）、`pubDate`、`author: paperscan-team`、`category`、`tags[]`、`hero.alt`、`translations.<locale>: <slug>`（指向其它语言的同篇文章）
3. 主题：**产品介绍 / 用户使用场景**，不写代码契约

```bash
pnpm test    # 自动校验所有 MDX frontmatter 与翻译对偶
```

## 添加新语言

1. `src/consts.ts` 添加到 `LOCALES` 数组
2. `astro.config.mjs` 添加到 `i18n.locales` 与 `sitemap.i18n.locales`
3. 创建 `src/i18n/<lang>.json`（从 `en.json` 复制作为起点）
4. 创建 `src/content/blog/<lang>/` 目录并补齐已发布文章的翻译 twin

## 部署

push 到 `main` 分支 → `.github/workflows/deploy.yml` 自动构建 → GitHub Pages。

环境变量：
- `PUBLIC_SITE_URL`（默认 `https://paperscan.cloud`）

DNS：在域名注册商把 `paperscan.cloud` 的 CNAME 指向 `<user>.github.io.`，GitHub Pages 会自动读取仓库根目录的 `CNAME` 文件。