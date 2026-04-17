/**
 * Harmonic saturation index — diminishing returns of chord complexity.
 *
 * After a threshold of unique pitch classes, adding more notes blurs
 * rather than enriches. This module detects when chord complexity has
 * reached its perceptual ceiling and signals when simplification
 * creates more impact than further addition.
 *
 * Applied as a chord-extension gate and simplification impact bonus.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood maximum useful complexity (pitch class count).
 * Beyond this, additional notes create diminishing returns.
 */
const MAX_USEFUL_COMPLEXITY: Record<Mood, number> = {
  trance:    5.0,   // triads + 7th + 9th max
  avril:     6.0,   // rich classical voicings
  disco:     4.5,   // clean funk voicings
  downtempo: 5.5,   // moderate richness
  blockhead: 4.0,   // simple hip-hop chords
  lofi:      6.5,   // jazz richness (9ths, 11ths)
  flim:      5.5,   // moderate
  xtal:      5.0,   // moderate — clarity over density
  syro:      7.0,   // highest — IDM loves complex harmony
  ambient:   4.0,   // simple — open voicings,
  plantasia: 4.0,
};

/**
 * Per-mood simplification impact (bonus for reducing complexity when saturated).
 */
const SIMPLIFICATION_IMPACT: Record<Mood, number> = {
  trance:    0.45,  // moderate
  avril:     0.55,  // strong — dramatic simplification
  disco:     0.40,  // moderate
  downtempo: 0.50,  // strong
  blockhead: 0.35,  // moderate
  lofi:      0.60,  // strongest — jazz tension/release
  flim:      0.50,  // strong
  xtal:      0.45,  // moderate
  syro:      0.30,  // weaker — IDM prefers complexity
  ambient:   0.65,  // very strong — simplicity is powerful,
  plantasia: 0.65,
};

/**
 * Calculate harmonic complexity score from pitch classes.
 *
 * @param pitchClasses Array of pitch class numbers (0-11)
 * @returns Complexity score (0-12)
 */
export function harmonicComplexity(pitchClasses: number[]): number {
  const unique = new Set(pitchClasses);
  return unique.size;
}

/**
 * Calculate saturation level — how close to diminishing returns.
 * Returns 0 below threshold, rises sharply above it.
 *
 * @param complexity Complexity score from harmonicComplexity()
 * @param mood Current mood
 * @returns Saturation 0-1 (0 = room to grow, 1 = fully saturated)
 */
export function complexitySaturation(
  complexity: number,
  mood: Mood
): number {
  const maxUseful = MAX_USEFUL_COMPLEXITY[mood];
  if (complexity <= maxUseful * 0.65) return 0;
  // Sigmoid-like ramp above threshold
  const excess = (complexity - maxUseful * 0.65) / (maxUseful * 0.35);
  return Math.min(1, excess * excess);
}

/**
 * Should the chord be simplified?
 *
 * @param complexity Current complexity score
 * @param mood Current mood
 * @param section Current section
 * @returns Whether simplification would be beneficial
 */
export function shouldSimplifyChord(
  complexity: number,
  mood: Mood,
  section: Section
): boolean {
  const saturation = complexitySaturation(complexity, mood);
  // More likely to simplify in breakdowns/intros
  const sectionBonus = section === 'breakdown' || section === 'intro' ? 0.15 : 0;
  return saturation + sectionBonus > 0.5;
}

/**
 * Calculate impact bonus when simplifying a saturated chord.
 *
 * @param prevComplexity Previous chord complexity
 * @param newComplexity Simplified chord complexity
 * @param mood Current mood
 * @returns Impact bonus 0-1 (used as gain/brightness boost)
 */
export function simplificationImpactBonus(
  prevComplexity: number,
  newComplexity: number,
  mood: Mood
): number {
  if (newComplexity >= prevComplexity) return 0;
  const prevSat = complexitySaturation(prevComplexity, mood);
  if (prevSat < 0.2) return 0; // wasn't saturated — no impact
  const reduction = (prevComplexity - newComplexity) / prevComplexity;
  return reduction * prevSat * SIMPLIFICATION_IMPACT[mood];
}

/**
 * Get max useful complexity for a mood (for testing).
 */
export function maxUsefulComplexity(mood: Mood): number {
  return MAX_USEFUL_COMPLEXITY[mood];
}
