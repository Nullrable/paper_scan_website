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
