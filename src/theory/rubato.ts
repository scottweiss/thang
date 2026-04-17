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

import type { Section, Mood, ChordQuality } from '../types';
import { isCadentialArrival } from './arrival-emphasis';

/**
 * How much rubato each mood allows.
 * Some moods (trance, disco) need strict tempo; others benefit from flexibility.
 */
const MOOD_RUBATO_AMOUNT: Record<Mood, number> = {
  ambient: 0.06,     // gentle breathing,
  plantasia: 0.06,
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

/**
 * How much cadential ritardando each mood allows.
 * Expressive moods get more; rigid moods get almost none.
 */
const MOOD_CADENTIAL_DEPTH: Partial<Record<Mood, number>> = {
  ambient: 0.04,       // gentle settling,
  plantasia: 0.04,
  downtempo: 0.03,     // subtle breath
  lofi: 0.035,         // human feel
  trance: 0.008,       // near-rigid
  avril: 0.05,         // intimate, expressive
  xtal: 0.045,         // dreamy slowing
  syro: 0.015,         // tight
  blockhead: 0.025,    // hip-hop breath
  flim: 0.04,          // gentle
  disco: 0.01,         // groove-locked
};

/**
 * Cadential rubato — brief tempo dip at resolution points.
 *
 * When a dominant chord resolves to tonic, performers instinctively
 * ease into the arrival with a micro-ritardando. This function
 * returns a tempo multiplier < 1 that decays back to 1.0 over
 * 2-3 ticks after the resolution.
 *
 * Combine with rubatoMultiplier() by multiplication:
 *   effectiveTempo = baseTempo * rubatoMultiplier() * cadentialRubato()
 *
 * @param currentDegree     Current chord degree
 * @param prevDegree        Previous chord degree
 * @param prevQuality       Previous chord quality
 * @param ticksSinceChange  Ticks since chord changed
 * @param mood              Current mood
 * @returns Tempo multiplier (0.95-1.0, where < 1 = slower)
 */
export function cadentialRubato(
  currentDegree: number,
  prevDegree: number,
  prevQuality: ChordQuality,
  ticksSinceChange: number,
  mood: Mood
): number {
  // Not a cadential arrival — no effect
  if (!isCadentialArrival(currentDegree, prevDegree, prevQuality)) {
    return 1.0;
  }

  // Effect decays after 3 ticks
  if (ticksSinceChange > 3) return 1.0;

  const depth = MOOD_CADENTIAL_DEPTH[mood] ?? 0.025;

  // Exponential decay: strongest at tick 0, fading by tick 3
  const decay = Math.exp(-ticksSinceChange * 1.0);

  // Tempo dip: multiply by (1 - depth * decay)
  // e.g., depth=0.04, tick=0 → 0.96 (4% slower)
  return 1.0 - depth * decay;
}
