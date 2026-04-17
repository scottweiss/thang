/**
 * Spatial precedence — suppress reverb/pan on delayed layer copies.
 *
 * The precedence effect (Haas effect) means the first-arriving sound
 * captures the perceived spatial location. When two similar timbres
 * arrive within ~40ms, the delayed copy should have less reverb and
 * narrower pan to prevent confusing dual-image perception.
 *
 * Applied as reverb/pan reduction on layers that arrive late.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood precedence sensitivity.
 */
const PRECEDENCE_STRENGTH: Record<Mood, number> = {
  trance:    0.40,  // moderate — some smearing OK
  avril:     0.55,  // strong — classical clarity
  disco:     0.35,  // moderate
  downtempo: 0.45,  // clean
  blockhead: 0.40,  // moderate
  lofi:      0.50,  // clean jazz
  flim:      0.45,  // organic
  xtal:      0.55,  // high clarity
  syro:      0.30,  // IDM — spatial chaos OK
  ambient:   0.60,  // strongest — spatial purity,
  plantasia: 0.60,
};

/**
 * Precedence fusion window in seconds.
 */
const PRECEDENCE_WINDOW = 0.040; // 40ms

/**
 * Calculate reverb reduction for a delayed layer.
 * Layers arriving after the first should have less reverb.
 *
 * @param delayMs Onset delay relative to first-arriving layer (ms)
 * @param mood Current mood
 * @returns Room multiplier (0.5 - 1.0)
 */
export function precedenceReverbReduction(
  delayMs: number,
  mood: Mood
): number {
  if (delayMs <= 0) return 1.0; // first arrival — full reverb
  if (delayMs > 40) return 1.0; // outside window — independent

  const strength = PRECEDENCE_STRENGTH[mood];
  const withinWindow = delayMs / 40; // 0-1 within window
  const reduction = withinWindow * strength * 0.5;
  return Math.max(0.5, 1.0 - reduction);
}

/**
 * Calculate pan narrowing for a delayed layer.
 * Delayed copies should have narrower stereo spread.
 *
 * @param delayMs Onset delay relative to first-arriving layer (ms)
 * @param mood Current mood
 * @param currentPanWidth Current pan range (e.g., 0.4 for 0.3-0.7)
 * @returns Narrowed pan width
 */
export function precedencePanNarrowing(
  delayMs: number,
  mood: Mood,
  currentPanWidth: number
): number {
  if (delayMs <= 0 || delayMs > 40) return currentPanWidth;

  const strength = PRECEDENCE_STRENGTH[mood];
  const withinWindow = delayMs / 40;
  const narrowing = withinWindow * strength * 0.4;
  return Math.max(0.05, currentPanWidth * (1.0 - narrowing));
}

/**
 * Should precedence effect processing be applied?
 */
export function shouldApplyPrecedence(
  mood: Mood,
  activeLayerCount: number
): boolean {
  return activeLayerCount >= 3 && PRECEDENCE_STRENGTH[mood] > 0.25;
}

/**
 * Get precedence strength for a mood (for testing).
 */
export function precedenceStrengthForMood(mood: Mood): number {
  return PRECEDENCE_STRENGTH[mood];
}
