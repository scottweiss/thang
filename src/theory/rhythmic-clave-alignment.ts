import type { Mood, Section } from '../types';

/**
 * Rhythmic clave alignment — the son clave (3-2) and rumba clave
 * are foundational Afro-Cuban patterns that underlie much popular
 * music. Accenting notes that align with clave positions creates
 * deep groove even in non-Latin genres.
 */

const claveStrength: Record<Mood, number> = {
  ambient: 0.05,
  downtempo: 0.30,
  lofi: 0.35,
  trance: 0.20,
  avril: 0.15,
  xtal: 0.10,
  syro: 0.30,
  blockhead: 0.40,
  flim: 0.20,
  disco: 0.55,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.4,
  build: 0.8,
  peak: 1.0,
  breakdown: 0.5,
  groove: 1.3,
};

// Son clave 3-2 pattern in 16-step grid
const SON_CLAVE_32: number[] = [0, 3, 7, 8, 12];
// Son clave 2-3 (reversed)
const SON_CLAVE_23: number[] = [0, 4, 6, 10, 12];
// Rumba clave 3-2
const RUMBA_CLAVE: number[] = [0, 3, 7, 8, 11];

/**
 * Returns a gain multiplier for clave-aligned positions.
 * The clave pattern rotates between son 3-2, 2-3, and rumba.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param tick - current tick for pattern rotation
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function claveAlignmentGain(
  beatPosition: number,
  tick: number,
  mood: Mood,
  section: Section
): number {
  const depth = claveStrength[mood] * sectionMultiplier[section];
  if (depth < 0.01) return 1.0;

  const patterns = [SON_CLAVE_32, SON_CLAVE_23, RUMBA_CLAVE];
  const patIdx = Math.floor(tick / 8) % patterns.length;
  const clave = patterns[patIdx];

  const pos = beatPosition % 16;
  if (clave.includes(pos)) {
    return 1.0 + 0.03 * depth;
  }
  return 1.0;
}

export function claveStrengthValue(mood: Mood): number {
  return claveStrength[mood];
}
