/**
 * Unit tests for scripts/postbuild-sitemap.ts.
 *
 * These exercise the three pure transformations (dropEnLocaleUrls,
 * fixHreflangHrefs, injectXDefault) by importing the functions exported
 * alongside the script's main() entry point.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Use a require shim so we can import the .ts script under tsx at runtime
// without adding a separate test entrypoint. The script is written as ESM
// so we import directly and rely on vitest's esbuild loader.
import {
  dropEnLocaleUrls,
  fixHreflangHrefs,
  injectXDefault,
} from "../scripts/postbuild-sitemap";

describe("postbuild-sitemap helpers", () => {
  describe("dropEnLocaleUrls", () => {
    it("removes <url> blocks whose <loc> points at /en/", () => {
      const input =
        '<url><loc>https://paperscan.cloud/en/about/</loc></url>' +
        '<url><loc>https://paperscan.cloud/zh/about/</loc></url>';
      expect(dropEnLocaleUrls(input)).toBe(
        '<url><loc>https://paperscan.cloud/zh/about/</loc></url>',
      );
    });

    it("keeps /en/... paths when they appear inside hreflang hrefs", () => {
      // The dropper targets <url>...<loc>...</loc>...</url> blocks only.
      const input =
        '<url><loc>https://paperscan.cloud/zh/about/</loc>' +
        '<xhtml:link rel="alternate" hreflang="en-US" href="https://paperscan.cloud/en/about/"/></url>';
      expect(dropEnLocaleUrls(input)).toBe(input);
    });
  });

  describe("fixHreflangHrefs", () => {
    it("rewrites en-US hreflang hrefs to drop /en/ segment", () => {
      const input =
        '<xhtml:link rel="alternate" hreflang="en-US" href="https://paperscan.cloud/en/blog/foo/"/>';
      const out = fixHreflangHrefs(input);
      expect(out).toContain('href="https://paperscan.cloud/blog/foo/"');
      expect(out).not.toContain("/en/");
    });

    it("leaves non-en-US hreflang hrefs untouched", () => {
      const input =
        '<xhtml:link rel="alternate" hreflang="zh-CN" href="https://paperscan.cloud/zh/blog/foo/"/>';
      expect(fixHreflangHrefs(input)).toBe(input);
    });
  });

  describe("injectXDefault", () => {
    it("injects x-default pointing at the canonical English URL", () => {
      const input =
        '<url><loc>https://paperscan.cloud/zh/about/</loc>' +
        '<xhtml:link rel="alternate" hreflang="zh-CN" href="https://paperscan.cloud/zh/about/"/>' +
        '</url>';
      const out = injectXDefault(input);
      expect(out).toContain('hreflang="x-default"');
      expect(out).toContain('href="https://paperscan.cloud/about/"');
      expect(out).not.toContain("/en/");
    });

    it("uses site root when the locale segment is the only path segment", () => {
      const input =
        '<url><loc>https://paperscan.cloud/zh/</loc>' +
        '<xhtml:link rel="alternate" hreflang="zh-CN" href="https://paperscan.cloud/zh/"/>' +
        '</url>';
      const out = injectXDefault(input);
      // No double slashes — single trailing slash for site root.
      expect(out).toContain('href="https://paperscan.cloud/"');
      expect(out).not.toContain("//\"");
    });

    it("does not double-inject x-default", () => {
      const input =
        '<url><loc>https://paperscan.cloud/zh/about/</loc>' +
        '<xhtml:link rel="alternate" hreflang="x-default" href="https://paperscan.cloud/about/"/>' +
        '</url>';
      const out = injectXDefault(input);
      const matches = out.match(/hreflang="x-default"/g) ?? [];
      expect(matches).toHaveLength(1);
    });
  });
});

describe("postbuild-sitemap end-to-end on disk", () => {
  let workdir: string;
  beforeEach(async () => {
    workdir = await mkdtemp(join(tmpdir(), "postbuild-sitemap-"));
  });

  it("rewrites a sample sitemap in place", async () => {
    const sample = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
      '<url><loc>https://paperscan.cloud/</loc></url>',
      '<url><loc>https://paperscan.cloud/en/about/</loc></url>',
      '<url><loc>https://paperscan.cloud/zh/about/</loc>',
      '<xhtml:link rel="alternate" hreflang="en-US" href="https://paperscan.cloud/en/about/"/>',
      '<xhtml:link rel="alternate" hreflang="zh-CN" href="https://paperscan.cloud/zh/about/"/>',
      '</url>',
      '</urlset>',
    ].join("");
    const sitemapPath = join(workdir, "sitemap-0.xml");
    await writeFile(sitemapPath, sample, "utf8");

    let xml = await readFile(sitemapPath, "utf8");
    xml = dropEnLocaleUrls(xml);
    xml = fixHreflangHrefs(xml);
    xml = injectXDefault(xml);
    await writeFile(sitemapPath, xml, "utf8");

    const final = await readFile(sitemapPath, "utf8");
    // /en/about/ url block is gone, /zh/about/ hreflang now uses /about/, x-default added.
    expect(final).not.toContain("/en/");
    expect(final).toContain('href="https://paperscan.cloud/about/"');
    expect(final).toContain('hreflang="x-default"');

    await rm(workdir, { recursive: true, force: true });
  });
});