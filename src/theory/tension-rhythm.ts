/**
 * Tension-responsive rhythm — syncopation tracks real-time tension.
 *
 * At high tension, rhythmic patterns become more syncopated and
 * off-beat, creating restlessness and urgency. At low tension,
 * patterns settle onto strong beats, creating stability and groove.
 *
 * This works by computing a "displacement amount" that shifts
 * note placement toward or away from strong beats. Applied via
 * .nudge() offsets that push notes slightly early (anticipation)
 * or by biasing which rhythmic positions get notes vs rests.
 *
 * Different from micro-timing (which adds humanization jitter),
 * this creates deliberate syncopation that follows the tension arc.
 */

import type { Mood } from '../types';

/** Per-mood sensitivity to tension-driven rhythm displacement */
const RHYTHM_SENSITIVITY: Record<Mood, number> = {
  syro:      0.55,   // IDM — extreme rhythmic tension response
  disco:     0.45,   // funk — syncopation is the soul
  blockhead: 0.40,   // hip-hop — groove displacement
  lofi:      0.35,   // jazz — swing responds to tension
  trance:    0.30,   // EDM — subtle beat displacement
  downtempo: 0.25,   // smooth — gentle groove shift
  flim:      0.20,   // delicate — subtle
  avril:     0.15,   // intimate — mostly stable
  xtal:      0.15,   // dreamy — gentle
  ambient:   0.05,   // drone — rhythmically static
};

/**
 * Compute a syncopation amount based on tension.
 * Higher tension → more syncopation (notes displaced from strong beats).
 *
 * @param tension  Current overall tension (0-1)
 * @param mood     Current mood
 * @returns Syncopation amount (0.0-0.5) — proportion of beat to displace
 */
export function tensionSyncopation(
  tension: number,
  mood: Mood
): number {
  const sensitivity = RHYTHM_SENSITIVITY[mood];
  const t = Math.max(0, Math.min(1, tension));

  // Low tension (0-0.3): minimal syncopation (on-beat stability)
  // Mid tension (0.3-0.7): moderate syncopation (groove)
  // High tension (0.7-1.0): maximum syncopation (restless energy)
  const curved = t * t; // quadratic — syncopation accelerates at high tension
  return sensitivity * curved * 0.4;
}

/**
 * Generate a per-step displacement pattern based on tension.
 * Returns an array of timing offsets (in beat fractions) for each step.
 *
 * Positive values = late (behind the beat, laid back)
 * Negative values = early (ahead of the beat, pushing)
 *
 * At high tension: alternating push/pull creates restlessness
 * At low tension: near-zero values keep things stable
 *
 * @param steps    Number of steps in the pattern
 * @param tension  Current overall tension (0-1)
 * @param mood     Current mood
 * @returns Array of timing offsets (-0.05 to +0.05)
 */
export function tensionDisplacementPattern(
  steps: number,
  tension: number,
  mood: Mood
): number[] {
  const amount = tensionSyncopation(tension, mood);
  if (amount < 0.01 || steps <= 0) {
    return new Array(steps).fill(0);
  }

  const pattern: number[] = [];
  for (let i = 0; i < steps; i++) {
    // Strong beats (0, 4, 8, ...) stay stable
    // Weak beats (off-beats) get displaced proportional to tension
    const isStrongBeat = i % 4 === 0;
    const isOffBeat = i % 2 === 1;

    if (isStrongBeat) {
      // Strong beats: minimal displacement (anchor points)
      pattern.push(amount * 0.05);
    } else if (isOffBeat) {
      // Off-beats: maximum displacement (syncopation targets)
      // Alternate between early (push) and late (pull)
      const direction = (i % 4 === 1) ? -1 : 1;
      pattern.push(direction * amount * 0.12);
    } else {
      // Semi-strong beats: moderate displacement
      pattern.push(amount * 0.08 * ((i % 3 === 0) ? -1 : 1));
    }
  }

  return pattern;
}

/**
 * Compute a rest probability modifier based on tension.
 * At high tension: fewer rests on off-beats (filling in, more notes)
 * At low tension: more rests on weak positions (sparse, breathing)
 *
 * @param stepPosition  Position within the pattern (0-based)
 * @param tension       Current overall tension (0-1)
 * @param mood          Current mood
 * @returns Multiplier for rest probability (< 1 = fewer rests, > 1 = more rests)
 */
export function tensionRestModifier(
  stepPosition: number,
  tension: number,
  mood: Mood
): number {
  const sensitivity = RHYTHM_SENSITIVITY[mood];
  const t = Math.max(0, Math.min(1, tension));

  const isWeakBeat = stepPosition % 2 === 1;

  if (isWeakBeat) {
    // Weak beats: high tension fills them in, low tension empties them
    return 1.0 - t * sensitivity * 0.6;
  } else {
    // Strong beats: always tend to have notes (slight tension effect)
    return 1.0 - t * sensitivity * 0.15;
  }
}

/**
 * Whether tension rhythm should be applied.
 */
export function shouldApplyTensionRhythm(mood: Mood): boolean {
  return RHYTHM_SENSITIVITY[mood] >= 0.1;
}

/**
 * Get the rhythm sensitivity for a mood (for testing).
 */
export function tensionRhythmSensitivity(mood: Mood): number {
  return RHYTHM_SENSITIVITY[mood];
}
