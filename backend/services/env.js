export function isPlaceholderEnvValue(value) {
  if (!value || !String(value).trim()) return true;
  const v = String(value).trim().toLowerCase();
  return (
    v.includes('your-') ||
    v.includes('placeholder') ||
    v === 'https://your-project.supabase.co'
  );
}
