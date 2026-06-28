'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export function OnboardingPageClient() {
  const router = useRouter();
  const locale = useLocale();

  React.useEffect(() => {
    router.replace(`/${locale}/dashboard`);
  }, [locale, router]);

  return null;
}
