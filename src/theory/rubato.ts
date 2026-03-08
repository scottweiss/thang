/**
 * Rubato — dynamic tempo variation for musical expression.
 *
 * Real performances aren't metronomic. Musicians naturally:
 * - Speed up slightly during builds (momentum)
 * - Slow down during breakdowns (breathing space)
 * - Push tempo at high tension (urgency)
 * - Pull back at resolutions (arrival)
 *
 * This module provides tempo multipliers that create subtle
 * rubato without being noticeable as tempo changes.
 */

import type { Section, Mood } from '../types';

/**
 * How much rubato each mood allows.
 * Some moods (trance, disco) need strict tempo; others benefit from flexibility.
 */
const MOOD_RUBATO_AMOUNT: Record<Mood, number> = {
  ambient: 0.06,     // gentle breathing
  downtempo: 0.04,   // subtle sway
  lofi: 0.05,        // human feel
  trance: 0.01,      // near-metronomic
  avril: 0.05,       // intimate variation
  xtal: 0.06,        // dreamy drift
  syro: 0.02,        // tight but not rigid
  blockhead: 0.04,   // hip-hop swing
  flim: 0.05,        // gentle pulse
  disco: 0.015,      // tight groove
};

/**
 * Section-based tempo tendency.
 * Positive = faster, negative = slower.
 */
const SECTION_TENDENCY: Record<Section, number> = {
  intro: -0.3,       // slightly slower, establishing
  build: 0.5,        // pushing forward
  peak: 0.3,         // energetic but not rushed
  breakdown: -0.6,   // pulling back, breathing
  groove: 0.1,       // slight forward lean
};

/**
 * Calculate a tempo multiplier based on mood, section, and tension.
 *
 * @param mood      Current mood
 * @param section   Current section
 * @param tension   Overall tension (0-1)
 * @returns Tempo multiplier (e.g., 1.02 = 2% faster, 0.97 = 3% slower)
 */
export function rubatoMultiplier(
  mood: Mood,
  section: Section,
  tension: number
): number {
  const amount = MOOD_RUBATO_AMOUNT[mood] ?? 0.03;
  const tendency = SECTION_TENDENCY[section] ?? 0;

  // Tension adds forward push (higher tension = slightly faster)
  const tensionPush = (tension - 0.5) * 0.5; // -0.25 to +0.25

  // Combine section tendency and tension push
  const combined = tendency + tensionPush;

  // Scale by mood's rubato amount and clamp
  const multiplier = 1.0 + combined * amount;
  return Math.max(0.92, Math.min(1.08, multiplier));
}
