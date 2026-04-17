/**
 * Dynamic headroom management — reserve gain for upcoming peaks.
 *
 * If the current section is building toward a peak, we should
 * hold back slightly on gain to leave room for the climax.
 * This prevents the peak from being the same volume as the build,
 * preserving dynamic impact.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood headroom discipline (higher = more gain reservation).
 */
const HEADROOM_DISCIPLINE: Record<Mood, number> = {
  trance:    0.50,  // high — big drops
  avril:     0.55,  // high — orchestral dynamics
  disco:     0.35,  // moderate
  downtempo: 0.45,  // moderate
  blockhead: 0.40,  // moderate
  lofi:      0.30,  // low — intimate
  flim:      0.35,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.25,  // low — flat dynamics OK
  ambient:   0.50,  // high — dynamic range important,
  plantasia: 0.50,
};

/**
 * Section headroom reservation (higher = more gain held back).
 */
const SECTION_HEADROOM: Record<Section, number> = {
  intro:     0.3,   // moderate reservation
  build:     0.6,   // high reservation for upcoming peak
  peak:      0.0,   // no reservation — full power
  breakdown: 0.4,   // moderate — saving for groove
  groove:    0.1,   // low — comfortable
};

/**
 * Calculate headroom management gain.
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.88 - 1.0)
 */
export function headroomGain(
  mood: Mood,
  section: Section
): number {
  const discipline = HEADROOM_DISCIPLINE[mood];
  const reservation = SECTION_HEADROOM[section];

  const reduction = reservation * discipline * 0.18;
  return Math.max(0.88, 1.0 - reduction);
}

/**
 * Get headroom discipline for a mood (for testing).
 */
export function headroomDiscipline(mood: Mood): number {
  return HEADROOM_DISCIPLINE[mood];
}
