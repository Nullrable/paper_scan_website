/**
 * Post-build sitemap fixer.
 *
 * The @astrojs/sitemap integration does not handle `prefixDefaultLocale: false`
 * correctly for hreflang alternates — it emits hreflang hrefs pointing at
 * `/en/...` paths, which 404 because English is served from the site root.
 * It also does not emit the `x-default` hreflang entry that Google expects.
 *
 * This script runs after `astro build` and:
 *   1. Drops every <url> whose <loc> points at a `/en/` path (dead URLs).
 *   2. Rewrites any hreflang href that points at `/en/...` to the root form.
 *   3. Adds an `x-default` hreflang on every remaining <url> pointing at the
 *      canonical English (root) URL for that page.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const DIST_DIR = resolve(process.cwd(), "dist");
const DEFAULT_LOCALE = "en";
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://paperscan.cloud";

// Find every sitemap-*.xml file produced by @astrojs/sitemap.
// Uses readdir (Node 20+) rather than the glob() helper added in
// node:fs/promises (Node 22+) so this script runs on every LTS GitHub
// Actions runner, including the ones still on Node 20.
async function findSitemapFiles(): Promise<string[]> {
  const entries = await readdir(DIST_DIR);
  return entries
    .filter((name) => /^sitemap-\d+\.xml$/.test(name))
    .map((name) => resolve(DIST_DIR, name));
}

/**
 * Replace every hreflang href whose path starts with `/en/` with the root
 * equivalent. Keeps the hreflang code intact; only the path changes.
 */
function fixHreflangHrefs(xml: string): string {
  return xml.replace(
    /(<xhtml:link\s+rel="alternate"\s+hreflang="en-US"\s+href=")([^"]*?)(\/en\/[^"]*?)("\s*\/>)/g,
    (_match, head, _origin, _enPath, tail) => {
      // Strip the `/en` segment, preserving any trailing path and slash.
      const stripped = _enPath.replace(/^\/en(\/|$)/, "$1");
      return `${head}${SITE_URL}${stripped}${tail}`;
    },
  );
}

/**
 * Remove every <url>…</url> block whose <loc> points at a `/en/` path.
 * Also handles the self-closing and unclosed variants safely by matching
 * a minimal <url>...</url> block.
 */
function dropEnLocaleUrls(xml: string): string {
  return xml.replace(
    /<url><loc>https?:\/\/[^<]*\/en\/[^<]*<\/loc>[\s\S]*?<\/url>/g,
    "",
  );
}

/**
 * Inject an `x-default` hreflang link after the last <xhtml:link> in each
 * <url> block. x-default points at the canonical English URL (root form).
 *
 * Idempotent: if the <url> block already contains an x-default entry (e.g.
 * from a future @astrojs/sitemap release), the existing entry is left alone.
 */
function injectXDefault(xml: string): string {
  return xml.replace(
    /(<url><loc>(https?:\/\/[^<]+)<\/loc>)([\s\S]*?)(<\/url>)/g,
    (_match, head, loc, middle, tail) => {
      if (middle.includes('hreflang="x-default"')) {
        return `${head}${middle}${tail}`;
      }
      // Compute the English canonical URL: drop the `/xx/` segment from the
      // current loc, leaving the root form. Falls back to site root.
      let canonical = "/";
      try {
        const u = new URL(loc);
        const segs = u.pathname.split("/").filter(Boolean);
        if (segs.length > 0 && segs[0] !== DEFAULT_LOCALE) {
          const rest = segs.slice(1).join("/");
          canonical = rest ? `/${rest}/` : "/";
        } else if (segs[0] === DEFAULT_LOCALE) {
          const rest = segs.slice(1).join("/");
          canonical = rest ? `/${rest}/` : "/";
        }
      } catch {
        // keep canonical = "/"
      }
      const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${canonical}"/>`;
      return `${head}${middle}${xDefault}${tail}`;
    },
  );
}

async function processSitemap(
  path: string,
): Promise<{ before: number; after: number }> {
  const original = await readFile(path, "utf8");
  const before = (original.match(/<url>/g) ?? []).length;

  let fixed = original;
  fixed = dropEnLocaleUrls(fixed);
  fixed = fixHreflangHrefs(fixed);
  fixed = injectXDefault(fixed);

  const after = (fixed.match(/<url>/g) ?? []).length;
  await writeFile(path, fixed, "utf8");
  return { before, after };
}

async function main() {
  const files = await findSitemapFiles();
  if (files.length === 0) {
    console.warn("[postbuild-sitemap] No sitemap files found in dist/.");
    return;
  }

  for (const file of files) {
    const { before, after } = await processSitemap(file);
    console.log(
      `[postbuild-sitemap] ${file.replace(DIST_DIR + "/", "")}: ` +
        `${before} → ${after} URLs (dropped ${before - after} /en/ dead URLs, added x-default)`,
    );
  }
}

// Export pure helpers so unit tests can exercise them without spawning a
// subprocess. The main() entrypoint only runs when this file is invoked
// directly via tsx (i.e. when the user runs `pnpm run postbuild`).
export { dropEnLocaleUrls, fixHreflangHrefs, injectXDefault };

// Only run main() when this script is the entry point (not when imported
// from tests). tsx sets `process.argv[1]` to the script path.
if (
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].endsWith("postbuild-sitemap.ts")
) {
  main().catch((err) => {
    console.error("[postbuild-sitemap] failed:", err);
    process.exit(1);
  });
}
