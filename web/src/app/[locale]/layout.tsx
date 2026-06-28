import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ClientProviders } from '@/components/ClientProviders';
import { LocaleDocumentAttributes } from '@/components/LocaleDocumentAttributes';
import { routing, type Locale } from '@/i18n/routing';
import '../../styles/wonderreel.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ClientProviders>
        <LocaleDocumentAttributes locale={locale} />
        {children}
      </ClientProviders>
    </NextIntlClientProvider>
  );
}
