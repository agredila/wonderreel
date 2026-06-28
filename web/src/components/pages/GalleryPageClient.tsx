'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { LessonTile } from '@/components/LessonTile';
import { VideoModal } from '@/components/VideoModal';
import { CATALOG_LESSONS, filmToLesson, mergeLessons, type CatalogLesson } from '@/lib/catalog';
import { fetchFilms } from '@/lib/api';
import { useParentAccess } from '@/lib/useParentAccess';

const FILTERS = ['all', 'ocean', 'numbers', 'colors', 'animals', 'alphabet', 'general'] as const;

export function GalleryPageClient() {
  const t = useTranslations('home');
  const locale = useLocale();
  const { token, childId, ready } = useParentAccess();
  const [filter, setFilter] = React.useState<string>('all');
  const [lessons, setLessons] = React.useState<CatalogLesson[]>(CATALOG_LESSONS);
  const [modal, setModal] = React.useState<CatalogLesson | null>(null);

  React.useEffect(() => {
    if (!ready || !childId) return;
    fetchFilms(token, childId, 'approved').then((res) => {
      setLessons(mergeLessons(CATALOG_LESSONS, (res.data || []).map(filmToLesson)));
    });
  }, [ready, token, childId]);

  const filtered = filter === 'all' ? lessons : lessons.filter((l) => l.category === filter || l.tags.includes(filter));

  return (
    <section className="section active">
      <div className="container">
        <div className="section-header fade-in">
          <h1 className="page-title">{t('gallery_title')}</h1>
          <p className="page-subtitle">{t('gallery_subtitle')}</p>
        </div>
        <div className="filters fade-in delay-1">
          {FILTERS.map((f) => (
            <button key={f} type="button" className={`filter-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {t(`filter_${f}` as 'filter_all')}
            </button>
          ))}
        </div>
        <div className="lessons-grid">
          {filtered.map((lesson) => (
            <LessonTile key={lesson.id} lesson={lesson} locale={locale} onClick={() => setModal(lesson)} />
          ))}
        </div>
      </div>
      <VideoModal lesson={modal} locale={locale} onClose={() => setModal(null)} />
    </section>
  );
}
