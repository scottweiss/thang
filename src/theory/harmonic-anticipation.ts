/**
 * Harmonic anticipation — the bass/drone subtly prepares for the next chord.
 *
 * In natural music, bass instruments often "lean" into the next chord before
 * it arrives, especially in jazz and classical. The bass might play a passing
 * tone or the drone's filter might open toward the next root's frequency.
 *
 * This module computes an anticipation weight based on how long the current
 * chord has been playing. After a threshold, the drone can start blending
 * toward the next chord root.
 */

import type { Mood, NoteName } from '../types';

/**
 * How many ticks into a chord before anticipation kicks in.
 * Lower = earlier anticipation (more forward-leaning).
 */
const MOOD_ONSET_TICKS: Record<Mood, number> = {
  ambient: 6,       // late onset — ambient is unhurried
  downtempo: 4,
  lofi: 4,
  trance: 2,        // early — trance pushes forward
  avril: 8,         // very late — avril is contemplative
  xtal: 5,
  syro: 2,          // early — syro is restless
  blockhead: 3,
  flim: 5,
  disco: 2,         // early — disco drives forward
};

/**
 * Maximum anticipation weight per mood (0-1).
 * Higher = more prominent harmonic leaning.
 */
const MOOD_MAX_WEIGHT: Record<Mood, number> = {
  ambient: 0.15,
  downtempo: 0.2,
  lofi: 0.15,
  trance: 0.3,
  avril: 0.1,
  xtal: 0.15,
  syro: 0.35,
  blockhead: 0.25,
  flim: 0.12,
  disco: 0.3,
};

/**
 * Compute the anticipation weight for the drone/bass.
 *
 * Returns 0 when it's too early to anticipate, then ramps up
 * smoothly as the current chord ages.
 *
 * @param ticksSinceChordChange  How many ticks the current chord has been active
 * @param mood                   Current mood
 * @returns Anticipation weight 0-maxWeight
 */
export function anticipationWeight(
  ticksSinceChordChange: number,
  mood: Mood
): number {
  const onset = MOOD_ONSET_TICKS[mood] ?? 4;
  const maxWeight = MOOD_MAX_WEIGHT[mood] ?? 0.2;

  if (ticksSinceChordChange < onset) return 0;

  // Ramp up over 4 ticks after onset
  const rampTicks = 4;
  const progress = Math.min(1, (ticksSinceChordChange - onset) / rampTicks);

  // Smooth ease-in
  return maxWeight * progress * progress;
}

/**
 * Get the anticipation note for the drone — a ghost note at the next chord's root
 * that blends in before the chord change.
 *
 * @param currentRoot  Current drone root note
 * @param nextRoot     Next chord's root note
 * @param octave       Drone octave
 * @param weight       Anticipation weight (0-1)
 * @returns Strudel code snippet for the ghost tone, or null if no anticipation
 */
export function anticipationGhostNote(
  currentRoot: NoteName,
  nextRoot: NoteName,
  octave: number,
  weight: number
): string | null {
  if (weight < 0.05) return null;
  if (currentRoot === nextRoot) return null;

  // Ghost note: very quiet, filtered, same octave as drone
  const gain = (weight * 0.08).toFixed(4);
  return `note("${nextRoot}${octave}")
      .sound("sine")
      .attack(0.5)
      .decay(2)
      .sustain(0.1)
      .release(1)
      .slow(8)
      .gain(${gain})
      .lpf(${(100 + weight * 200).toFixed(0)})
      .room(0.5)
      .roomsize(3)
      .orbit(0)`;
}

/**
 * Whether anticipation should be active at all.
 * Skips computation when it clearly won't produce anything.
 */
export function shouldAnticipate(
  ticksSinceChordChange: number,
  mood: Mood,
  hasNextHint: boolean
): boolean {
  if (!hasNextHint) return false;
  const onset = MOOD_ONSET_TICKS[mood] ?? 4;
  return ticksSinceChordChange >= onset;
}
