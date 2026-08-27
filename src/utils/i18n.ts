import en from "../i18n/en.json";
import zh from "../i18n/zh.json";
import type { Locale } from "../consts";

const dictionaries = {
  en,
  zh,
  // Fallback-only locales — content is the English copy until translated.
  es: en,
  fr: en,
  de: en,
  ja: en,
  ko: en,
  pt: en,
} as const;

export type Dictionary = typeof en;
export type I18nKey = NestedKeyOf<Dictionary>;

type NestedKeyOf<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends Array<unknown>
    ? // Array values: allow the parent path so callers can fetch the array
      // and narrow at the call-site (e.g. principles.items -> string[]).
      `${P}${K}`
    : T[K] extends object
      ? NestedKeyOf<T[K], `${P}${K}.`>
      : `${P}${K}`;
}[keyof T & string];

/**
 * Resolve a dotted key (e.g. "hero.headline") against the dictionary
 * for the requested locale, falling back to English if the key is missing.
 *
 * Supports {placeholder} tokens via the `values` argument.
 */
export function t(
  locale: Locale,
  key: I18nKey,
  values?: Record<string, string | number>,
): string {
  const segments = key.split(".");
  const lookup = (dict: Dictionary): string | undefined => {
    let cur: unknown = dict;
    for (const seg of segments) {
      if (
        cur &&
        typeof cur === "object" &&
        seg in (cur as Record<string, unknown>)
      ) {
        cur = (cur as Record<string, unknown>)[seg];
      } else {
        return undefined;
      }
    }
    return typeof cur === "string" ? cur : undefined;
  };

  const raw = lookup(dictionaries[locale]) ?? lookup(dictionaries.en) ?? key;

  if (!values) return raw;

  return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in values ? String(values[name]) : `{${name}}`,
  );
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

/**
 * Build a URL for a given locale + locale-relative path.
 *
 * The default locale (English) is served from the site root with no
 * prefix (`/`, `/blog/foo/`); other locales keep their prefix
 * (`/zh/`, `/zh/blog/foo/`). When the site lives at a non-root base
 * path, Astro's `getRelativeLocaleUrl` would also handle that — we
 * hardcode the behaviour here because the site is deployed at root.
 */
export function localeUrl(locale: Locale, path: string): string {
  const normalised = path === "" || path === "/" ? "/" : path;
  if (locale === "en") return normalised;
  return `/${locale}${normalised === "/" ? "/" : normalised}`;
}

/**
 * Resolve a dotted key against the dictionary and return the raw value.
 *
 * Unlike `t()`, this preserves the original shape — useful for fetching
 * arrays (e.g. lists of use cases) or nested objects that the caller
 * will narrow at the call-site.
 */
export function tValue(locale: Locale, key: string): unknown {
  const dict = getDictionary(locale);
  const segments = key.split(".");
  let cur: unknown = dict;
  for (const seg of segments) {
    if (
      cur &&
      typeof cur === "object" &&
      seg in (cur as Record<string, unknown>)
    ) {
      cur = (cur as Record<string, unknown>)[seg];
    } else {
      return undefined;
    }
  }
  return cur;
}
