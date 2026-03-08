/**
 * Pitch orbit — melodic notes orbit around structural tones.
 *
 * Like planets orbiting a star, melody notes can circle around
 * chord tones and scale degrees, creating gravitational pull
 * patterns. Notes closer to the structural tone feel more stable.
 *
 * Applied as note selection weight based on orbital distance.
 */

import type { Mood } from '../types';

/**
 * Per-mood orbital pull (higher = tighter orbit around structural tones).
 */
const ORBITAL_PULL: Record<Mood, number> = {
  trance:    0.55,  // strong — tight to chord tones
  avril:     0.50,  // strong — classical orbits
  disco:     0.45,  // moderate
  downtempo: 0.40,  // moderate
  blockhead: 0.35,  // moderate — hip-hop freedom
  lofi:      0.50,  // strong — jazz orbits
  flim:      0.45,  // moderate
  xtal:      0.40,  // moderate — crystalline wander
  syro:      0.20,  // weakest — free orbits
  ambient:   0.30,  // weak — floating
};

/**
 * Calculate orbital weight for a pitch relative to a structural tone.
 * Closer pitches (in semitones) get higher weight.
 *
 * @param pitchPc Candidate pitch class (0-11)
 * @param structuralPc Structural tone pitch class (0-11)
 * @param mood Current mood
 * @returns Weight (0.1 - 1.0)
 */
export function orbitalWeight(
  pitchPc: number,
  structuralPc: number,
  mood: Mood
): number {
  const pull = ORBITAL_PULL[mood];
  const diff = Math.abs(pitchPc - structuralPc);
  const distance = Math.min(diff, 12 - diff); // semitone distance
  // Exponential decay from structural tone
  const weight = Math.exp(-distance * pull * 0.4);
  return Math.max(0.1, Math.min(1.0, weight));
}

/**
 * Find the nearest structural tone from a set.
 *
 * @param pitchPc Candidate pitch class (0-11)
 * @param structuralPcs Array of structural pitch classes
 * @returns Distance in semitones to nearest structural tone
 */
export function nearestStructuralDistance(
  pitchPc: number,
  structuralPcs: number[]
): number {
  if (structuralPcs.length === 0) return 6; // max distance
  let minDist = 12;
  for (const spc of structuralPcs) {
    const diff = Math.abs(pitchPc - spc);
    const dist = Math.min(diff, 12 - diff);
    minDist = Math.min(minDist, dist);
  }
  return minDist;
}

/**
 * Get orbital pull for a mood (for testing).
 */
export function orbitalPull(mood: Mood): number {
  return ORBITAL_PULL[mood];
}
