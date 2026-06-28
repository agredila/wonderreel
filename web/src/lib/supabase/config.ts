export function isPlaceholderEnvValue(value?: string) {
  if (!value?.trim()) return true;
  const v = value.trim().toLowerCase();
  return (
    v.includes('your-') ||
    v.includes('placeholder') ||
    v === 'https://your-project.supabase.co'
  );
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && key && !isPlaceholderEnvValue(url) && !isPlaceholderEnvValue(key));
}

/** Drop leftover browser session keys when running without Supabase. */
export function clearSupabaseLocalSession() {
  if (typeof localStorage === 'undefined') return;
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
      localStorage.removeItem(key);
    }
  }
}
