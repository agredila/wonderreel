'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

type Props = {
  children: React.ReactNode;
  backHref?: string;
};

export function AuthBrandLayout({ children, backHref }: Props) {
  const t = useTranslations('app');
  const locale = useLocale();

  return (
    <div className="auth-brand-page">
      <div className="auth-brand-bg" aria-hidden />
      <div className="auth-brand-inner">
        <header className="auth-brand-header fade-in">
          <Link href={backHref ?? `/${locale}/dashboard`} className="nav-brand">
            <span className="logo-text">{t('name')}</span>
          </Link>
          <p className="auth-brand-tagline">{t('tagline')}</p>
        </header>
        <div className="auth-card fade-in delay-1">{children}</div>
      </div>
    </div>
  );
}
