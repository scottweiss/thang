import type { Mood, Section } from '../types';

/**
 * Melodic escape tone color — an escape tone (échappée) steps
 * away from a chord tone and then leaps in the opposite direction.
 * Unlike appoggiaturas, escape tones leave by step and resolve
 * by leap. Apply a subtle LPF shift to color these moments.
 */

const escapeColorDepth: Record<Mood, number> = {
  ambient: 0.30,
  plantasia: 0.30,
  downtempo: 0.25,
  lofi: 0.35,
  trance: 0.15,
  avril: 0.45,
  xtal: 0.35,
  syro: 0.40,
  blockhead: 0.20,
  flim: 0.55,
  disco: 0.20,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.6,
  build: 0.9,
  peak: 1.0,
  breakdown: 1.1,
  groove: 0.8,
};

/**
 * Detects if a note functions as an escape tone.
 * Arrives by step (1-2 semitones) and leaves by leap (>2 semitones)
 * in the opposite direction.
 *
 * @param arrivalInterval - interval arriving at this note (signed)
 * @param departureInterval - interval leaving this note (signed)
 * @returns true if escape tone
 */
export function isEscapeTone(
  arrivalInterval: number,
  departureInterval: number
): boolean {
  const arrAbs = Math.abs(arrivalInterval);
  const depAbs = Math.abs(departureInterval);
  if (arrAbs < 1 || arrAbs > 2) return false;
  if (depAbs <= 2) return false;
  return Math.sign(arrivalInterval) !== Math.sign(departureInterval);
}

/**
 * Returns an LPF multiplier that colors escape tones.
 * Escape tones get a brief brightness flash (higher LPF).
 *
 * @param arrivalInterval - interval arriving (signed semitones)
 * @param departureInterval - interval leaving (signed semitones)
 * @param mood - current mood
 * @param section - current section
 * @returns LPF multiplier in [1.0, 1.06]
 */
export function escapeToneColorLpf(
  arrivalInterval: number,
  departureInterval: number,
  mood: Mood,
  section: Section
): number {
  if (!isEscapeTone(arrivalInterval, departureInterval)) return 1.0;
  const depth = escapeColorDepth[mood] * sectionMultiplier[section];
  return 1.0 + 0.06 * depth;
}

export function escapeColorDepthValue(mood: Mood): number {
  return escapeColorDepth[mood];
}
