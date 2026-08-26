import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Paper Scanner Marketing Site Configuration
// Reference: /Users/lusudong/Documents/fronted-work/flutter/paper_scanner
// Deploy target: GitHub Pages

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://paperscan.cloud';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'pt'],
    routing: {
      prefixDefaultLocale: true,
    },
    fallback: {
      es: 'en',
      fr: 'en',
      de: 'en',
      ja: 'en',
      ko: 'en',
      pt: 'en',
    },
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx({
      shikiConfig: {
        theme: 'github-dark-dimmed',
        wrap: true,
      },
    }),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        // sitemap generator uses ISO 639-1 codes
        locales: {
          en: 'en-US',
          zh: 'zh-CN',
          es: 'es-ES',
          fr: 'fr-FR',
          de: 'de-DE',
          ja: 'ja-JP',
          ko: 'ko-KR',
          pt: 'pt-BR',
        },
      },
    }),
  ],
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
});