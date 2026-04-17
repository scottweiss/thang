/**
 * Temporal binding — perceptual simultaneity window for groove feel.
 *
 * Events within ~30-50ms are perceived as simultaneous by the auditory
 * system. This "binding window" determines whether layered events feel
 * tight (within window) or loose (outside window).
 *
 * Applied as a timing tolerance that affects how strictly layers
 * need to align, and a groove-tightness indicator.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood binding window width in milliseconds.
 * Wider = looser feel, narrower = tighter groove.
 */
const BINDING_WINDOW_MS: Record<Mood, number> = {
  trance:    15,    // very tight — machine precision
  avril:     35,    // moderate — human ensemble
  disco:     20,    // tight — dance groove
  downtempo: 45,    // wide — lazy feel
  blockhead: 25,    // moderate-tight
  lofi:      50,    // widest — sloppy jazz
  flim:      40,    // wide — organic
  xtal:      38,    // moderate-wide
  syro:      30,    // moderate — controlled looseness
  ambient:   55,    // widest — floating,
  plantasia: 55,
};

/**
 * Section multiplier on binding window.
 * Peaks tighten, breakdowns loosen.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.1,
  build:     0.9,
  peak:      0.7,   // tightest — maximum groove lock
  breakdown: 1.3,   // loosest — breathing
  groove:    1.0,
};

/**
 * Get the effective binding window for current mood/section.
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Binding window in milliseconds
 */
export function bindingWindow(mood: Mood, section: Section): number {
  return BINDING_WINDOW_MS[mood] * SECTION_MULT[section];
}

/**
 * Calculate groove tightness score based on layer onset alignment.
 * Returns 0-1 where 1 = perfectly tight, 0 = maximally loose.
 *
 * @param onsetDelaysMs Array of layer onset delays in ms
 * @param mood Current mood
 * @param section Current section
 * @returns Tightness 0-1
 */
export function grooveTightness(
  onsetDelaysMs: number[],
  mood: Mood,
  section: Section
): number {
  if (onsetDelaysMs.length < 2) return 1.0;
  const window = bindingWindow(mood, section);

  // Calculate spread of onsets
  const min = Math.min(...onsetDelaysMs);
  const max = Math.max(...onsetDelaysMs);
  const spread = max - min;

  // Within binding window = tight (1.0), outside = loose (approaching 0)
  if (spread <= window) return 1.0;
  return Math.max(0, 1.0 - (spread - window) / (window * 2));
}

/**
 * Suggest timing correction to bring layers within binding window.
 *
 * @param currentDelayMs Layer's current onset delay in ms
 * @param targetDelayMs Target onset for groove center
 * @param mood Current mood
 * @param section Current section
 * @returns Correction in ms (positive = delay more, negative = advance)
 */
export function timingCorrection(
  currentDelayMs: number,
  targetDelayMs: number,
  mood: Mood,
  section: Section
): number {
  const window = bindingWindow(mood, section);
  const offset = currentDelayMs - targetDelayMs;

  // Already within binding window — no correction needed
  if (Math.abs(offset) <= window) return 0;

  // Pull toward target, but only by a fraction (gentle correction)
  return -offset * 0.3;
}

/**
 * Should temporal binding correction be applied?
 */
export function shouldApplyBinding(mood: Mood, section: Section): boolean {
  return BINDING_WINDOW_MS[mood] * SECTION_MULT[section] < 80;
}

/**
 * Get binding window for a mood (for testing).
 */
export function baseBindingWindow(mood: Mood): number {
  return BINDING_WINDOW_MS[mood];
}
