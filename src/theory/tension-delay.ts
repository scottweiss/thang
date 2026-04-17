/**
 * Tension-responsive delay — echo feedback tracks real-time tension.
 *
 * Completes the tension-responsive trio (brightness + space + delay):
 *
 * - High tension → more feedback, denser echoes (building intensity)
 * - Low tension → less feedback, cleaner signal (clarity in calm)
 * - Neutral → no change
 *
 * The wet mix stays relatively constant (controlled by delay-evolution.ts
 * based on section), but feedback amount fluctuates with tension,
 * creating a sense of echoes "multiplying" during tense passages.
 */

import type { Mood } from '../types';

/**
 * How strongly tension affects delay feedback per mood.
 */
const MOOD_SENSITIVITY: Record<Mood, number> = {
  ambient: 0.15,     // moderate — echoes are part of ambient's character,
  plantasia: 0.15,
  downtempo: 0.12,
  lofi: 0.1,
  trance: 0.2,       // strong — trance builds echo cascades
  avril: 0.08,       // gentle
  xtal: 0.18,        // notable — xtal has deep echo spaces
  syro: 0.25,        // strong — syro feedback builds are a signature
  blockhead: 0.15,
  flim: 0.12,
  disco: 0.18,
};

/**
 * Layers with delay that should respond to tension.
 */
const RESPONSIVE_LAYERS = new Set(['melody', 'harmony', 'arp', 'texture']);

/**
 * Compute delay feedback multiplier based on tension.
 * High tension → > 1.0 (more echo buildup), low → < 1.0 (cleaner).
 *
 * @param tension  Current overall tension (0-1)
 * @param mood     Current mood
 * @returns Feedback multiplier (typically 0.8 - 1.25)
 */
export function tensionDelayMultiplier(
  tension: number,
  mood: Mood
): number {
  const sensitivity = MOOD_SENSITIVITY[mood] ?? 0.12;

  // Same direction as brightness: high tension → more effect
  const offset = (tension - 0.5) * 2 * sensitivity;

  // Tighter clamp for delay to prevent runaway feedback
  return Math.max(0.7, Math.min(1.3, 1.0 + offset));
}

/**
 * Whether to apply tension delay for this layer.
 */
export function shouldApplyTensionDelay(layerName: string): boolean {
  return RESPONSIVE_LAYERS.has(layerName);
}
