import { defineCollection, reference, z } from "astro:content";
import { BLOG_CATEGORIES } from "./categories";

const LOCALES = ["en", "zh", "es", "fr", "de", "ja", "ko", "pt"] as const;

/**
 * Authors — keep small, hand-curated. Each author owns a single identity
 * across all locales.
 */
const authors = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    handle: z.string(),
    role: z.string(),
    bio: z.string(),
    avatar: z.string().optional(),
    links: z
      .object({
        github: z.string().url().optional(),
        twitter: z.string().url().optional(),
        website: z.string().url().optional(),
      })
      .default({}),
  }),
});

/**
 * Blog — product-focused posts. Each post must have a clear title,
 * description, category, and (optionally) point to its translation twin.
 * No code references required.
 */
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().max(80),
    description: z.string().min(80).max(180),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: reference("authors"),
    category: z.enum(BLOG_CATEGORIES),
    tags: z.array(z.string()).default([]),
    hero: z.object({
      src: z.string().optional(),
      alt: z.string().default(""),
    }),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    proOnly: z.boolean().default(false),
    /** Map locale -> slug. Missing locales fall back to the entry's own slug. */
    translations: z.record(z.enum(LOCALES), z.string()).default({}),
  }),
});

export const collections = { authors, blog };
// Re-export so legacy imports like `import { BLOG_CATEGORIES } from '../content/config'`
// keep working without churn. Source of truth lives in ./categories.
export { BLOG_CATEGORIES };
