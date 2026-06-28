'use client';

import * as React from 'react';
import type { CatalogLesson } from '@/lib/catalog';
import { lessonDescription, lessonTitle } from '@/lib/catalog';
import { toAbsoluteAssetUrl } from '@/lib/api';
import { ProtectedVideo } from '@/components/ProtectedVideo';
import { formatDuration, getCachedVideoDuration, rememberVideoDuration } from '@/lib/useVideoDuration';

type Props = {
  lesson: CatalogLesson | null;
  locale: string;
  onClose: () => void;
};

export function VideoModal({ lesson, locale, onClose }: Props) {
  const [durationSec, setDurationSec] = React.useState(0);

  React.useEffect(() => {
    if (!lesson) return;
    setDurationSec(getCachedVideoDuration(lesson.videoUrl, lesson.duration));
  }, [lesson]);

  if (!lesson) return null;

  const activeLesson = lesson;
  const videoSrc = activeLesson.videoUrl ? toAbsoluteAssetUrl(activeLesson.videoUrl) : '';

  function handleLoadedMetadata(event: React.SyntheticEvent<HTMLVideoElement>) {
    const raw = event.currentTarget.duration;
    if (!Number.isFinite(raw) || raw <= 0) return;
    const sec = Math.round(raw);
    rememberVideoDuration(activeLesson.videoUrl, sec);
    setDurationSec(sec);
  }

  return (
    <div className="modal active" role="dialog" aria-modal="true">
      <div className="modal-content">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <div className="video-container">
          {videoSrc ? (
            <ProtectedVideo
              controls
              playsInline
              src={videoSrc}
              className="w-full"
              onLoadedMetadata={handleLoadedMetadata}
            />
          ) : (
            <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-ocean)', fontSize: '4rem' }}>
              {activeLesson.emoji}
            </div>
          )}
        </div>
        <div className="video-info">
          <h2>{lessonTitle(activeLesson, locale)}</h2>
          <p className="video-description">{lessonDescription(activeLesson, locale)}</p>
          <div className="video-meta">
            <span className="meta-item">⏱️ {formatDuration(durationSec)}</span>
            <span className="meta-item">📚 {activeLesson.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
