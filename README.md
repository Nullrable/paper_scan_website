# Paper Scanner Website

营销官网 + 博客 for the Paper Scanner Flutter app (iOS & Android).

部署在 GitHub Pages · 8 语言 (en/zh/es/fr/de/ja/ko/pt) · 黑色主题 · 零运行时 JS。

## 技术栈

- **Astro 4.x** — 静态站点生成、原生 i18n 路由、Content Collections
- **Tailwind CSS 3** + CSS Custom Properties（设计 token 一处修改全站生效）
- **MDX + Shiki** — 构建期代码高亮，零运行时
- **TypeScript** 严格模式
- **Giscus** — 评论系统（GitHub Discussions 镜像）

## 快速开始

```bash
pnpm install
pnpm dev          # http://localhost:4321/
pnpm build        # 静态产物到 dist/
pnpm preview      # 本地预览生产构建
```

## 项目结构

```
paperscan_website/
├── astro.config.mjs         # i18n + sitemap + mdx + tailwind
├── src/
│   ├── pages/[lang]/        # 8 语言路由（en/zh/es/fr/de/ja/ko/pt）
│   ├── layouts/             # BaseLayout
│   ├── components/
│   │   ├── layout/          # Header / Footer
│   │   └── seo/             # SeoHead / JsonLd
│   ├── content/             # Content Collections（Phase 3+ 启用）
│   ├── i18n/                # en.json + zh.json
│   ├── styles/              # tokens / effects / prose / global
│   └── consts.ts            # 站点常量
├── public/                  # 静态资源（图标、manifest、robots.txt）
├── images/                  # 【源】PWA 图标（构建前拷贝到 public/）
├── scripts/                 # CI 辅助脚本
└── .github/workflows/       # CI + Deploy
```

## 多语言

- 首版上线：**English + Simplified Chinese**
- Phase 5 扩展：ja/es/fr/de/ko/pt（fallback 到 en）
- URL 模式：`/en/`, `/zh/`, ...（所有路径加 locale 前缀）
- 语言切换：Header 中 `<details>` CSS-only 下拉，零 JS
- hreflang：BaseLayout 自动输出所有 locale 互链

## 黑色主题

`src/styles/tokens.css` 定义所有 CSS Custom Properties：

- Surfaces: `--bg-0` (#000) → `--bg-3` (#1F1F23)
- Text: `--text-primary` (#FAFAFA) → `--text-muted` (#75757B)
- Brand: 单色（白/黑）+ `--pro-grad` 渐变
- 玻璃拟态、渐变网格、扫描线动画

## 添加新博客（Phase 3+）

1. 在 `src/content/blog/<lang>/<category>/` 创建 `slug.mdx`
2. frontmatter 必须包含：
   - `category`（scanning/documents/ocr/pdf-export/cloud-sync/pro/releases/troubleshooting）
   - `relatedSource: [{ module: "lib/view/scan/thick_scanner_screen.dart", ... }]` —— **至少 1 个 Flutter 源模块**
3. 运行 `pnpm check:blog-references` 验证

`scripts/check-blog-references.sh` 强制每篇博客引用 `lib/` 或 `packages/` 路径，
**禁止生成与项目功能无关的内容**。

## 添加新语言

1. `src/consts.ts` 添加到 `LOCALES` 数组
2. `astro.config.mjs` 添加到 `i18n.locales` 与 `sitemap.i18n.locales`
3. 创建 `src/i18n/<lang>.json`（从 `en.json` 复制）
4. 创建 `src/content/blog/<lang>/` 目录

## 部署

push 到 `main` 分支 → `.github/workflows/deploy.yml` 自动构建 → GitHub Pages。

环境变量：
- `PUBLIC_SITE_URL`（默认 `https://paperscanner.app`）

## 关键 Flutter 源文件参考

```bash
/Users/lusudong/Documents/fronted-work/flutter/paper_scanner/lib/l10n/app_en.arb
/Users/lusudong/Documents/fronted-work/flutter/paper_scanner/lib/provider/subscription_provider.dart
/Users/lusudong/Documents/fronted-work/flutter/paper_scanner/lib/view/scan/thick_scanner_screen.dart
/Users/lusudong/Documents/fronted-work/flutter/paper_scanner/lib/manager/cloud/google_drive_driver.dart
/Users/lusudong/Documents/fronted-work/flutter/paper_scanner/lib/manager/cloud/icloud_driver.dart
/Users/lusudong/Documents/fronted-work/flutter/paper_scanner/assets/shaders/filter.frag
```

## 阶段进度

- [x] **Phase 1**: Scaffold + 资源 + 主题（当前）
- [ ] **Phase 2**: 首页 + Feature 页 + Pricing
- [ ] **Phase 3**: 博客系统 + Content Collections
- [ ] **Phase 4**: SEO + 性能 + i18n 扩展
- [ ] **Phase 5**: 部署 + CI/CD