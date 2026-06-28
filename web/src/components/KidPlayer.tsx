'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import type { Film } from '@/lib/api';
import { trackProgress } from '@/lib/api';
import { ProtectedVideo } from '@/components/ProtectedVideo';
import { usePlaybackProtection } from '@/lib/usePlaybackProtection';

type Props = {
  film: Film;
  locale: string;
  token: string | null;
  childId: string;
  nextFilmId?: string;
  onHome: () => void;
  onPlayNext?: (id: string) => void;
};

const TAP_ITEMS = ['🌟', '🐢', '🌈', '🎵'];

export function KidPlayer({ film, locale, token, childId, nextFilmId, onHome, onPlayNext }: Props) {
  const t = useTranslations('kid');
  const [showRecap, setShowRecap] = React.useState(false);
  const [recapDone, setRecapDone] = React.useState(false);
  const title = film.title[locale] || film.title.en || 'Film';
  const videoRef = React.useRef<HTMLVideoElement>(null);
  usePlaybackProtection(videoRef, Boolean(film.video_url));

  React.useEffect(() => {
    trackProgress(token, { childId, filmId: film.id, event: 'started' });
  }, [token, childId, film.id]);

  function handleEnded() {
    setShowRecap(true);
    trackProgress(token, { childId, filmId: film.id, event: 'completed' });
  }

  function handleRecapComplete() {
    setRecapDone(true);
    trackProgress(token, { childId, filmId: film.id, event: 'recap_done' });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="flex items-center justify-between p-4">
        <button type="button" onClick={onHome} className="rounded-full bg-white/20 px-5 py-3 text-lg font-bold">
          {t('home')}
        </button>
        <span className="text-lg font-semibold">{title}</span>
        <div className="w-20" />
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        {film.video_url ? (
          <ProtectedVideo
            ref={videoRef}
            className="max-h-full max-w-full"
            src={film.video_url.startsWith('http') ? film.video_url : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}${film.video_url}`}
            controls
            autoPlay
            playsInline
            onEnded={handleEnded}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <span className="text-6xl">🎬</span>
            <p className="text-xl">{title}</p>
            <p className="text-white/60">Starter film — video coming soon</p>
            <button type="button" className="rounded-full bg-white px-6 py-3 text-black" onClick={handleEnded}>
              {t('play')}
            </button>
          </div>
        )}

        {!showRecap && (
          <div className="absolute bottom-24 flex gap-4">
            {TAP_ITEMS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="text-4xl transition-transform hover:scale-125"
                onClick={() => trackProgress(token, { childId, filmId: film.id, event: 'tap_learn' })}
                aria-label={t('tapLearn')}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {showRecap && !recapDone && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
          <div className="max-w-md rounded-3xl bg-white p-8 text-center text-black">
            <h3 className="text-2xl font-bold">{t('recapTitle')}</h3>
            <p className="mt-4 text-lg">{t('recapQuestion')}</p>
            <button type="button" className="mt-6 rounded-full bg-black px-8 py-4 text-lg font-bold text-white" onClick={handleRecapComplete}>
              👍
            </button>
          </div>
        </div>
      )}

      {recapDone && nextFilmId && onPlayNext && (
        <div className="p-4 text-center">
          <button type="button" className="rounded-full bg-white px-8 py-4 text-lg font-bold text-black" onClick={() => onPlayNext(nextFilmId)}>
            {t('playNext')}
          </button>
        </div>
      )}
    </div>
  );
}
