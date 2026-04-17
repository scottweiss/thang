/**
 * Syncopation depth — measure and control syncopation intensity.
 *
 * Syncopation is the displacement of rhythmic emphasis from strong
 * to weak beats. This module measures syncopation depth from a
 * pattern and provides gain adjustments that either emphasize
 * or de-emphasize syncopated positions.
 *
 * Applied as gain multiplier to modulate syncopation presence.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood syncopation appetite (higher = more syncopation desired).
 */
const SYNCOPATION_APPETITE: Record<Mood, number> = {
  trance:    0.20,  // low — on the beat
  avril:     0.30,  // moderate — classical agogic
  disco:     0.50,  // high — funk syncopation
  downtempo: 0.55,  // high — laid-back groove
  blockhead: 0.60,  // highest — hip-hop swing
  lofi:      0.65,  // highest — lazy syncopation
  flim:      0.45,  // moderate — irregular
  xtal:      0.35,  // moderate
  syro:      0.40,  // moderate — erratic but not syncopated
  ambient:   0.15,  // lowest — drifting,
  plantasia: 0.15,
};

/**
 * Measure syncopation of a beat position.
 * Returns how "syncopated" a position is (1.0 = maximally syncopated).
 *
 * @param position Beat position (0-15)
 * @returns Syncopation level (0.0 = on-beat, 1.0 = maximally off-beat)
 */
export function syncopationLevel(position: number): number {
  const pos = ((position % 16) + 16) % 16;
  if (pos === 0 || pos === 8) return 0;       // downbeat
  if (pos === 4 || pos === 12) return 0.2;    // quarter
  if (pos % 2 === 0) return 0.5;              // eighth
  return 0.8;                                   // sixteenth
}

/**
 * Gain multiplier that controls syncopation emphasis.
 *
 * @param position Beat position (0-15)
 * @param mood Current mood
 * @returns Gain multiplier (0.88 - 1.12)
 */
export function syncopationGain(
  position: number,
  mood: Mood
): number {
  const appetite = SYNCOPATION_APPETITE[mood];
  const level = syncopationLevel(position);

  // High appetite: boost syncopated positions
  // Low appetite: reduce syncopated positions
  const shift = level * (appetite - 0.5) * 0.5;
  return Math.max(0.88, Math.min(1.12, 1.0 + shift));
}

/**
 * Get syncopation appetite for a mood (for testing).
 */
export function syncopationAppetite(mood: Mood): number {
  return SYNCOPATION_APPETITE[mood];
}
