import type { Locale } from "../consts";
import { localeUrl } from "../utils/i18n";

export interface FeatureDef {
  slug: string;
  icon: "scan" | "filter" | "folder" | "ocr" | "pdf" | "cloud";
  titleKey: string;
  summaryKey: string;
  bodyKey: string;
  /** Concrete scenarios shown beneath the description on the feature page. */
  useCasesKey: string;
  proHintKey?: string;
}

/**
 * Each feature is described for the visitor — what it does, when to use it,
 * and what it costs (free vs Pro). No code references; the site is a
 * product site, not a developer reference.
 */
export const FEATURES: FeatureDef[] = [
  {
    slug: "scanning",
    icon: "scan",
    titleKey: "features.scanning.title",
    summaryKey: "features.scanning.summary",
    bodyKey: "features.scanning.body",
    useCasesKey: "features.scanning.useCases",
    proHintKey: undefined,
  },
  {
    slug: "filters",
    icon: "filter",
    titleKey: "features.filters.title",
    summaryKey: "features.filters.summary",
    bodyKey: "features.filters.body",
    useCasesKey: "features.filters.useCases",
    proHintKey: undefined,
  },
  {
    slug: "documents",
    icon: "folder",
    titleKey: "features.documents.title",
    summaryKey: "features.documents.summary",
    bodyKey: "features.documents.body",
    useCasesKey: "features.documents.useCases",
    proHintKey: undefined,
  },
  {
    slug: "ocr",
    icon: "ocr",
    titleKey: "features.ocr.title",
    summaryKey: "features.ocr.summary",
    bodyKey: "features.ocr.body",
    useCasesKey: "features.ocr.useCases",
    proHintKey: "features.ocr.proHint",
  },
  {
    slug: "pdf-export",
    icon: "pdf",
    titleKey: "features.pdf.title",
    summaryKey: "features.pdf.summary",
    bodyKey: "features.pdf.body",
    useCasesKey: "features.pdf.useCases",
    proHintKey: undefined,
  },
  {
    slug: "cloud-sync",
    icon: "cloud",
    titleKey: "features.cloud.title",
    summaryKey: "features.cloud.summary",
    bodyKey: "features.cloud.body",
    useCasesKey: "features.cloud.useCases",
    proHintKey: "features.cloud.proHint",
  },
  {
    slug: "pro",
    icon: "filter",
    titleKey: "features.pro.title",
    summaryKey: "features.pro.summary",
    bodyKey: "features.pro.body",
    useCasesKey: "features.pro.useCases",
    proHintKey: undefined,
  },
];

/** Cross-feature "you might also want" links, used on each feature page. */
export const FEATURE_RELATED: Record<
  string,
  Array<{ href: string; labelKey: string }>
> = {
  scanning: [
    { href: "/features/filters/", labelKey: "features.filters.title" },
    { href: "/features/documents/", labelKey: "features.documents.title" },
  ],
  filters: [
    { href: "/features/scanning/", labelKey: "features.scanning.title" },
    { href: "/features/pdf-export/", labelKey: "features.pdf.title" },
  ],
  documents: [
    { href: "/features/ocr/", labelKey: "features.ocr.title" },
    { href: "/features/cloud-sync/", labelKey: "features.cloud.title" },
  ],
  ocr: [
    { href: "/features/documents/", labelKey: "features.documents.title" },
    { href: "/features/pdf-export/", labelKey: "features.pdf.title" },
  ],
  "pdf-export": [
    { href: "/features/documents/", labelKey: "features.documents.title" },
    { href: "/features/cloud-sync/", labelKey: "features.cloud.title" },
  ],
  "cloud-sync": [
    { href: "/features/documents/", labelKey: "features.documents.title" },
  ],
  pro: [
    { href: "/features/ocr/", labelKey: "features.ocr.title" },
    { href: "/features/cloud-sync/", labelKey: "features.cloud.title" },
    { href: "/features/documents/", labelKey: "features.documents.title" },
  ],
};

export type FeatureSlug = (typeof FEATURES)[number]["slug"];

export function getFeature(slug: string): FeatureDef | undefined {
  return FEATURES.find((f) => f.slug === slug);
}

export function getRelatedLinks(
  locale: Locale,
  slug: string,
): Array<{ href: string; label: string }> {
  const items = FEATURE_RELATED[slug] ?? [];
  return items.map((item) => ({
    href: localeUrl(locale, item.href),
    label:
      locale === "zh" ? resolveZh(item.labelKey) : resolveEn(item.labelKey),
  }));
}

// Quick title resolvers — for sidebar links we don't need full i18n overhead.
function resolveEn(key: string): string {
  const map: Record<string, string> = {
    "features.scanning.title": "Ultra-wide capture",
    "features.filters.title": "Six GPU filters",
    "features.documents.title": "Document organisation",
    "features.ocr.title": "On-device OCR",
    "features.pdf.title": "Multi-page PDF export",
    "features.cloud.title": "Conflict-free cloud sync",
    "features.pro.title": "Paper Scanner Pro",
  };
  return map[key] ?? key;
}

function resolveZh(key: string): string {
  const map: Record<string, string> = {
    "features.scanning.title": "超广角拍摄",
    "features.filters.title": "六种 GPU 滤镜",
    "features.documents.title": "文档管理",
    "features.ocr.title": "本地 OCR",
    "features.pdf.title": "多页 PDF 导出",
    "features.cloud.title": "无冲突云同步",
    "features.pro.title": "Paper Scanner Pro",
  };
  return map[key] ?? key;
}
