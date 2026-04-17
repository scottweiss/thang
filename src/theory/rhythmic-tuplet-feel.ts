import type { Mood, Section } from '../types';

/**
 * Rhythmic tuplet feel — creates the perception of triplet
 * groupings over a duple (4/4) grid. Accents positions that
 * align with implied triplet subdivisions, creating a subtle
 * polyrhythmic tension between duple and triple feel.
 */

const tupletStrength: Record<Mood, number> = {
  ambient: 0.10,
  plantasia: 0.10,
  downtempo: 0.30,
  lofi: 0.35,
  trance: 0.20,
  avril: 0.25,
  xtal: 0.40,
  syro: 0.55,
  blockhead: 0.45,
  flim: 0.35,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.4,
  build: 0.8,
  peak: 1.0,
  breakdown: 0.6,
  groove: 1.2,
};

/**
 * Maps 16-step positions to their alignment with triplet grid.
 * In a 16-step pattern, triplet positions (if we overlay a 12-step
 * triplet grid) roughly fall at positions that are multiples of 16/12.
 * Positions closest to these get emphasis.
 */
function tripletAlignment(position: number): number {
  // 12 triplet points spread over 16 steps
  const tripletPositions = [0, 1.33, 2.67, 4, 5.33, 6.67, 8, 9.33, 10.67, 12, 13.33, 14.67];
  const pos = position % 16;
  let minDist = 16;
  for (const tp of tripletPositions) {
    const dist = Math.abs(pos - tp);
    if (dist < minDist) minDist = dist;
  }
  // Only accent if very close to a triplet position (within 0.4 steps)
  // AND not already on a duple position (0, 4, 8, 12)
  const onDuple = pos % 4 === 0;
  if (onDuple || minDist > 0.4) return 0;
  return 1.0 - minDist / 0.4;
}

/**
 * Returns a gain multiplier for tuplet feel emphasis.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function tupletFeelGain(
  beatPosition: number,
  mood: Mood,
  section: Section
): number {
  const alignment = tripletAlignment(beatPosition);
  if (alignment < 0.01) return 1.0;

  const depth = tupletStrength[mood] * sectionMultiplier[section];
  return 1.0 + 0.03 * alignment * depth;
}

export function tupletStrengthValue(mood: Mood): number {
  return tupletStrength[mood];
}
