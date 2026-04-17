/**
 * Harmonic pedal anticipation — bass leans toward next chord.
 *
 * Before a chord change, the bass can hint at the incoming root
 * by playing passing tones that pull toward it. This creates
 * smooth bass transitions and harmonic momentum.
 *
 * Applied as bass note selection bias near chord changes.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood anticipation strength.
 */
const ANTICIPATION_STRENGTH: Record<Mood, number> = {
  trance:    0.30,  // moderate — clear bass
  avril:     0.50,  // strong — classical bass motion
  disco:     0.45,  // strong — walking bass
  downtempo: 0.40,  // moderate
  blockhead: 0.35,  // moderate
  lofi:      0.55,  // strongest — jazz walking bass
  flim:      0.40,  // moderate
  xtal:      0.30,  // moderate
  syro:      0.20,  // weak — bass is independent
  ambient:   0.25,  // weak — bass drones,
  plantasia: 0.25,
};

/**
 * Calculate anticipation weight for a bass note.
 * Notes closer to the next root get higher weight near chord changes.
 *
 * @param candidatePc Candidate bass pitch class (0-11)
 * @param nextRootPc Next chord root pitch class (0-11)
 * @param ticksUntilChange Ticks until next chord change
 * @param mood Current mood
 * @returns Weight multiplier (0.8 - 1.5)
 */
export function anticipationWeight(
  candidatePc: number,
  nextRootPc: number,
  ticksUntilChange: number,
  mood: Mood
): number {
  const strength = ANTICIPATION_STRENGTH[mood];
  // Only anticipate when change is near (within 2 ticks)
  if (ticksUntilChange > 2) return 1.0;

  const diff = Math.abs(candidatePc - nextRootPc);
  const distance = Math.min(diff, 12 - diff);

  // Closer to next root = higher weight
  const proximity = 1.0 - distance / 6;
  const urgency = (3 - ticksUntilChange) / 3; // more urgent closer to change

  return 1.0 + proximity * urgency * strength * 0.5;
}

/**
 * Whether anticipation should be active.
 */
export function shouldAnticipate(
  ticksUntilChange: number,
  mood: Mood
): boolean {
  if (ticksUntilChange > 2) return false;
  return ANTICIPATION_STRENGTH[mood] > 0.15;
}

/**
 * Get anticipation strength for a mood (for testing).
 */
export function pedalAnticipationStrength(mood: Mood): number {
  return ANTICIPATION_STRENGTH[mood];
}
