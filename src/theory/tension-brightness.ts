/**
 * Tension-responsive brightness — LPF tracks real-time tension.
 *
 * While filter-envelope.ts sweeps LPF based on section progress,
 * this module adds a secondary modulation based on overall tension.
 * The effect is like a guitarist's wah pedal tracking the emotional
 * intensity of the music:
 *
 * - High tension → filter opens → brighter, more urgent
 * - Low tension → filter closes → warmer, more subdued
 * - Neutral → no change
 *
 * This creates a real-time spectral response to harmonic tension,
 * making the timbral color of the piece follow its emotional arc.
 */

import type { Mood } from '../types';

/**
 * How strongly tension affects filter frequency, per mood.
 * Higher = more dramatic brightness swings.
 * Expressed as a fraction of the current LPF value.
 */
const MOOD_SENSITIVITY: Record<Mood, number> = {
  ambient: 0.1,      // very subtle — ambient doesn't want dramatic shifts
  downtempo: 0.15,
  lofi: 0.12,
  trance: 0.25,      // strong — trance filter sweeps are a defining feature
  avril: 0.08,       // minimal — avril is intimate
  xtal: 0.12,
  syro: 0.3,         // strongest — syro is hyperactive
  blockhead: 0.2,
  flim: 0.1,
  disco: 0.22,       // noticeable — disco filter tracking
};

/**
 * Layers that should respond to tension brightness.
 * Drone is excluded (bass shouldn't brighten dramatically).
 * Atmosphere is excluded (it's background wash).
 */
const RESPONSIVE_LAYERS = new Set(['melody', 'harmony', 'arp', 'texture']);

/**
 * Compute a LPF frequency multiplier based on tension.
 *
 * @param tension  Current overall tension (0-1)
 * @param mood     Current mood
 * @returns LPF multiplier (0.85 - 1.3 typically)
 */
export function tensionBrightnessMultiplier(
  tension: number,
  mood: Mood
): number {
  const sensitivity = MOOD_SENSITIVITY[mood] ?? 0.15;

  // Center around 0.5 tension = 1.0 multiplier
  // Low tension → < 1.0, high tension → > 1.0
  const offset = (tension - 0.5) * 2 * sensitivity;

  return 1.0 + offset;
}

/**
 * Whether to apply tension brightness for this layer.
 */
export function shouldApplyTensionBrightness(layerName: string): boolean {
  return RESPONSIVE_LAYERS.has(layerName);
}
