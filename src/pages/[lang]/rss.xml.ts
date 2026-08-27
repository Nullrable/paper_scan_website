/**
 * Per-locale RSS feed.
 *
 *   /en/rss.xml
 *   /zh/rss.xml
 *   ...
 *
 * Hand-rolled XML to avoid pulling @astrojs/rss into the dependency tree.
 */

import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { LOCALES, LOCALE_NAMES, SITE_NAME, SITE_URL } from "../../consts";
import { localeUrl } from "../../utils/i18n";
import { sortByDateDesc } from "../../utils/blog";

const xmlEscape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function getStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = async ({ params, site }) => {
  const locale = params.lang!;
  const baseUrl = (site?.toString() ?? SITE_URL).replace(/\/$/, "");

  const all = await getCollection("blog", ({ data }) => !data.draft);
  const posts = all
    .filter((p) => p.id.startsWith(`${locale}/`))
    .sort(sortByDateDesc)
    .slice(0, 30);

  const langName = LOCALE_NAMES[locale as keyof typeof LOCALE_NAMES] ?? locale;
  const lastBuild = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const slug = (post.id.split("/").pop() ?? post.id).replace(/\.mdx?$/, "");
      const url = `${baseUrl}${localeUrl(locale as any, `/blog/${slug}/`)}`;
      return `    <item>
      <title>${xmlEscape(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${xmlEscape(post.data.description)}</description>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
      <language>${locale}</language>
      ${post.data.tags?.map((t) => `<category>${xmlEscape(t)}</category>`).join("\n      ") ?? ""}
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(`${SITE_NAME} blog`)}</title>
    <link>${baseUrl}${localeUrl(locale as any, "/blog/")}</link>
    <atom:link href="${baseUrl}${localeUrl(locale as any, "/rss.xml")}" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(`Releases, deep dives, and tips for ${SITE_NAME}. (${langName})`)}</description>
    <language>${locale}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
