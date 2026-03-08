/**
 * Rhythmic resolution — complex rhythms simplify at cadence points.
 *
 * Just as harmony resolves from dissonance to consonance at phrase
 * endings, rhythm should resolve from complexity to simplicity.
 * Syncopated, offbeat, and irregular patterns should settle into
 * steady, on-beat patterns at cadential moments.
 *
 * This is the rhythmic equivalent of V→I:
 * - Phrase middle: syncopation, displacement, cross-rhythms
 * - Phrase ending: simple downbeat placement, on-beat resolution
 *
 * Application: as sectionProgress approaches a cadence point (end
 * of section), gradually reduce syncopation amount and bias note
 * placement toward strong beats.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood sensitivity to rhythmic resolution.
 * Higher = more contrast between complex middle and simple endings.
 */
const RESOLUTION_STRENGTH: Record<Mood, number> = {
  trance:    0.55,  // strong resolution creates "drops"
  disco:     0.45,  // groove resolves to the one
  avril:     0.50,  // dramatic phrase endings
  blockhead: 0.40,  // boom-bap cadences
  downtempo: 0.35,  // moderate resolution
  lofi:      0.30,  // subtle rhythmic settling
  flim:      0.25,  // organic resolution
  xtal:      0.15,  // dreamy — less rhythmic structure
  syro:      0.10,  // resists resolution
  ambient:   0.05,  // barely any rhythmic structure to resolve
};

/**
 * Calculate syncopation reduction factor at the current section position.
 * Returns a multiplier (0-1) to apply to syncopation/displacement amounts.
 *
 * Near phrase endings (sectionProgress > 0.8), syncopation reduces.
 * At the very end (0.95+), rhythms are nearly on-beat.
 *
 * @param sectionProgress  Progress through current section (0-1)
 * @param mood             Current mood
 * @returns Syncopation multiplier (1.0 = full syncopation, 0 = fully resolved)
 */
export function syncopationReduction(
  sectionProgress: number,
  mood: Mood
): number {
  const strength = RESOLUTION_STRENGTH[mood];

  // No reduction in first 75% of section
  if (sectionProgress < 0.75) return 1.0;

  // Gradual reduction in last 25%
  const resolveProgress = (sectionProgress - 0.75) / 0.25;
  const reduction = resolveProgress * strength;

  return Math.max(0.0, 1.0 - reduction);
}

/**
 * Calculate downbeat bias for note placement.
 * Returns an array of position weights where strong beats get boosted
 * near phrase endings.
 *
 * @param length           Pattern length (8 or 16)
 * @param sectionProgress  Progress through section
 * @param mood             Current mood
 * @returns Array of position weights (higher = prefer placing notes here)
 */
export function downbeatBias(
  length: number,
  sectionProgress: number,
  mood: Mood
): number[] {
  const strength = RESOLUTION_STRENGTH[mood];
  const weights = new Array(length).fill(1.0);

  // Only apply near phrase endings
  if (sectionProgress < 0.7) return weights;

  const resolveAmount = ((sectionProgress - 0.7) / 0.3) * strength;

  for (let i = 0; i < length; i++) {
    const pos = i % 16;
    let beatStrength: number;
    if (pos === 0) beatStrength = 1.0;           // beat 1
    else if (pos === 8) beatStrength = 0.85;     // beat 3
    else if (pos === 4 || pos === 12) beatStrength = 0.7; // beats 2, 4
    else if (pos % 2 === 0) beatStrength = 0.4;  // 8th positions
    else beatStrength = 0.2;                      // 16th positions

    // Bias toward strong beats proportional to resolve amount
    weights[i] = 1.0 + (beatStrength - 0.5) * resolveAmount;
  }

  return weights;
}

/**
 * Apply rhythmic resolution to a step pattern.
 * Near phrase endings, off-beat notes may be moved to the nearest
 * strong beat position.
 *
 * @param steps            Note pattern
 * @param sectionProgress  Progress through section
 * @param mood             Current mood
 * @returns Modified pattern with resolved rhythm
 */
export function applyRhythmicResolution(
  steps: string[],
  sectionProgress: number,
  mood: Mood
): string[] {
  const strength = RESOLUTION_STRENGTH[mood];
  if (strength < 0.1 || sectionProgress < 0.8) return steps;

  const resolveAmount = ((sectionProgress - 0.8) / 0.2) * strength;
  const result = [...steps];

  for (let i = 0; i < result.length; i++) {
    if (result[i] === '~') continue;

    const pos = i % 16;
    const isStrongBeat = pos === 0 || pos === 4 || pos === 8 || pos === 12;
    if (isStrongBeat) continue; // already on beat

    // Probability of snapping to nearest strong beat
    const snapProb = resolveAmount * 0.4;
    const hash = ((i * 2654435761 + 71093) >>> 0) / 4294967296;
    if (hash < snapProb) {
      // Find nearest strong beat
      const prevBeat = pos - (pos % 4);
      const nextBeat = prevBeat + 4;
      const target = (pos - prevBeat <= nextBeat - pos) ? prevBeat : nextBeat % result.length;

      // Only move if target position is a rest
      if (target < result.length && result[target] === '~') {
        result[target] = result[i];
        result[i] = '~';
      }
    }
  }

  return result;
}

/**
 * Get resolution strength for a mood (for testing).
 */
export function resolutionStrength(mood: Mood): number {
  return RESOLUTION_STRENGTH[mood];
}
