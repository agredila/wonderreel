/**
 * Phase 2: localized narration via Google Cloud TTS or Gemini TTS.
 * Phase 1 MVP uses video-only; this service generates caption/narration URLs when configured.
 */
export async function generateNarration(text, language) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { audioUrl: null, captions: [{ start: 0, end: 30, text }] };
  }
  // Placeholder: integrate Google Cloud Text-to-Speech in production
  return {
    audioUrl: null,
    captions: [{ start: 0, end: 30, text, language }]
  };
}

export async function generateCaptions(storyText, language, durationSec = 30) {
  const sentences = storyText.split(/[.!?。！？]/).filter(Boolean);
  const step = durationSec / Math.max(sentences.length, 1);
  return sentences.map((s, i) => ({
    start: i * step,
    end: (i + 1) * step,
    text: s.trim(),
    language
  }));
}
