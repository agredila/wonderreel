const MAX_STORY_LENGTH = 2000;

const INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior) instructions/i,
  /system prompt/i,
  /you are now/i,
  /jailbreak/i
];

export function sanitizeStoryInput(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { ok: false, error: 'Story text is required' };
  }
  const trimmed = rawText.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'Story text is required' };
  }
  if (trimmed.length > MAX_STORY_LENGTH) {
    return { ok: false, error: `Story must be under ${MAX_STORY_LENGTH} characters` };
  }
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { ok: false, error: 'Story contains disallowed instructions' };
    }
  }
  return { ok: true, text: trimmed.replace(/<[^>]+>/g, '') };
}
