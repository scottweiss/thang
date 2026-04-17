/**
 * Subsonic pulse — kick-triggered sub-bass enhancement.
 *
 * Kick drum transients should produce a brief sub-bass rumble
 * that adds tactile weight without muddying the midrange. This
 * creates the visceral "chest thump" feeling in builds and peaks.
 *
 * Applied as gain/room boost on the drone layer synchronized
 * with drum activity.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood pulse intensity.
 */
const PULSE_INTENSITY: Record<Mood, number> = {
  trance:    0.55,  // strong — driving bass
  avril:     0.10,  // minimal — classical
  disco:     0.50,  // strong — dance floor
  downtempo: 0.40,  // moderate
  blockhead: 0.60,  // strongest — hip-hop weight
  lofi:      0.25,  // gentle
  flim:      0.20,  // subtle
  xtal:      0.15,  // minimal
  syro:      0.45,  // IDM punch
  ambient:   0.05,  // barely any,
  plantasia: 0.05,
};

/**
 * Section multipliers for pulse intensity.
 */
const SECTION_PULSE: Record<Section, number> = {
  intro:     0.3,
  build:     0.8,
  peak:      1.0,   // maximum weight
  breakdown: 0.2,
  groove:    0.7,
};

/**
 * Calculate drone gain boost when drums are active.
 *
 * @param drumDensity Current drum pattern density (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier for drone (1.0 - 1.15)
 */
export function subsonicGainBoost(
  drumDensity: number,
  mood: Mood,
  section: Section
): number {
  const intensity = PULSE_INTENSITY[mood] * (SECTION_PULSE[section] ?? 1.0);
  const boost = drumDensity * intensity * 0.15;
  return Math.min(1.15, 1.0 + boost);
}

/**
 * Calculate room boost for sub-bass resonance.
 *
 * @param drumDensity Current drum pattern density (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Room multiplier (1.0 - 1.2)
 */
export function subsonicRoomBoost(
  drumDensity: number,
  mood: Mood,
  section: Section
): number {
  const intensity = PULSE_INTENSITY[mood] * (SECTION_PULSE[section] ?? 1.0);
  const boost = drumDensity * intensity * 0.2;
  return Math.min(1.2, 1.0 + boost);
}

/**
 * Should subsonic pulse be applied?
 */
export function shouldApplySubsonicPulse(
  mood: Mood,
  section: Section,
  hasDrums: boolean
): boolean {
  return hasDrums && PULSE_INTENSITY[mood] * (SECTION_PULSE[section] ?? 1.0) > 0.05;
}

/**
 * Get pulse intensity for a mood (for testing).
 */
export function pulseIntensity(mood: Mood): number {
  return PULSE_INTENSITY[mood];
}
