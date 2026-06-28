'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';

const LABELS: Record<string, string> = {
  en: 'English',
  id: 'Bahasa',
  zh: '中文',
  ar: 'العربية'
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    const segments = pathname.split('/');
    segments[1] = next;
    router.replace(segments.join('/'));
  }

  return (
    <select
      className="lang-select"
      value={locale}
      onChange={(e) => switchLocale(e.target.value)}
      aria-label="Language"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>{LABELS[l]}</option>
      ))}
    </select>
  );
}
