'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function AboutPageClient() {
  const t = useTranslations('about');
  const locale = useLocale();

  const steps = [
    { title: t('step1_title'), body: t('step1_body') },
    { title: t('step2_title'), body: t('step2_body') },
    { title: t('step3_title'), body: t('step3_body') }
  ];

  return (
    <section className="section active about-page">
      <div className="container">
        <div className="section-header fade-in">
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>

        <div className="about-intro fade-in delay-1">
          <p>{t('intro')}</p>
        </div>

        <div className="about-steps fade-in delay-2">
          <h2 className="about-section-title">{t('how_title')}</h2>
          <ol className="about-step-list">
            {steps.map((step) => (
              <li key={step.title} className="about-step-card">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="about-safety fade-in delay-2">
          <h2 className="about-section-title">{t('safety_title')}</h2>
          <p>{t('safety_body')}</p>
        </div>

        <div className="about-cta fade-in delay-3">
          <Link href={`/${locale}/dashboard`} className="btn btn-primary">
            {t('cta_home')}
          </Link>
        </div>
      </div>
    </section>
  );
}
