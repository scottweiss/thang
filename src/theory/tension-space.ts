/**
 * Tension-responsive spatial depth — reverb tracks real-time tension.
 *
 * While spatial-depth.ts modulates reverb based on section progress,
 * this module adds a secondary modulation tied to overall tension.
 * The effect creates an intimate/distant polarity:
 *
 * - High tension → drier, closer (reduced room) — "in your face"
 * - Low tension → wetter, more spacious (increased room) — dreamy/distant
 * - Neutral → no change
 *
 * This is a common production technique — compressing the soundstage
 * during climactic moments pulls the listener in, while opening it
 * during calm passages creates a sense of vast space.
 */

import type { Mood } from '../types';

/**
 * How strongly tension affects reverb wetness per mood.
 * Higher = more dramatic spatial shifts.
 */
const MOOD_SENSITIVITY: Record<Mood, number> = {
  ambient: 0.2,      // moderate — ambient's reverb IS the instrument,
  plantasia: 0.2,
  downtempo: 0.15,
  lofi: 0.12,
  trance: 0.25,      // strong — trance builds compress space dramatically
  avril: 0.1,        // gentle — avril stays spacious
  xtal: 0.2,         // moderate — xtal has deep reverb character
  syro: 0.3,         // strong — syro squeezes space at peaks
  blockhead: 0.18,
  flim: 0.15,
  disco: 0.22,
};

/**
 * Layers that should respond to tension space.
 * Drone is included (bass reverb contributes to spaciousness).
 * Atmosphere excluded (it should maintain consistent wash).
 */
const RESPONSIVE_LAYERS = new Set(['drone', 'harmony', 'melody', 'arp', 'texture']);

/**
 * Compute a room/roomsize multiplier based on tension.
 * High tension → < 1.0 (drier), low tension → > 1.0 (wetter).
 *
 * @param tension  Current overall tension (0-1)
 * @param mood     Current mood
 * @returns Room multiplier (typically 0.75 - 1.25)
 */
export function tensionSpaceMultiplier(
  tension: number,
  mood: Mood
): number {
  const sensitivity = MOOD_SENSITIVITY[mood] ?? 0.15;

  // Invert from tension-brightness: high tension = LESS reverb
  // Center at 0.5 tension = 1.0 multiplier
  const offset = (0.5 - tension) * 2 * sensitivity;

  return Math.max(0.5, Math.min(1.5, 1.0 + offset));
}

/**
 * Whether to apply tension space for this layer.
 */
export function shouldApplyTensionSpace(layerName: string): boolean {
  return RESPONSIVE_LAYERS.has(layerName);
}
