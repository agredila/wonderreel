'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';

const LABELS: Record<string, string> = {
  en: 'English',
  id: 'Bahasa',
  zh: '中文',
  ar: 'العربية'
};

function GlobeIcon() {
  return (
    <svg
      className="nav-lang-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function LanguageMenu() {
  const t = useTranslations('home');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function switchLocale(next: string) {
    const segments = pathname.split('/');
    segments[1] = next;
    router.replace(segments.join('/'));
    setOpen(false);
  }

  return (
    <div className="nav-menu nav-lang-menu" ref={rootRef} data-open={open || undefined}>
      <button
        type="button"
        className="btn btn-sm btn-secondary nav-lang-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('nav_language_label')}
        onClick={() => setOpen((v) => !v)}
      >
        <GlobeIcon />
      </button>
      <div className="nav-menu-panel" role="menu">
        <p className="nav-menu-section-label">{t('nav_menu_language')}</p>
        <ul className="nav-menu-list">
          {routing.locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={locale === l}
                className={`nav-menu-item${locale === l ? ' active' : ''}`}
                onClick={() => switchLocale(l)}
              >
                {LABELS[l]}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
