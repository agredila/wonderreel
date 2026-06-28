'use client';

import { useTranslations } from 'next-intl';
import { FilmCatalogCard } from '@/components/FilmCatalogCard';
import { CATALOG_LESSONS, type CatalogLesson } from '@/lib/catalog';

type Props = {
  lessons: CatalogLesson[];
  locale: string;
  onSelect: (lesson: CatalogLesson) => void;
  subtitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  channelLabel?: string;
  variant?: 'catalog' | 'yours';
  verifiedChannel?: boolean;
};

export function FilmCatalogGrid({
  lessons,
  locale,
  onSelect,
  subtitle,
  emptyTitle,
  emptyDescription,
  channelLabel,
  variant = 'catalog',
  verifiedChannel = false
}: Props) {
  const t = useTranslations('home');
  const channel = channelLabel ?? t('catalog_by_wonderreel');

  return (
    <section className="landing-catalog fade-in delay-2">
      {subtitle ? <p className="landing-catalog-subtitle landing-catalog-subtitle--inline">{subtitle}</p> : null}
      {lessons.length === 0 ? (
        emptyTitle ? (
          <div className="landing-catalog-empty">
            <p className="landing-catalog-empty-title">{emptyTitle}</p>
            {emptyDescription ? <p className="landing-catalog-subtitle">{emptyDescription}</p> : null}
          </div>
        ) : null
      ) : (
        <div className="film-catalog-grid">
          {lessons.map((lesson) => (
            <FilmCatalogCard
              key={lesson.id}
              lesson={lesson}
              locale={locale}
              channelLabel={channel}
              variant={variant}
              verified={verifiedChannel || lesson.source === 'catalog'}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function PublicSampleCatalog({
  locale,
  onSelect,
  subtitle
}: {
  locale: string;
  onSelect: (lesson: CatalogLesson) => void;
  subtitle?: string;
}) {
  const t = useTranslations('home');
  return (
    <FilmCatalogGrid
      lessons={CATALOG_LESSONS}
      locale={locale}
      onSelect={onSelect}
      subtitle={subtitle ?? t('catalog_subtitle')}
      verifiedChannel
    />
  );
}
