/**
 * Echo density — delay feedback responds to musical density.
 *
 * When many notes are playing, delay echoes should be shorter/drier
 * to prevent mud. When sparse, echoes can be longer/wetter to fill
 * space. This creates a self-regulating acoustic environment where
 * the "room" adapts to the activity level.
 *
 * Applied as delay feedback/wet multipliers based on note density.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood echo sensitivity (how much density affects delay).
 */
const ECHO_SENSITIVITY: Record<Mood, number> = {
  trance:    0.20,  // consistent echo
  avril:     0.40,  // responsive hall
  disco:     0.25,  // groove-consistent
  downtempo: 0.45,  // breathing echo
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // jazz — sparse sections echo more
  flim:      0.45,  // organic
  xtal:      0.55,  // maximum echo responsiveness
  syro:      0.20,  // controlled
  ambient:   0.60,  // spacious response
};

/**
 * Calculate delay feedback multiplier based on density.
 * Dense = less feedback, sparse = more feedback.
 *
 * @param density Note density (0-1, from layerPhraseDensity)
 * @param mood Current mood
 * @param section Current section
 * @returns Feedback multiplier (0.5-1.5)
 */
export function echoDensityFeedback(
  density: number,
  mood: Mood,
  section: Section
): number {
  const sensitivity = ECHO_SENSITIVITY[mood];
  const sectionMult: Record<Section, number> = {
    intro:     1.2,
    build:     0.8,
    peak:      0.6,
    breakdown: 1.4,
    groove:    1.0,
  };

  // Invert density: sparse (low) → more feedback
  const invDensity = 1.0 - density;
  const feedbackBoost = invDensity * sensitivity * (sectionMult[section] ?? 1.0);
  return Math.max(0.5, Math.min(1.5, 1.0 + (feedbackBoost - sensitivity * 0.5)));
}

/**
 * Calculate delay wet multiplier based on density.
 *
 * @param density Note density (0-1)
 * @param mood Current mood
 * @returns Wet multiplier (0.6-1.4)
 */
export function echoDensityWet(density: number, mood: Mood): number {
  const sensitivity = ECHO_SENSITIVITY[mood];
  const invDensity = 1.0 - density;
  return Math.max(0.6, Math.min(1.4, 1.0 + (invDensity - 0.5) * sensitivity));
}

/**
 * Should echo density be applied?
 */
export function shouldApplyEchoDensity(mood: Mood): boolean {
  return ECHO_SENSITIVITY[mood] > 0.18;
}

/**
 * Get echo sensitivity for a mood (for testing).
 */
export function echoSensitivity(mood: Mood): number {
  return ECHO_SENSITIVITY[mood];
}
