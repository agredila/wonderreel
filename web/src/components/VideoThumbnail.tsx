'use client';

import * as React from 'react';
import { toAbsoluteAssetUrl } from '@/lib/api';
import { ProtectedVideo } from '@/components/ProtectedVideo';
import { rememberVideoDuration } from '@/lib/useVideoDuration';

const PREVIEW_TIME = 0.35;

type Props = {
  videoUrl?: string;
  fallbackEmoji: string;
  className?: string;
  showPlayHint?: boolean;
};

export function VideoThumbnail({ videoUrl, fallbackEmoji, className, showPlayHint = true }: Props) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = React.useState(false);
  const src = videoUrl ? toAbsoluteAssetUrl(videoUrl) : '';
  const showFallback = !src || failed;

  React.useEffect(() => {
    if (showFallback) return;
    const video = videoRef.current;
    if (!video) return;

    const onMetadata = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        rememberVideoDuration(videoUrl, video.duration);
      }
    };

    const primeFrame = () => {
      const target = video.duration
        ? Math.min(PREVIEW_TIME, Math.max(0, video.duration - 0.05))
        : PREVIEW_TIME;
      if (Math.abs(video.currentTime - target) > 0.01) {
        video.currentTime = target;
      } else {
        video.pause();
      }
    };

    const onSeeked = () => video.pause();

    video.addEventListener('loadedmetadata', onMetadata);
    video.addEventListener('loadeddata', primeFrame);
    video.addEventListener('seeked', onSeeked);
    return () => {
      video.removeEventListener('loadedmetadata', onMetadata);
      video.removeEventListener('loadeddata', primeFrame);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [src, showFallback, videoUrl]);

  const wrapClass = ['video-thumb-wrap', className].filter(Boolean).join(' ');

  return (
    <div className={wrapClass} onContextMenu={(event) => event.preventDefault()}>
      {showFallback ? (
        <div className="video-thumb-fallback" aria-hidden>
          {fallbackEmoji}
        </div>
      ) : (
        <ProtectedVideo
          ref={videoRef}
          className="video-thumb"
          src={src}
          muted
          playsInline
          preload="metadata"
          aria-hidden
          onError={() => setFailed(true)}
        />
      )}
      {showPlayHint ? (
        <div className="play-overlay-thumb" aria-hidden>
          <span className="play-overlay-icon">▶</span>
        </div>
      ) : null}
    </div>
  );
}
