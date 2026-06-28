'use client';

import * as React from 'react';

/** Kid Mode deterrents — pauses when the tab loses focus. Cannot block OS screen recorders. */
export function usePlaybackProtection(videoRef: React.RefObject<HTMLVideoElement | null>, enabled = true) {
  React.useEffect(() => {
    if (!enabled) return;

    const pauseIfPlaying = () => {
      const video = videoRef.current;
      if (video && !video.paused) video.pause();
    };

    const onVisibility = () => {
      if (document.hidden) pauseIfPlaying();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', pauseIfPlaying);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', pauseIfPlaying);
    };
  }, [enabled, videoRef]);
}
