'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { consumePostAuthPath } from '@/lib/pendingPrompt';

export function AuthResumeClient() {
  const router = useRouter();
  const locale = useLocale();

  React.useEffect(() => {
    const fallback = `/${locale}/dashboard`;
    const path = consumePostAuthPath(fallback);
    router.replace(path);
  }, [locale, router]);

  return (
    <div className="auth-brand-page">
      <p className="kid-mode-loading">Loading…</p>
    </div>
  );
}
