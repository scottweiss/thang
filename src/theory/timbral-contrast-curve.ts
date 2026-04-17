/**
 * Timbral contrast curve — FM depth follows a section-level arc.
 *
 * Within each section, timbre evolves from pure (low FM) to complex
 * (high FM) and back, creating a sonic narrative independent of
 * volume or harmony changes. This prevents timbral stasis.
 *
 * Applied as an FM depth multiplier per section progress.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood timbral contrast range (0 = flat, 1 = dramatic FM arc).
 */
const CONTRAST_RANGE: Record<Mood, number> = {
  trance:    0.40,  // moderate — pad evolution
  avril:     0.30,  // moderate — subtle timbral shifts
  disco:     0.35,  // moderate
  downtempo: 0.45,  // strong — slow evolution
  blockhead: 0.50,  // strong — gritty build
  lofi:      0.35,  // moderate
  flim:      0.55,  // strong — Aphex timbral play
  xtal:      0.60,  // strongest — ambient morphing
  syro:      0.50,  // strong — IDM timbre exploration
  ambient:   0.45,  // strong — slow morph,
  plantasia: 0.45,
};

/**
 * Section shape — where the timbral peak falls.
 * 0 = start, 0.5 = middle, 1.0 = end.
 */
const SECTION_PEAK: Record<Section, number> = {
  intro:     0.7,   // builds toward end
  build:     0.8,   // peaks late — drives toward transition
  peak:      0.4,   // peaks early — then settles
  breakdown: 0.3,   // peaks early — then simplifies
  groove:    0.5,   // centered
};

/**
 * Calculate FM depth multiplier based on section progress.
 *
 * @param progress Section progress (0.0 - 1.0)
 * @param mood Current mood
 * @param section Current section
 * @returns FM multiplier (0.7 - 1.5)
 */
export function timbralContrastMultiplier(
  progress: number,
  mood: Mood,
  section: Section
): number {
  const range = CONTRAST_RANGE[mood];
  const peak = SECTION_PEAK[section];
  // Gaussian-like curve centered on section peak
  const dist = Math.abs(progress - peak);
  const curve = Math.exp(-dist * dist * 8);
  // Base is slightly below 1.0, peaks above 1.0
  return (1.0 - range * 0.3) + curve * range * 0.5;
}

/**
 * Get contrast range for a mood (for testing).
 */
export function contrastRange(mood: Mood): number {
  return CONTRAST_RANGE[mood];
}

/**
 * Should timbral contrast be applied?
 */
export function shouldApplyTimbralContrast(mood: Mood): boolean {
  return CONTRAST_RANGE[mood] > 0.10;
}
