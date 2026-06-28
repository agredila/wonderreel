'use client';

import * as React from 'react';
import { toAbsoluteAssetUrl } from '@/lib/api';

const durationCache = new Map<string, number>();
const durationListeners = new Set<() => void>();

function notifyDurationListeners() {
  durationListeners.forEach((listener) => listener());
}

function resolveVideoSrc(videoUrl: string | undefined) {
  return videoUrl ? toAbsoluteAssetUrl(videoUrl) : '';
}

function setCachedDuration(src: string, seconds: number) {
  const next = Math.round(seconds);
  if (next <= 0 || durationCache.get(src) === next) return;
  durationCache.set(src, next);
  notifyDurationListeners();
}

export function formatDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/** YouTube-style timestamp badge (e.g. 0:30, 1:05:02). */
export function formatDurationBadge(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function rememberVideoDuration(videoUrl: string | undefined, seconds: number) {
  const src = resolveVideoSrc(videoUrl);
  if (!src) return;
  setCachedDuration(src, seconds);
}

export function getCachedVideoDuration(videoUrl: string | undefined, fallbackSeconds: number) {
  const src = resolveVideoSrc(videoUrl);
  if (!src) return fallbackSeconds;
  return durationCache.get(src) ?? fallbackSeconds;
}

export function useVideoDuration(videoUrl: string | undefined, fallbackSeconds: number) {
  const src = resolveVideoSrc(videoUrl);
  const [seconds, setSeconds] = React.useState(() => getCachedVideoDuration(videoUrl, fallbackSeconds));

  React.useEffect(() => {
    const syncFromCache = () => {
      if (!src) return;
      const cached = durationCache.get(src);
      if (cached != null) setSeconds(cached);
    };

    durationListeners.add(syncFromCache);
    return () => {
      durationListeners.delete(syncFromCache);
    };
  }, [src]);

  React.useEffect(() => {
    if (!src) {
      setSeconds(fallbackSeconds);
      return;
    }

    const cached = durationCache.get(src);
    if (cached != null) {
      setSeconds(cached);
      return;
    }

    let cancelled = false;
    const video = document.createElement('video');
    video.preload = 'metadata';

    const finish = (value: number) => {
      if (cancelled) return;
      if (value > 0) {
        setCachedDuration(src, value);
      } else {
        setSeconds(fallbackSeconds);
      }
      video.removeAttribute('src');
      video.load();
    };

    video.addEventListener('loadedmetadata', () => finish(video.duration), { once: true });
    video.addEventListener('error', () => finish(0), { once: true });
    video.src = src;

    return () => {
      cancelled = true;
      video.removeAttribute('src');
      video.load();
    };
  }, [src, fallbackSeconds]);

  return seconds;
}
