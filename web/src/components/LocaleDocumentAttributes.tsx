'use client';

import * as React from 'react';

type Props = {
  locale: string;
};

export function LocaleDocumentAttributes({ locale }: Props) {
  React.useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  return null;
}
