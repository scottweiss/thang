import type { Mood, Section } from '../types';

/**
 * Harmonic double leading tone — when two voices simultaneously
 * resolve by semitone to chord tones (e.g., ti→do and fi→sol),
 * the convergence creates intense pull. Apply FM richness
 * proportional to how many chromatic approaches are active.
 */

const leadingToneDepth: Record<Mood, number> = {
  ambient: 0.20,
  plantasia: 0.20,
  downtempo: 0.30,
  lofi: 0.25,
  trance: 0.50,
  avril: 0.55,
  xtal: 0.35,
  syro: 0.30,
  blockhead: 0.20,
  flim: 0.40,
  disco: 0.35,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 1.2,
  peak: 1.0,
  breakdown: 0.7,
  groove: 0.8,
};

/**
 * Counts chromatic approach tones in the current chord context.
 * Notes that are 1 semitone away from a chord tone and resolve
 * inward are leading tones.
 *
 * @param chordNotePcs - pitch classes of current chord (0-11)
 * @param prevNotePcs - pitch classes from previous chord (0-11)
 * @returns number of chromatic approaches (0-4)
 */
export function countLeadingTones(
  chordNotePcs: number[],
  prevNotePcs: number[]
): number {
  let count = 0;
  for (const prev of prevNotePcs) {
    for (const cur of chordNotePcs) {
      const dist = ((cur - prev) % 12 + 12) % 12;
      if (dist === 1 || dist === 11) {
        count++;
        break;
      }
    }
  }
  return Math.min(count, 4);
}

/**
 * Returns an FM multiplier for double leading tone intensity.
 *
 * @param leadingCount - number of active leading tones (0-4)
 * @param mood - current mood
 * @param section - current section
 * @returns FM multiplier in [1.0, 1.05]
 */
export function doubleLeadingToneFm(
  leadingCount: number,
  mood: Mood,
  section: Section
): number {
  if (leadingCount <= 0) return 1.0;
  const clamped = Math.min(leadingCount, 4);
  const depth = leadingToneDepth[mood] * sectionMultiplier[section];
  return 1.0 + (clamped / 4) * 0.05 * depth;
}

export function leadingToneDepthValue(mood: Mood): number {
  return leadingToneDepth[mood];
}
