/**
 * Ensemble thinning — reduce synthesis complexity when many layers play.
 *
 * Orchestration principle: a soloist plays expressively, but in a full
 * ensemble each player restrains their tone to blend. Similarly:
 * - Few layers active → richer FM, more reverb, wider stereo
 * - Many layers active → cleaner tones, drier mix, tighter stereo
 *
 * This prevents frequency masking and mud when the full ensemble plays,
 * while allowing individual layers to shine when they have more room.
 *
 * Applied as multipliers to FM index, reverb amount, and delay feedback.
 */

import type { Mood } from '../types';

/**
 * How much each mood responds to ensemble thinning.
 * Dense moods (syro, trance) thin more aggressively; sparse moods less.
 */
const MOOD_SENSITIVITY: Record<Mood, number> = {
  ambient:   0.15,  // already sparse — minimal thinning
  downtempo: 0.30,
  lofi:      0.35,
  trance:    0.45,  // dense — needs aggressive thinning
  avril:     0.20,  // intimate — light thinning
  xtal:      0.20,
  syro:      0.50,  // very dense IDM — most thinning
  blockhead: 0.40,
  flim:      0.25,
  disco:     0.40,
};

/**
 * FM index multiplier based on active layer count.
 * Fewer layers → richer FM; more layers → cleaner tones.
 *
 * @param activeLayerCount Number of currently active layers (1-6)
 * @param mood             Current mood
 * @returns Multiplier for FM index (0.5-1.2)
 */
export function ensembleFmMultiplier(activeLayerCount: number, mood: Mood): number {
  const sensitivity = MOOD_SENSITIVITY[mood];
  // At 1-2 layers, boost FM. At 5-6 layers, reduce FM.
  // Neutral at 3 layers.
  const delta = 3 - Math.max(1, Math.min(6, activeLayerCount));
  return 1.0 + delta * sensitivity * 0.12;
}

/**
 * Reverb/room multiplier based on active layer count.
 * Fewer layers → more spacious reverb; more layers → drier.
 *
 * @param activeLayerCount Number of currently active layers (1-6)
 * @param mood             Current mood
 * @returns Multiplier for room/reverb amount (0.4-1.3)
 */
export function ensembleRoomMultiplier(activeLayerCount: number, mood: Mood): number {
  const sensitivity = MOOD_SENSITIVITY[mood];
  const delta = 3 - Math.max(1, Math.min(6, activeLayerCount));
  return 1.0 + delta * sensitivity * 0.15;
}

/**
 * Delay feedback multiplier based on active layer count.
 * Fewer layers → longer echoes; more layers → tighter delay.
 *
 * @param activeLayerCount Number of currently active layers (1-6)
 * @param mood             Current mood
 * @returns Multiplier for delay feedback (0.5-1.2)
 */
export function ensembleDelayMultiplier(activeLayerCount: number, mood: Mood): number {
  const sensitivity = MOOD_SENSITIVITY[mood];
  const delta = 3 - Math.max(1, Math.min(6, activeLayerCount));
  return 1.0 + delta * sensitivity * 0.10;
}

/**
 * Whether ensemble thinning should be applied.
 * Always useful when 2+ layers are active.
 */
export function shouldApplyEnsembleThinning(activeLayerCount: number): boolean {
  return activeLayerCount >= 2;
}
