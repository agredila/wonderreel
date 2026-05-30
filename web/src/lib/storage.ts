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

export type VideoMeta = {
  saved: boolean;
  likes: number;
  purchased: boolean;
  comments: Array<{ id: string; text: string; createdAt: string }>;
};

type StorageShape = {
  lang: string;
  videos: VideoItem[];
  metaById: Record<string, VideoMeta>;
};

const STORAGE_KEY = 'wonderreel_web';

const DEFAULT_META: VideoMeta = {
  saved: false,
  likes: 0,
  purchased: false,
  comments: []
};

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
    return { lang: 'en', videos: [], metaById: {} };
  }
  const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY));
  return parsed ?? { lang: 'en', videos: [], metaById: {} };
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

export function ensureMeta(videoId: string) {
  const store = loadStore();
  const meta = store.metaById[videoId] ?? DEFAULT_META;
  const next = { ...store, metaById: { ...store.metaById, [videoId]: meta } };
  saveStore(next);
  return meta;
}

export function updateMeta(videoId: string, updater: (prev: VideoMeta) => VideoMeta) {
  const store = loadStore();
  const prev = store.metaById[videoId] ?? DEFAULT_META;
  const nextMeta = updater(prev);
  const next = { ...store, metaById: { ...store.metaById, [videoId]: nextMeta } };
  saveStore(next);
  return nextMeta;
}

export function setLang(lang: string) {
  const store = loadStore();
  const next = { ...store, lang };
  saveStore(next);
  return next;
}

