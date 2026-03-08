/**
 * Arrival emphasis — cadential resolution accent.
 *
 * In real performances, the moment a dominant chord resolves to tonic
 * carries special weight. Musicians instinctively lean into the arrival:
 * a brief gain swell, a brightness spike, a moment of fullness before
 * the music settles into the new chord.
 *
 * This module detects cadential arrivals (V→I, V7→I, vii°→I, IV→I)
 * and provides decaying emphasis values that layers can use to create
 * that satisfying moment of resolution.
 *
 * Emphasis decays exponentially over 2-3 ticks (~4-6 seconds),
 * simulating the natural "landing" of a resolved phrase.
 */

import type { ChordQuality, Mood } from '../types';
import { resolutionPull } from './chord-tension';

/**
 * Emphasis values for the arrival moment.
 */
export interface ArrivalEmphasis {
  /** Extra gain multiplier (0 = no boost, 0.2 = 20% louder) */
  gainBoost: number;
  /** Extra brightness multiplier (0 = no change, 0.3 = 30% brighter) */
  brightnessBoost: number;
}

/** No emphasis — used as default/fallback */
const NO_EMPHASIS: ArrivalEmphasis = { gainBoost: 0, brightnessBoost: 0 };

/**
 * Per-mood sensitivity to arrival emphasis.
 * Some moods want dramatic arrivals; others are too steady.
 */
const MOOD_ARRIVAL_SENSITIVITY: Partial<Record<Mood, number>> = {
  ambient: 0.5,       // gentle swells
  downtempo: 0.6,     // satisfying drops
  lofi: 0.5,          // subtle warmth
  trance: 0.3,        // rigid, less rubato
  avril: 0.8,         // intimate, expressive arrivals
  xtal: 0.7,          // dreamy emphasis
  syro: 0.4,          // tight but present
  blockhead: 0.6,     // punchy drops
  flim: 0.7,          // gentle emphasis
  disco: 0.3,         // steady groove, less rubato
};

/**
 * Cadence strength based on the preceding chord.
 * Authentic cadence (V→I) is the gold standard of resolution.
 */
function cadenceStrength(
  prevDegree: number,
  prevQuality: ChordQuality
): number {
  // Use resolution pull from chord-tension — it already encodes
  // how strongly each chord wants to resolve to I
  return resolutionPull(prevDegree, prevQuality);
}

/**
 * Detect if a chord change represents a cadential arrival.
 *
 * An arrival occurs when:
 * 1. The current chord is tonic (degree 0)
 * 2. The previous chord had resolution pull > 0.3
 *
 * @param currentDegree  Degree of the chord we just moved TO
 * @param prevDegree     Degree of the chord we moved FROM
 * @param prevQuality    Quality of the chord we moved FROM
 * @returns true if this is a cadential arrival
 */
export function isCadentialArrival(
  currentDegree: number,
  prevDegree: number,
  prevQuality: ChordQuality
): boolean {
  // Must arrive at tonic
  if (currentDegree !== 0) return false;
  // Previous chord must have meaningful resolution pull
  return cadenceStrength(prevDegree, prevQuality) > 0.3;
}

/**
 * Compute arrival emphasis for the current moment.
 *
 * Returns gain and brightness boosts that decay exponentially
 * after the arrival. Peak emphasis is at tick 0, nearly gone by tick 3.
 *
 * @param currentDegree     Current chord degree
 * @param prevDegree        Previous chord degree
 * @param prevQuality       Previous chord quality
 * @param ticksSinceChange  Ticks since the chord changed (0 = just changed)
 * @param mood              Current mood
 * @returns Emphasis values (both 0 if not an arrival or already decayed)
 */
export function arrivalEmphasis(
  currentDegree: number,
  prevDegree: number,
  prevQuality: ChordQuality,
  ticksSinceChange: number,
  mood: Mood
): ArrivalEmphasis {
  // Not an arrival — no emphasis
  if (!isCadentialArrival(currentDegree, prevDegree, prevQuality)) {
    return NO_EMPHASIS;
  }

  // Emphasis has decayed away after 3 ticks
  if (ticksSinceChange > 3) return NO_EMPHASIS;

  const strength = cadenceStrength(prevDegree, prevQuality);
  const sensitivity = MOOD_ARRIVAL_SENSITIVITY[mood] ?? 0.5;

  // Exponential decay: e^(-t) gives ~0.37 at t=1, ~0.14 at t=2, ~0.05 at t=3
  const decay = Math.exp(-ticksSinceChange * 1.2);

  // Peak emphasis scaled by cadence strength and mood sensitivity
  const peakGain = strength * sensitivity * 0.2;       // max ~0.19 for V7→I in avril
  const peakBrightness = strength * sensitivity * 0.25; // max ~0.24

  return {
    gainBoost: peakGain * decay,
    brightnessBoost: peakBrightness * decay,
  };
}
