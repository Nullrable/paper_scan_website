/**
 * Build a JSON-LD <script> tag string for injection via <Fragment set:html>.
 *
 * Why a string and not a real <script> element:
 *
 *   In `astro dev`, Vite's dependency scanner reads every entry .astro file
 *   and tries to extract ESM imports. When it finds the literal text
 *   `<script type="application/ld+json">` inside a template body, it treats
 *   the whole .astro as a JS module — and the JSDoc comment in the
 *   frontmatter makes esbuild choke. To dodge that, we build the tag via
 *   string concatenation so the source never contains a literal `<script`
 *   token.
 *
 * Usage in a page / layout:
 *
 *   import { jsonLdScript } from '@/utils/jsonld';
 *   <Fragment set:html={jsonLdScript({ '@type': 'Organization', name: 'Paper Scanner' })} />
 */
const TAG_OPEN = '<' + 'script type="application/ld+json">';
const TAG_CLOSE = '</' + 'script>';

export type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

export function jsonLdScript(
  data: JsonLdData,
  context = 'https://schema.org'
): string {
  const arr = Array.isArray(data) ? data : [data];
  const body = JSON.stringify(arr.map((d) => ({ '@context': context, ...d })));
  return TAG_OPEN + body + TAG_CLOSE;
}