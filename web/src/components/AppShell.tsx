'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthToken, signOut } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { useChildProfile } from '@/lib/useChildProfile';
import { enterKidMode } from '@/lib/kidMode';
import { useGateUnlocked } from '@/components/ParentalGate';
import { LanguageMenu } from '@/components/LanguageMenu';

type Props = {
  children: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export function AppShell({ children }: Props) {
  const t = useTranslations('home');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAuthToken();
  const supabaseConfigured = isSupabaseConfigured();
  const authed = supabaseConfigured && Boolean(token);
  const { childName } = useChildProfile();
  const { lock } = useGateUnlocked();

  const nav: NavItem[] = [
    { href: `/${locale}/dashboard`, label: t('nav_home'), icon: '🏠' },
    { href: `/${locale}/gallery`, label: t('nav_lessons'), icon: '🎬' },
    { href: `/${locale}/about`, label: t('nav_about'), icon: 'ℹ️' }
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  function handleHandToChild() {
    enterKidMode();
    lock();
    router.push(`/${locale}/kid`);
  }

  function handleSignOut() {
    void signOut().then(() => {
      window.location.href = `/${locale}/login`;
    });
  }

  return (
    <>
      <nav className="nav-bar">
        <div className="nav-container">
          <Link href={`/${locale}/dashboard`} className="nav-brand">
            <span className="logo-text">WonderReel</span>
          </Link>
          <div className="nav-links">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${isActive(item.href) ? ' active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="nav-tools nav-tools--compact">
            {authed ? (
              <button
                type="button"
                className="btn btn-sm btn-teal handoff-nav-btn"
                onClick={handleHandToChild}
                title={childName ? t('hand_to_child', { name: childName }) : undefined}
              >
                {t('kid_mode')}
              </button>
            ) : null}
            {!authed ? (
              <Link href={`/${locale}/login`} className="btn btn-sm btn-secondary nav-auth-btn">
                {t('sign_in')}
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-secondary nav-auth-btn"
                onClick={handleSignOut}
              >
                {t('sign_out')}
              </button>
            )}
            <LanguageMenu />
          </div>
        </div>
      </nav>

      <nav className="bottom-nav">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item${isActive(item.href) ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <main className="main-content">{children}</main>
    </>
  );
}
