import type { PromptCategory } from '@/lib/prompts';

export type VideoItem = {
  id: string;
  title: string;
  prompt: string;
  category: PromptCategory;
  duration: number;
  videoUrl: string;
  createdAt: string;
  source: 'demo' | 'generated';
};

type StorageShape = {
  lang: string;
  videos: VideoItem[];
};

const STORAGE_KEY = 'wonderreel_web';

function safeParse(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StorageShape;
  } catch {
    return null;
  }
}

export function loadStore(): StorageShape {
  if (typeof window === 'undefined') {
    return { lang: 'en', videos: [] };
  }
  const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY));
  return parsed ?? { lang: 'en', videos: [] };
}

export function saveStore(next: StorageShape) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function upsertVideo(video: VideoItem) {
  const store = loadStore();
  const existingIdx = store.videos.findIndex((v) => v.id === video.id);
  const nextVideos = [...store.videos];
  if (existingIdx >= 0) nextVideos[existingIdx] = video;
  else nextVideos.unshift(video);
  const next = { ...store, videos: nextVideos };
  saveStore(next);
  return next;
}

export function setLang(lang: string) {
  const store = loadStore();
  const next = { ...store, lang };
  saveStore(next);
  return next;
}
