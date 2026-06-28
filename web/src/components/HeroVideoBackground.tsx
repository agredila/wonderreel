'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { ProtectedVideo } from '@/components/ProtectedVideo';
import { toAbsoluteAssetUrl } from '@/lib/api';
import { HERO_POSTER_SRC, HERO_VIDEO_FALLBACKS, HERO_VIDEO_SRC } from '@/lib/heroMedia';

export function HeroVideoBackground() {
  const t = useTranslations('home');
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = React.useState(true);
  const [soundBlocked, setSoundBlocked] = React.useState(false);
  const [videoSrc, setVideoSrc] = React.useState(() => toAbsoluteAssetUrl(HERO_VIDEO_SRC));
  const [fallbackIndex, setFallbackIndex] = React.useState(-1);
  const [showPoster, setShowPoster] = React.useState(false);

  function handleVideoError() {
    const next = fallbackIndex + 1;
    if (next < HERO_VIDEO_FALLBACKS.length) {
      setFallbackIndex(next);
      setVideoSrc(toAbsoluteAssetUrl(HERO_VIDEO_FALLBACKS[next]));
      return;
    }
    setShowPoster(true);
  }

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || showPoster) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    video.loop = true;
    video.playsInline = true;

    const tryPlay = async () => {
      if (motionQuery.matches) {
        video.pause();
        return;
      }

      video.muted = false;
      try {
        await video.play();
        setMuted(false);
        setSoundBlocked(false);
        return;
      } catch {
        /* Autoplay with sound blocked — fall back to muted playback */
      }

      video.muted = true;
      setMuted(true);
      setSoundBlocked(true);
      try {
        await video.play();
      } catch {
        /* user can enable via sound toggle */
      }
    };

    const onMotionChange = () => {
      if (motionQuery.matches) {
        video.pause();
        return;
      }
      void tryPlay();
    };

    void tryPlay();
    motionQuery.addEventListener('change', onMotionChange);

    const onVisibility = () => {
      if (document.hidden || motionQuery.matches) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      motionQuery.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [showPoster]);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      video.muted = false;
      video.volume = 1;
      void video.play().then(() => {
        setMuted(false);
        setSoundBlocked(false);
      }).catch(() => {
        video.muted = true;
        setMuted(true);
        setSoundBlocked(true);
      });
      return;
    }

    video.muted = true;
    setMuted(true);
  }

  return (
    <>
      <div className="hero-netflix-media">
        {showPoster ? (
          <img
            className="hero-netflix-video hero-netflix-poster"
            src={HERO_POSTER_SRC}
            alt=""
            aria-hidden
          />
        ) : (
          <ProtectedVideo
            ref={videoRef}
            className="hero-netflix-video"
            src={videoSrc}
            poster={HERO_POSTER_SRC}
            autoPlay
            loop
            playsInline
            muted={muted}
            preload="auto"
            aria-label={t('hero_video_label')}
            onError={handleVideoError}
          />
        )}
        <div className="hero-netflix-scrim" aria-hidden />
      </div>
      {!showPoster && (
        <>
          <button
            type="button"
            className="hero-sound-toggle btn btn-secondary btn-sm"
            onClick={toggleSound}
            aria-pressed={!muted}
            aria-label={muted ? t('hero_sound_on') : t('hero_sound_off')}
          >
            {muted ? t('hero_sound_on') : t('hero_sound_off')}
          </button>
          {soundBlocked && muted && (
            <span className="hero-sound-hint">{t('hero_sound_hint')}</span>
          )}
        </>
      )}
    </>
  );
}
