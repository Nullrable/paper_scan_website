/**
 * Blog helpers — pure functions for working with the blog collection.
 */

import type { CollectionEntry } from "astro:content";
import { BLOG_CATEGORIES } from "../content/categories";

/* `CollectionEntry` is a structural type — we re-declare the subset we use
// so the helpers are testable without loading the Astro virtual module. */
type BlogEntryShape = {
  id: string;
  body?: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    updatedDate?: Date;
    category: string;
    tags?: string[];
    translations?: Record<string, string>;
  };
};

export type BlogEntry =
  CollectionEntry<"blog"> | (BlogEntryShape & { id: string });

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/** Average words-per-minute for technical writing. */
const WPM = 220;

/** Estimate reading time in whole minutes from MDX body text. */
export function estimateReadingMinutes(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/`[^`]+`/g, " ") // inline code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → keep label only
    .replace(/[#>*_~`]/g, " ") // md syntax
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WPM));
}

/**
 * Given a post and a target locale, return the equivalent entry in that locale.
 *
 * If the post itself is already in the target locale, return it.
 * Otherwise look up the translation by id (`{locale}/{slug}`), and only if
 * no twin exists do we fall back to the source entry.
 */
export function resolveTwin(
  post: BlogEntry,
  targetLocale: string,
  pool: BlogEntry[],
): BlogEntry {
  if (post.id.startsWith(`${targetLocale}/`)) return post;
  const targetSlug = (
    post.data.translations as Record<string, string | undefined>
  )?.[targetLocale];
  if (targetSlug) {
    // twin's id is {locale}/{category}/{slug} — match by basename so the
    // translations map only has to encode the slug, not the category path.
    const twin = pool.find(
      (p) =>
        p.id.startsWith(`${targetLocale}/`) &&
        p.id.split("/").pop() === targetSlug,
    );
    if (twin) return twin;
  }
  return post;
}

/** Sort newest first. */
export function sortByDateDesc(a: BlogEntry, b: BlogEntry): number {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}
