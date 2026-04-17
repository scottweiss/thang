import type { Mood, Section } from '../types';

/**
 * Harmonic Luminance — chord brightness score based on interval content.
 *
 * Major thirds and tritones contribute brightness ("luminance"),
 * minor thirds and perfect fourths contribute darkness.
 * Modulates FM index: brighter chords get more harmonic content,
 * darker chords stay warmer/simpler.
 */

const moodStrength: Record<Mood, number> = {
  ambient: 0.5,
  plantasia: 0.5,
  downtempo: 0.6,
  lofi: 0.4,
  trance: 0.8,
  avril: 0.7,
  xtal: 0.6,
  syro: 0.9,
  blockhead: 0.7,
  flim: 0.5,
  disco: 0.8,
};

const sectionMult: Record<Section, number> = {
  intro: 0.6,
  build: 0.9,
  peak: 1.0,
  breakdown: 0.5,
  groove: 0.8,
};

function intervalClass(semitones: number): number {
  const s = ((semitones % 12) + 12) % 12;
  return s > 6 ? 12 - s : s;
}

/**
 * Score a chord's luminance from its interval content.
 * Returns value in [-1, 1]: positive = bright, negative = dark.
 */
export function chordLuminance(noteMidis: number[]): number {
  if (noteMidis.length < 2) return 0;
  let bright = 0;
  let dark = 0;
  let count = 0;
  for (let i = 0; i < noteMidis.length; i++) {
    for (let j = i + 1; j < noteMidis.length; j++) {
      const ic = intervalClass(noteMidis[j] - noteMidis[i]);
      // Major 3rd (4), tritone (6) = bright
      if (ic === 4 || ic === 6) bright++;
      // Minor 3rd (3), perfect 4th (5) = dark
      else if (ic === 3 || ic === 5) dark++;
      count++;
    }
  }
  if (count === 0) return 0;
  return (bright - dark) / count;
}

/**
 * FM index multiplier based on chord luminance.
 * Bright chords → higher FM (more harmonics), dark → lower.
 */
export function luminanceFm(
  noteMidis: number[],
  mood: Mood,
  section: Section,
): number {
  const lum = chordLuminance(noteMidis);
  const strength = (moodStrength[mood] ?? 0.5) * (sectionMult[section] ?? 0.7);
  // Map luminance [-1,1] to FM multiplier [0.92, 1.08]
  return 1 + lum * 0.08 * strength;
}
