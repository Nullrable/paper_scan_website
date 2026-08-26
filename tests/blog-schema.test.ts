import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parse as parseYaml } from "yaml";

/**
 * Blog frontmatter contract tests.
 *
 * These tests parse the YAML frontmatter of every MDX file in
 * src/content/blog and validate it against the SAME Zod shape used at
 * build time by src/content/config.ts.
 *
 * If you change the schema in src/content/config.ts, mirror the change here.
 */

const BLOG_DIR = join(process.cwd(), "src/content/blog");

const blogCategory = z.enum([
  "scanning",
  "documents",
  "ocr",
  "pdf-export",
  "cloud-sync",
  "pro",
  "releases",
  "troubleshooting",
]);

const blogFrontmatterSchema = z.object({
  title: z.string().max(80),
  description: z.string().min(80).max(180),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  category: blogCategory,
  tags: z.array(z.string()).default([]),
});

function parseFrontmatter(raw: string): unknown {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error("No frontmatter found");
  return parseYaml(match[1]);
}

function findMdxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...findMdxFiles(full));
    } else if (entry.endsWith(".mdx")) {
      out.push(full);
    }
  }
  return out;
}

describe("blog frontmatter schema", () => {
  const files = findMdxFiles(BLOG_DIR);

  it("has at least one MDX file (sanity)", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("has 16 MDX files (8 categories × 2 locales)", () => {
    // If this fails, either a blog post was deleted or a new category added.
    // Update the count here AND in the README when intentional.
    expect(files.length).toBe(16);
  });

  for (const file of files) {
    const rel = file.replace(process.cwd() + "/", "");

    it(`${rel} — has parseable frontmatter`, () => {
      const raw = readFileSync(file, "utf8");
      expect(() => parseFrontmatter(raw)).not.toThrow();
    });

    it(`${rel} — satisfies the blog schema`, () => {
      const raw = readFileSync(file, "utf8");
      const fm = parseFrontmatter(raw);
      const result = blogFrontmatterSchema.safeParse(fm);
      if (!result.success) {
        console.error(`${rel} schema errors:`, result.error.format());
      }
      expect(result.success).toBe(true);
    });
  }
});
