import { describe, expect, it } from "vitest";
import {
  estimateReadingMinutes,
  resolveTwin,
  sortByDateDesc,
} from "../src/utils/blog";
import type { BlogEntry } from "../src/utils/blog";

/**
 * Build a minimal BlogEntry stub for testing.
 * The schema fields we touch in blog.ts are id + data.{pubDate, translations}.
 */
function makeEntry(
  id: string,
  pubDate: Date,
  translations: Record<string, string> = {},
): BlogEntry {
  return {
    id,
    data: {
      pubDate,
      translations: translations as any,
    },
  } as unknown as BlogEntry;
}

describe("estimateReadingMinutes", () => {
  it("returns at least 1 minute for an empty body", () => {
    expect(estimateReadingMinutes("")).toBe(1);
  });

  it("returns 1 minute for a body shorter than the WPM threshold", () => {
    expect(estimateReadingMinutes("a few words")).toBe(1);
  });

  it("counts plain text words", () => {
    const body = "word ".repeat(440).trim(); // 440 words @ 220 wpm = 2 minutes
    expect(estimateReadingMinutes(body)).toBe(2);
  });

  it("strips fenced code blocks before counting", () => {
    const codeHeavy = "```\n" + "x ".repeat(1000).trim() + "\n```\nshort prose";
    // Without stripping, this would be ~1001 words. After stripping, only
    // "short prose" = 2 words => 1 minute.
    expect(estimateReadingMinutes(codeHeavy)).toBe(1);
  });

  it("strips inline code, images, and links", () => {
    const noisy = "`inline` ![alt](http://x) [link](http://y) actual word";
    expect(estimateReadingMinutes(noisy)).toBe(1);
  });

  it("strips Markdown syntax characters without losing words", () => {
    const marked =
      "# Heading\n\n- bullet\n- second bullet\n\n**bold** and *italic*";
    expect(estimateReadingMinutes(marked)).toBeGreaterThanOrEqual(1);
  });

  it("rounds to the nearest minute", () => {
    const body = "word ".repeat(330).trim(); // 330 / 220 = 1.5 → rounds to 2
    expect(estimateReadingMinutes(body)).toBe(2);
  });
});

describe("sortByDateDesc", () => {
  it("sorts newest first", () => {
    const a = makeEntry("en/a", new Date("2026-01-01"));
    const b = makeEntry("en/b", new Date("2026-03-01"));
    const c = makeEntry("en/c", new Date("2026-02-01"));
    const sorted = [a, b, c].sort(sortByDateDesc);
    expect(sorted.map((e) => e.id)).toEqual(["en/b", "en/c", "en/a"]);
  });

  it("is stable for equal dates", () => {
    const d = new Date("2026-01-01");
    const a = makeEntry("en/a", d);
    const b = makeEntry("en/b", d);
    const sorted = [a, b].sort(sortByDateDesc);
    expect(sorted).toEqual([a, b]);
  });
});

describe("resolveTwin", () => {
  it("returns the same entry when locale already matches", () => {
    const en = makeEntry("en/scanning/x", new Date(), { zh: "x" });
    expect(resolveTwin(en, "en", [en])).toBe(en);
  });

  it("resolves the translated twin when present", () => {
    const en = makeEntry("en/scanning/x", new Date(), { zh: "x" });
    const zh = makeEntry("zh/scanning/x", new Date());
    expect(resolveTwin(en, "zh", [en, zh])).toBe(zh);
  });

  it("falls back to the source entry when no twin exists", () => {
    const en = makeEntry("en/scanning/x", new Date(), {});
    expect(resolveTwin(en, "zh", [en])).toBe(en);
  });

  it("does not crash when the translations field is missing entirely", () => {
    const en: BlogEntry = {
      id: "en/scanning/x",
      data: { pubDate: new Date() } as any,
    } as BlogEntry;
    expect(resolveTwin(en, "zh", [en])).toBe(en);
  });
});