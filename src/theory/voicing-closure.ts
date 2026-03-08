/**
 * Voicing closure — chord voicings tighten toward cadence points.
 *
 * As a phrase approaches resolution, voices converge inward —
 * outer voices move toward the center of the voicing. This creates
 * a sense of "closing in" that reinforces harmonic resolution.
 * The opposite happens at phrase openings: voices spread outward.
 *
 * Applied as a voicing spread modifier on harmony.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood closure intensity (0 = flat voicings, 1 = dramatic open/close).
 */
const CLOSURE_INTENSITY: Record<Mood, number> = {
  trance:    0.25,  // moderate — pad voicings shift subtly
  avril:     0.60,  // strong — classical voice convergence
  disco:     0.20,  // weak — consistent dance voicings
  downtempo: 0.40,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.55,  // strong — jazz voicing play
  flim:      0.35,  // moderate
  xtal:      0.45,  // strong — ambient breathing voicings
  syro:      0.20,  // weak — IDM voicings are unpredictable
  ambient:   0.50,  // strong — spacious opening/closing
};

/**
 * Section multiplier on closure.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.7,   // opening outward
  build:     1.0,
  peak:      1.2,   // tightest at climax
  breakdown: 0.8,   // opening back up
  groove:    1.0,
};

/**
 * Calculate voicing spread multiplier based on phrase position.
 * < 1.0 = tighter (closing), > 1.0 = wider (opening).
 *
 * @param phraseProgress Position within phrase (0.0 = start, 1.0 = end/cadence)
 * @param mood Current mood
 * @param section Current section
 * @returns Spread multiplier (0.85 - 1.15)
 */
export function closureSpread(
  phraseProgress: number,
  mood: Mood,
  section: Section
): number {
  const intensity = CLOSURE_INTENSITY[mood] * SECTION_MULT[section];
  // Opens wide at start, closes tight at end
  const curve = 1.0 - phraseProgress; // 1→0
  // Center at 1.0, spread outward at start, inward at end
  return 1.0 + (curve - 0.5) * intensity * 0.3;
}

/**
 * Get closure intensity for a mood (for testing).
 */
export function closureIntensity(mood: Mood): number {
  return CLOSURE_INTENSITY[mood];
}
