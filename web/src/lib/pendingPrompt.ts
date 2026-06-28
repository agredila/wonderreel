const PROMPT_KEY = 'wonderreel_pending_prompt';
const STRUCTURE_KEY = 'wonderreel_pending_structure';
const CATEGORY_KEY = 'wonderreel_pending_category';
const POST_AUTH_PATH_KEY = 'wonderreel_post_auth_path';

import type { CreateIntent, StoryStructure } from '@/shared/viewerDefaults';

export function saveCreateIntent(intent: CreateIntent) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(PROMPT_KEY, intent.prompt);
  sessionStorage.setItem(STRUCTURE_KEY, intent.structure);
  sessionStorage.setItem(CATEGORY_KEY, intent.category);
}

export function loadCreateIntent(): CreateIntent | null {
  if (typeof sessionStorage === 'undefined') return null;
  const prompt = sessionStorage.getItem(PROMPT_KEY);
  if (!prompt) return null;
  const structure = (sessionStorage.getItem(STRUCTURE_KEY) as StoryStructure) || 'single';
  const category = sessionStorage.getItem(CATEGORY_KEY) || 'general';
  return { prompt, structure, category };
}

export function clearCreateIntent() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(PROMPT_KEY);
  sessionStorage.removeItem(STRUCTURE_KEY);
  sessionStorage.removeItem(CATEGORY_KEY);
}

export function setPostAuthPath(path: string) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(POST_AUTH_PATH_KEY, path);
}

export function consumePostAuthPath(fallback: string): string {
  if (typeof sessionStorage === 'undefined') return fallback;
  const path = sessionStorage.getItem(POST_AUTH_PATH_KEY) || fallback;
  sessionStorage.removeItem(POST_AUTH_PATH_KEY);
  return path;
}
