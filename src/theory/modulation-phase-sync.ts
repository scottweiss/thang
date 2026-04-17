/**
 * Modulation phase sync — filter/pan modulations locked to section phase.
 *
 * Instead of free-running LFOs, modulation sources should sync to
 * section progress. Builds should tighten (faster, narrower modulation),
 * breakdowns should widen (slower, wider). This creates intentional
 * movement that feels composed rather than random.
 *
 * Applied as modulation rate and depth multipliers.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood modulation depth sensitivity.
 */
const MOD_SENSITIVITY: Record<Mood, number> = {
  trance:    0.45,  // hypnotic modulation
  avril:     0.30,  // gentle classical
  disco:     0.40,  // funky modulation
  downtempo: 0.35,  // smooth
  blockhead: 0.40,  // moderate
  lofi:      0.35,  // jazzy
  flim:      0.40,  // organic
  xtal:      0.50,  // maximum — ambient morphing
  syro:      0.45,  // IDM movement
  ambient:   0.55,  // strongest — evolving textures,
  plantasia: 0.55,
};

/**
 * Section modulation character.
 */
const SECTION_MOD: Record<Section, { rate: number; depth: number }> = {
  intro:     { rate: 0.5, depth: 0.6 },   // slow, moderate
  build:     { rate: 1.2, depth: 0.4 },   // faster, narrower
  peak:      { rate: 1.5, depth: 0.3 },   // fastest, tightest
  breakdown: { rate: 0.3, depth: 1.0 },   // slowest, widest
  groove:    { rate: 0.8, depth: 0.7 },   // moderate
};

/**
 * Calculate modulation rate multiplier (applied to .slow() values).
 * Higher = slower pattern cycling = wider modulation.
 *
 * @param sectionProgress 0-1 progress through section
 * @param mood Current mood
 * @param section Current section
 * @returns Rate multiplier for .slow() (0.5 - 2.0)
 */
export function modRateMultiplier(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const sensitivity = MOD_SENSITIVITY[mood];
  const { rate } = SECTION_MOD[section];

  // Within a section, modulation rate evolves
  const progressShift = (section === 'build')
    ? sectionProgress * 0.3  // builds accelerate modulation
    : -sectionProgress * 0.1; // others slightly slow down

  const mult = rate + progressShift * sensitivity;
  return Math.max(0.5, Math.min(2.0, mult));
}

/**
 * Calculate modulation depth multiplier (applied to pan/filter ranges).
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Depth multiplier (0.3 - 1.5)
 */
export function modDepthMultiplier(
  mood: Mood,
  section: Section
): number {
  const sensitivity = MOD_SENSITIVITY[mood];
  const { depth } = SECTION_MOD[section];
  return Math.max(0.3, Math.min(1.5, depth * (0.6 + sensitivity)));
}

/**
 * Should modulation phase sync be applied?
 */
export function shouldSyncModulation(mood: Mood): boolean {
  return MOD_SENSITIVITY[mood] > 0.25;
}

/**
 * Get modulation sensitivity for a mood (for testing).
 */
export function modSensitivity(mood: Mood): number {
  return MOD_SENSITIVITY[mood];
}
