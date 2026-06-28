'use client';

import { useTranslations } from 'next-intl';
import { VideoThumbnail } from '@/components/VideoThumbnail';
import { lessonTitle, type CatalogLesson } from '@/lib/catalog';
import { formatDurationBadge, useVideoDuration } from '@/lib/useVideoDuration';

type Props = {
  lesson: CatalogLesson;
  locale: string;
  channelLabel: string;
  variant: 'catalog' | 'yours';
  verified?: boolean;
  onSelect: (lesson: CatalogLesson) => void;
};

export function FilmCatalogCard({
  lesson,
  locale,
  channelLabel,
  variant,
  verified = false,
  onSelect
}: Props) {
  const t = useTranslations('home');
  const durationSec = useVideoDuration(lesson.videoUrl, lesson.duration);
  const title = lessonTitle(lesson, locale);
  const metaKind = variant === 'yours' ? t('catalog_meta_yours') : t('catalog_meta_sample');
  const metaLabel = `${metaKind} • ${formatDurationBadge(durationSec)}`;

  function handleOpen() {
    onSelect(lesson);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpen();
    }
  }

  return (
    <article
      className="yt-film-card"
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
    >
      <div className="yt-film-thumb">
        <VideoThumbnail videoUrl={lesson.videoUrl} fallbackEmoji={lesson.emoji} showPlayHint={false} />
        <span className="yt-film-duration">{formatDurationBadge(durationSec)}</span>
      </div>
      <div className="yt-film-meta">
        <div className="yt-film-avatar" aria-hidden>
          {lesson.emoji}
        </div>
        <div className="yt-film-info">
          <h3 className="yt-film-title">{title}</h3>
          <p className="yt-film-channel">
            {channelLabel}
            {verified ? <span className="yt-film-verified" aria-label={t('catalog_verified')}>✓</span> : null}
          </p>
          <p className="yt-film-stats">{metaLabel}</p>
        </div>
        <button
          type="button"
          className="yt-film-menu"
          aria-label={t('catalog_menu')}
          onClick={(event) => event.stopPropagation()}
        >
          ⋮
        </button>
      </div>
    </article>
  );
}
