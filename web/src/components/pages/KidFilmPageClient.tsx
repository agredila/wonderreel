'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthToken, useActiveChild } from '@/lib/auth';
import { fetchFilms, type Film } from '@/lib/api';
import { KidPlayer } from '@/components/KidPlayer';

type Props = {
  filmId: string;
};

export function KidFilmPageClient({ filmId }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const { token } = useAuthToken();
  const { childId } = useActiveChild();
  const [film, setFilm] = React.useState<Film | null>(null);
  const [nextId, setNextId] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (!childId) return;
    fetchFilms(token, childId, 'approved').then((res) => {
      const list = res.data || [];
      const current = list.find((f) => f.id === filmId);
      setFilm(current || null);
      const idx = list.findIndex((f) => f.id === filmId);
      if (idx >= 0 && idx < list.length - 1) setNextId(list[idx + 1].id);
    });
  }, [token, childId, filmId]);

  if (!film || !childId) return null;

  return (
    <KidPlayer
      film={film}
      locale={locale}
      token={token}
      childId={childId}
      nextFilmId={nextId}
      onHome={() => router.push(`/${locale}/kid`)}
      onPlayNext={(id) => router.push(`/${locale}/kid/${id}`)}
    />
  );
}
