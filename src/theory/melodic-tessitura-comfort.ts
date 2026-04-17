import type { Mood, Section } from '../types';

/**
 * Melodic tessitura comfort — each mood has an ideal pitch
 * range (tessitura). Notes near the center of this range
 * sound most natural and get a clarity boost. Notes at
 * extreme registers are less comfortable and get no boost.
 */

const tessituraCenter: Record<Mood, number> = {
  ambient: 62,    // D4 — mid-range, spacious,
  plantasia: 62,
  downtempo: 60,  // C4 — classic middle
  lofi: 58,       // Bb3 — slightly low, warm
  trance: 65,     // F4 — bright
  avril: 64,      // E4 — expressive mid
  xtal: 60,       // C4 — neutral
  syro: 67,       // G4 — higher, cutting
  blockhead: 55,  // G3 — low, punchy
  flim: 63,       // Eb4 — sweet spot
  disco: 62,      // D4 — groovy mid
};

const tessituraWidth: Record<Mood, number> = {
  ambient: 10,
  plantasia: 10,
  downtempo: 8,
  lofi: 7,
  trance: 9,
  avril: 12,
  xtal: 10,
  syro: 8,
  blockhead: 6,
  flim: 11,
  disco: 8,
};

const comfortStrength: Record<Mood, number> = {
  ambient: 0.35,
  plantasia: 0.35,
  downtempo: 0.40,
  lofi: 0.45,
  trance: 0.30,
  avril: 0.55,
  xtal: 0.35,
  syro: 0.25,
  blockhead: 0.30,
  flim: 0.50,
  disco: 0.35,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.7,
  build: 0.9,
  peak: 1.0,
  breakdown: 1.1,
  groove: 0.9,
};

/**
 * Returns comfort level (0-1) based on how close pitch
 * is to the mood's ideal tessitura center.
 */
export function tessituraComfort(pitch: number, mood: Mood): number {
  const center = tessituraCenter[mood];
  const width = tessituraWidth[mood];
  const dist = Math.abs(pitch - center);
  if (dist >= width) return 0;
  return 1.0 - dist / width;
}

/**
 * Returns a gain multiplier for tessitura comfort.
 *
 * @param pitch - MIDI note number
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function tessituraComfortGain(
  pitch: number,
  mood: Mood,
  section: Section
): number {
  const comfort = tessituraComfort(pitch, mood);
  if (comfort < 0.01) return 1.0;

  const depth = comfortStrength[mood] * sectionMultiplier[section];
  return 1.0 + 0.03 * comfort * depth;
}

export function comfortStrengthValue(mood: Mood): number {
  return comfortStrength[mood];
}
