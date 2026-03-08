/**
 * Rhythmic density envelope — note density follows section-level curve.
 *
 * Each section has a characteristic density shape: builds accelerate,
 * breakdowns thin out, peaks sustain high density. This provides
 * a smooth density target at any point in the section.
 *
 * Applied as degradeBy() probability or note count target.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood density range (higher = wider density variation).
 */
const DENSITY_RANGE: Record<Mood, number> = {
  trance:    0.40,  // moderate — controlled density
  avril:     0.55,  // strong — dramatic density changes
  disco:     0.30,  // moderate — steady groove
  downtempo: 0.45,  // moderate
  blockhead: 0.35,  // moderate
  lofi:      0.50,  // strong — density breathing
  flim:      0.55,  // strong — delicate density
  xtal:      0.60,  // strongest — crystalline variation
  syro:      0.45,  // moderate — IDM density play
  ambient:   0.50,  // strong — sparse to dense
};

/**
 * Section density curves (start, middle, end fractions).
 */
const SECTION_CURVES: Record<Section, [number, number, number]> = {
  intro:     [0.2, 0.3, 0.4],  // sparse → slightly denser
  build:     [0.4, 0.6, 0.8],  // accelerating density
  peak:      [0.8, 0.9, 0.8],  // sustained high
  breakdown: [0.6, 0.4, 0.3],  // thinning out
  groove:    [0.6, 0.7, 0.65], // steady moderate
};

/**
 * Calculate target density at a section position.
 *
 * @param sectionProgress 0.0-1.0 progress through section
 * @param mood Current mood
 * @param section Current section
 * @returns Target density (0.1 - 1.0)
 */
export function densityTarget(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const range = DENSITY_RANGE[mood];
  const curve = SECTION_CURVES[section];
  const t = Math.max(0, Math.min(1, sectionProgress));

  // Quadratic interpolation through 3 control points
  let density: number;
  if (t < 0.5) {
    const lt = t * 2;
    density = curve[0] * (1 - lt) + curve[1] * lt;
  } else {
    const lt = (t - 0.5) * 2;
    density = curve[1] * (1 - lt) + curve[2] * lt;
  }

  // Scale by mood range
  const baselineDensity = 0.5;
  return Math.max(0.1, Math.min(1.0, baselineDensity + (density - 0.5) * range));
}

/**
 * Calculate degradeBy probability to achieve target density.
 *
 * @param currentDensity Current pattern density (0-1)
 * @param sectionProgress Progress through section
 * @param mood Current mood
 * @param section Current section
 * @returns degradeBy probability (0.0 - 0.8)
 */
export function densityDegradeBy(
  currentDensity: number,
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const target = densityTarget(sectionProgress, mood, section);
  if (currentDensity <= target) return 0;
  return Math.min(0.8, (currentDensity - target) * 1.5);
}

/**
 * Get density range for a mood (for testing).
 */
export function densityEnvelopeRange(mood: Mood): number {
  return DENSITY_RANGE[mood];
}
