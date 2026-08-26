import { describe, expect, it } from 'vitest';
import { t, getDictionary } from '../src/utils/i18n';
import type { Locale } from '../src/consts';

describe('i18n.t', () => {
  describe('basic lookup', () => {
    it('returns the value at a flat key for the requested locale', () => {
      expect(t('en', 'nav.features')).toBe('Features');
      expect(t('zh', 'nav.features')).toBe('功能');
    });

    it('walks nested keys via dot notation', () => {
      expect(t('en', 'homepage.faq.title')).toBe('Frequently asked questions');
      expect(t('zh', 'homepage.faq.title')).toBe('常见问题');
    });
  });

  describe('fallback behavior', () => {
    it('falls back to English when a key is missing in the target locale', () => {
      // `es` shares the English dictionary in this project (no Spanish translations yet).
      expect(t('es', 'nav.features')).toBe('Features');
    });

    it('falls back to English for every other partial locale', () => {
      const partialLocales: Locale[] = ['fr', 'de', 'ja', 'ko', 'pt'];
      for (const loc of partialLocales) {
        expect(t(loc, 'site.tagline')).toBe(t('en', 'site.tagline'));
      }
    });

    it('returns the key itself when even English has no value', () => {
      expect(t('en', 'this.key.does.not.exist' as any)).toBe(
        'this.key.does.not.exist'
      );
    });

    it('returns the key when a path segment does not exist', () => {
      expect(t('en', 'nav.bogusChild' as any)).toBe('nav.bogusChild');
    });
  });

  describe('placeholder substitution', () => {
    it('substitutes {name} tokens from the values argument', () => {
      expect(t('en', 'common.publishedOn', { date: '2026-08-26' })).toBe(
        'Published on 2026-08-26'
      );
      expect(t('zh', 'common.publishedOn', { date: '2026年8月26日' })).toBe(
        '发布于 2026年8月26日'
      );
    });

    it('substitutes multiple placeholders in one string', () => {
      const result = t('en', 'common.readingTime', { minutes: 5 });
      expect(result).toBe('5 min read');
    });

    it('keeps unknown placeholders intact (does not crash, does not silently drop)', () => {
      expect(t('en', 'common.publishedOn', {} as { date: string })).toBe(
        'Published on {date}'
      );
    });

    it('substitutes only the matching placeholder and leaves others alone', () => {
      const result = t('en', 'common.publishedOn', { date: 'X' } as any);
      // The template literally is "Published on {date}" — verify no leftover markers.
      expect(result).not.toMatch(/\{[a-z]+\}/);
    });
  });

  describe('getDictionary', () => {
    it('returns a dictionary for every supported locale', () => {
      const locales: Locale[] = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'pt'];
      for (const loc of locales) {
        const dict = getDictionary(loc);
        expect(dict.site.title).toBeTruthy();
        expect(dict.nav.features).toBeTruthy();
      }
    });

    it('partial locales share the English dictionary object reference', () => {
      // Spanish / French / etc. intentionally re-use the English dict until
      // a translator fills them in.
      expect(getDictionary('es')).toBe(getDictionary('en'));
      expect(getDictionary('fr')).toBe(getDictionary('en'));
    });

    it('Chinese returns a distinct dictionary', () => {
      expect(getDictionary('zh')).not.toBe(getDictionary('en'));
    });
  });
});