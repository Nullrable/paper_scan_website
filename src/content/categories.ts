/**
 * Blog category list — extracted from src/content/config.ts so non-Astro
 * code (tests, helpers, types) can reference it without loading the
 * `astro:content` virtual module.
 *
 * Keep this list and src/content/config.ts in sync.
 */
export const BLOG_CATEGORIES = [
  "scanning",
  "documents",
  "ocr",
  "pdf-export",
  "cloud-sync",
  "pro",
  "troubleshooting",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
