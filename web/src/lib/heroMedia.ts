/** Hero background video — generated/stored under repo `assets/videos/`, proxied via `/assets/`. */
export const HERO_VIDEO_SRC =
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim() || '/assets/videos/hero-wonderreel.mp4';

/** Fallback paths tried if the primary hero video is missing. */
export const HERO_VIDEO_FALLBACKS = ['/videos/hero-wonderreel.mp4'];

export const HERO_POSTER_SRC = '/images/hero-bg.jpg';
