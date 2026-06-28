'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthToken, useActiveChild } from '@/lib/auth';
import { fetchFilms, type Film } from '@/lib/api';
import { ensureViewerProfile } from '@/application/ensureViewer';

export function KidLibraryPageClient() {
  const t = useTranslations('kid');
  const tApp = useTranslations('app');
  const locale = useLocale();
  const router = useRouter();
  const { token, loading: authLoading } = useAuthToken();
  const { childId, setChildId } = useActiveChild();
  const [films, setFilms] = React.useState<Film[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace(`/${locale}/dashboard`);
      return;
    }
    ensureViewerProfile({ token, locale, existingChildId: childId }).then((res) => {
      if (!res.ok) {
        setLoading(false);
        return;
      }
      setChildId(res.child.id);
      fetchFilms(token, res.child.id, 'approved').then((r) => {
        setFilms(r.data || []);
        setLoading(false);
      });
    });
  }, [authLoading, token, childId, locale, router, setChildId]);

  return (
    <div className="kid-library">
      <header className="kid-library-header fade-in">
        <div>
          <h1 className="kid-library-title">{tApp('name')}</h1>
          <p className="kid-library-subtitle">{t('library')}</p>
        </div>
      </header>

      {loading ? (
        <p className="kid-mode-loading">{t('library')}…</p>
      ) : films.length === 0 ? (
        <div className="kid-empty-card fade-in">
          <span className="kid-empty-icon">🎬</span>
          <p>{t('empty')}</p>
        </div>
      ) : (
        <div className="kid-film-grid fade-in delay-1">
          {films.map((film) => {
            const title = film.title[locale] || film.title.en || 'Film';
            return (
              <Link key={film.id} href={`/${locale}/kid/${film.id}`} className="kid-film-tile">
                <div className="kid-film-thumb">
                  {film.is_starter ? '📚' : '🎬'}
                </div>
                <p className="kid-film-title">{title}</p>
                <p className="kid-film-play">{t('play')}</p>
              </Link>
            );
          })}
        </div>
      )}

      <footer className="kid-library-footer">
        <p>{tApp('tagline')}</p>
      </footer>
    </div>
  );
}
