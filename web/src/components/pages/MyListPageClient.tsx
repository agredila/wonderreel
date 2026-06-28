'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { LessonTile } from '@/components/LessonTile';
import { VideoModal } from '@/components/VideoModal';
import { CATALOG_LESSONS, filmToLesson, mergeLessons, type CatalogLesson } from '@/lib/catalog';
import { getMyListIds } from '@/lib/mylist';
import { fetchFilms } from '@/lib/api';
import { useParentAccess } from '@/lib/useParentAccess';

export function MyListPageClient() {
  const t = useTranslations('home');
  const locale = useLocale();
  const { token, childId, ready, needsLogin } = useParentAccess();
  const [lessons, setLessons] = React.useState<CatalogLesson[]>([]);
  const [modal, setModal] = React.useState<CatalogLesson | null>(null);
  const [myListIds, setMyListIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    setMyListIds(getMyListIds());
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    const load = async () => {
      let all = [...CATALOG_LESSONS];
      if (childId) {
        const res = await fetchFilms(token, childId, 'approved');
        all = mergeLessons(CATALOG_LESSONS, (res.data || []).map(filmToLesson));
      }
      setLessons(all.filter((l) => myListIds.includes(l.id)));
    };
    load();
  }, [ready, token, childId, myListIds]);

  if (needsLogin) {
    return (
      <section className="section active">
        <div className="container empty-state">
          <h1 className="page-title">{t('mylist_title')}</h1>
          <p>{t('signup_prompt')}</p>
          <Link href={`/${locale}/login`} className="btn btn-primary">{t('sign_in_create')}</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section active">
      <div className="container">
        <div className="section-header fade-in">
          <h1 className="page-title">{t('mylist_title')}</h1>
          <p className="page-subtitle">{t('mylist_subtitle')}</p>
        </div>
        {lessons.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">💔</div>
            <h3>{t('mylist_empty_title')}</h3>
            <p>{t('mylist_empty_desc')}</p>
            <Link href={`/${locale}/gallery`} className="btn btn-primary">{t('mylist_browse')}</Link>
          </div>
        ) : (
          <div className="lessons-grid">
            {lessons.map((lesson) => (
              <LessonTile key={lesson.id} lesson={lesson} locale={locale} onClick={() => setModal(lesson)} />
            ))}
          </div>
        )}
      </div>
      <VideoModal lesson={modal} locale={locale} onClose={() => setModal(null)} />
    </section>
  );
}
