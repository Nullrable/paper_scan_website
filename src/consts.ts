/**
 * Paper Scanner — site-wide constants.
 *
 * Source of truth for site identity (name, URL, locales). All user-facing
 * strings live in src/i18n/*.json so translators do not need to touch code.
 */

export const SITE_NAME = "Paper Scanner";
export const SITE_SHORT_NAME = "Paper Scanner";
export const SITE_DESCRIPTION =
  "A pro document scanner for iOS and Android — ultra-wide capture, GPU filters, OCR, multi-page PDF, Google Drive & iCloud sync.";

export const SITE_URL =
  import.meta.env.PUBLIC_SITE_URL || "https://paperscan.cloud";

export const DEFAULT_LOCALE = "en" as const;
export const LOCALES = [
  "en",
  "zh",
  "es",
  "fr",
  "de",
  "ja",
  "ko",
  "pt",
] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  zh: "简体中文",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  pt: "Português",
};

/**
 * BCP-47 language tags — used by Google for hreflang and the XML sitemap.
 *
 * The HTML <html lang> attribute uses the short codes from `LOCALES`
 * (HTML spec only accepts language, not region). hreflang and sitemap
 * want the full BCP-47 tag so we can be explicit about region targeting.
 * Keeping the two formats aligned between HTML and sitemap is required
 * by Google — mixing them invalidates the signal.
 */
export const HREFLANG_CODES: Record<Locale, string> = {
  en: "en-US",
  zh: "zh-CN",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  ja: "ja-JP",
  ko: "ko-KR",
  pt: "pt-BR",
};

/**
 * Open Graph locale codes (underscore-separated per OG protocol).
 * Used by `og:locale` and `og:locale:alternate`.
 */
export const OG_LOCALE_CODES: Record<Locale, string> = {
  en: "en_US",
  zh: "zh_CN",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  ja: "ja_JP",
  ko: "ko_KR",
  pt: "pt_BR",
};

export const SOCIALS = {
  github: "https://github.com/Nullrable/paper_scanner",
  appStore: "https://apps.apple.com/us/app/paper-scan/id6805063444",
  // Empty until the app is published on Google Play.
  playStore: "",
};

export const NAV_ITEMS = [
  { key: "features", href: "/features/" },
  { key: "blog", href: "/blog/" },
  { key: "download", href: "/download/" },
  { key: "about", href: "/about/" },
] as const;

export const OG_IMAGE_DEFAULT = "/og-default.png";
