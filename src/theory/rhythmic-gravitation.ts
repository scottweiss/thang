/**
 * Rhythmic gravitation — notes tend toward metrically strong positions.
 *
 * In a measure, beat 1 has the strongest gravitational pull, beat 3 next,
 * then beats 2 and 4. Notes placed near strong beats get pulled toward them
 * (quantized tighter), while notes on weak beats are allowed to float.
 *
 * This creates a breathing quality where the groove tightens on strong beats
 * and loosens on weak beats — the opposite of mechanical quantization.
 *
 * Applied as a .nudge() correction per beat position.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood gravitation strength (higher = tighter snap to strong beats).
 */
const GRAVITATION_STRENGTH: Record<Mood, number> = {
  trance:    0.55,  // tight — 4/4 grid discipline
  avril:     0.40,  // moderate — classical rubato-like
  disco:     0.50,  // strong — dance groove
  downtempo: 0.35,  // moderate — lazy
  blockhead: 0.45,  // moderate — hip-hop pocket
  lofi:      0.30,  // weak — jazz looseness
  flim:      0.25,  // weak — Aphex wonk
  xtal:      0.20,  // weak — ambient float
  syro:      0.15,  // weakest — IDM against-the-grid
  ambient:   0.10,  // minimal — time dissolves
};

/**
 * Section multiplier on gravitation.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.8,
  build:     1.1,   // tightening
  peak:      1.3,   // tightest — locked-in groove
  breakdown: 0.7,   // loosest — floating
  groove:    1.0,
};

/**
 * Metric weight for 16th note positions (0-15) in a 4/4 bar.
 * 1.0 = strongest (beat 1), 0.0 = weakest.
 */
const METRIC_WEIGHT: number[] = [
  1.00, 0.10, 0.25, 0.10,  // beat 1
  0.50, 0.10, 0.25, 0.10,  // beat 2
  0.75, 0.10, 0.25, 0.10,  // beat 3
  0.50, 0.10, 0.25, 0.10,  // beat 4
];

/**
 * Calculate nudge correction for a note at a given 16th-note position.
 *
 * Positive = push later, negative = push earlier (toward strong beat).
 * Returns 0 for notes already on strong beats.
 *
 * @param position 16th note position (0-15)
 * @param mood Current mood
 * @param section Current section
 * @returns Nudge in seconds (-0.02 to 0.02)
 */
export function gravitationNudge(
  position: number,
  mood: Mood,
  section: Section
): number {
  const pos = position % 16;
  const weight = METRIC_WEIGHT[pos];
  const strength = GRAVITATION_STRENGTH[mood] * SECTION_MULT[section];
  // Strong beats: no nudge. Weak beats: push toward nearest strong beat.
  if (weight >= 0.5) return 0;
  // Find nearest strong beat direction
  const prevStrong = [0, 4, 8, 12].reduce((best, b) =>
    Math.abs(b - pos) < Math.abs(best - pos) ? b : best
  );
  const direction = prevStrong > pos ? 1 : -1;
  const distance = Math.abs(prevStrong - pos);
  // Nudge proportional to strength and inversely to metric weight
  return direction * strength * (1 - weight) * distance * 0.004;
}

/**
 * Get gravitation strength for a mood (for testing).
 */
export function gravitationStrength(mood: Mood): number {
  return GRAVITATION_STRENGTH[mood];
}

/**
 * Should rhythmic gravitation be applied?
 */
export function shouldApplyGravitation(mood: Mood, section: Section): boolean {
  return GRAVITATION_STRENGTH[mood] * SECTION_MULT[section] > 0.08;
}
