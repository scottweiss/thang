/**
 * Tonal center gravity — melodic pull toward tonic by phrase position.
 *
 * At phrase beginnings, melodies explore freely. As the phrase
 * approaches its end, the pull toward tonic increases, creating
 * natural resolution. This models the gravitational metaphor
 * of tonal attraction.
 *
 * Applied as note selection weight bias toward tonic.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood gravity strength (higher = stronger pull toward tonic).
 */
const GRAVITY_STRENGTH: Record<Mood, number> = {
  trance:    0.50,  // strong — clear tonal center
  avril:     0.60,  // strongest — classical resolution
  disco:     0.45,  // moderate
  downtempo: 0.40,  // moderate
  blockhead: 0.35,  // moderate
  lofi:      0.55,  // strong — jazz resolution
  flim:      0.40,  // moderate
  xtal:      0.35,  // moderate — some wandering
  syro:      0.15,  // weakest — atonal freedom
  ambient:   0.30,  // weak — floating,
  plantasia: 0.30,
};

/**
 * Calculate gravitational pull toward tonic at phrase position.
 *
 * @param phrasePosition 0.0-1.0 position within phrase
 * @param mood Current mood
 * @returns Pull strength (0.0 - 1.0)
 */
export function tonicPull(
  phrasePosition: number,
  mood: Mood
): number {
  const strength = GRAVITY_STRENGTH[mood];
  const pos = Math.max(0, Math.min(1, phrasePosition));
  // Quadratic increase toward phrase end
  const pull = pos * pos * strength;
  return Math.min(1.0, pull);
}

/**
 * Calculate weight for a pitch based on tonic distance.
 *
 * @param pitchPc Candidate pitch class (0-11)
 * @param tonicPc Tonic pitch class (0-11)
 * @param phrasePosition Position in phrase
 * @param mood Current mood
 * @returns Weight (0.3 - 1.5)
 */
export function tonicGravityWeight(
  pitchPc: number,
  tonicPc: number,
  phrasePosition: number,
  mood: Mood
): number {
  const pull = tonicPull(phrasePosition, mood);
  const diff = Math.abs(pitchPc - tonicPc);
  const distance = Math.min(diff, 12 - diff);
  // Higher pull + closer to tonic = higher weight
  const tonicBonus = (1.0 - distance / 6) * pull;
  return Math.max(0.3, Math.min(1.5, 0.8 + tonicBonus * 0.7));
}

/**
 * Get gravity strength for a mood (for testing).
 */
export function tonalGravityStrength(mood: Mood): number {
  return GRAVITY_STRENGTH[mood];
}
