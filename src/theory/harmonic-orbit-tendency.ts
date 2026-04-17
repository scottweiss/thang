import type { Mood, Section } from '../types';

/**
 * Harmonic orbit tendency — certain scale degrees have
 * gravitational pull toward others: 7→1 (leading tone),
 * 4→3 (fa→mi), 2→1, 6→5. When chord roots follow these
 * tendencies, the motion feels natural. Boost FM depth
 * to color these satisfying resolutions.
 */

const orbitStrength: Record<Mood, number> = {
  ambient: 0.25,
  plantasia: 0.25,
  downtempo: 0.35,
  lofi: 0.30,
  trance: 0.50,
  avril: 0.55,
  xtal: 0.40,
  syro: 0.20,
  blockhead: 0.15,
  flim: 0.45,
  disco: 0.35,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.7,
  groove: 0.9,
};

// Tendency pairs: [from degree, to degree, strength]
// Degrees are 0-indexed (0=tonic, 6=leading tone)
const TENDENCIES: [number, number, number][] = [
  [6, 0, 1.0],  // leading tone → tonic (strongest)
  [3, 2, 0.8],  // fa → mi
  [1, 0, 0.7],  // re → do
  [5, 4, 0.6],  // la → sol
  [4, 0, 0.5],  // sol → do (dominant motion)
  [3, 4, 0.4],  // fa → sol (subdominant to dominant)
];

/**
 * Checks if a degree transition follows a natural tendency.
 * Returns tendency strength (0-1) or 0 if not a tendency.
 */
export function tendencyStrength(fromDegree: number, toDegree: number): number {
  const from = ((fromDegree % 7) + 7) % 7;
  const to = ((toDegree % 7) + 7) % 7;
  for (const [f, t, s] of TENDENCIES) {
    if (from === f && to === t) return s;
  }
  return 0;
}

/**
 * Returns an FM depth multiplier when chord root follows
 * a natural scale-degree tendency.
 *
 * @param fromDegree - previous chord's scale degree (0-6)
 * @param toDegree - current chord's scale degree (0-6)
 * @param mood - current mood
 * @param section - current section
 * @returns FM multiplier in [1.0, 1.04]
 */
export function orbitTendencyFm(
  fromDegree: number,
  toDegree: number,
  mood: Mood,
  section: Section
): number {
  const ts = tendencyStrength(fromDegree, toDegree);
  if (ts < 0.01) return 1.0;

  const depth = orbitStrength[mood] * sectionMultiplier[section];
  return 1.0 + 0.04 * ts * depth;
}

export function orbitStrengthValue(mood: Mood): number {
  return orbitStrength[mood];
}
