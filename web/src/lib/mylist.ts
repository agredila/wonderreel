const MYLIST_KEY = 'wonderreel_mylist';

export function getMyListIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(MYLIST_KEY) || '[]') as string[];
  } catch {
    return [];
  }
}

export function toggleMyList(id: string): boolean {
  const ids = getMyListIds();
  const has = ids.includes(id);
  const next = has ? ids.filter((x) => x !== id) : [id, ...ids];
  localStorage.setItem(MYLIST_KEY, JSON.stringify(next));
  return !has;
}

export function isInMyList(id: string) {
  return getMyListIds().includes(id);
}
