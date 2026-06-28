import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

function deepMerge<T extends Record<string, unknown>>(base: T, override: Record<string, unknown>): T {
  const result = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(override)) {
    const b = base[key];
    const o = override[key];
    if (o && typeof o === 'object' && !Array.isArray(o) && b && typeof b === 'object') {
      result[key] = deepMerge(b as Record<string, unknown>, o as Record<string, unknown>);
    } else {
      result[key] = o;
    }
  }
  return result as T;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }
  const en = (await import('../../messages/en.json')).default;
  if (locale === 'en') {
    return { locale, messages: en };
  }
  const localized = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages: deepMerge(en, localized) };
});
