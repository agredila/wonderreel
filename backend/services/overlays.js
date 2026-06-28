/**
 * Phase 2: overlay clean digits/letters as real text during assembly.
 * PixVerse renders the scene; this metadata drives post-production overlays.
 */

export function buildNumberOverlays(numbers, language) {
  return numbers.map((n, i) => ({
    text: n,
    x: 0.2 + i * 0.25,
    y: 0.5,
    startSec: i * 2,
    endSec: i * 2 + 1.5,
    language,
  }));
}

export function buildAlphabetOverlays(letters, language) {
  return letters.map((l, i) => ({
    text: l,
    x: 0.15 + i * 0.28,
    y: 0.45,
    startSec: i * 2,
    endSec: i * 2 + 1.5,
    language,
  }));
}
