/**
 * Auditory stream fusion — onset synchrony for perceived unity.
 *
 * When melody and arp onsets align within ~30ms, the brain fuses
 * them into a single auditory "stream." When they drift apart,
 * they split into competing sources. This module detects alignment
 * and nudges late offsets to promote or prevent fusion per mood.
 *
 * Applied as .late() corrections to promote stream coherence.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood fusion preference (higher = more fusion desired).
 */
const FUSION_PREFERENCE: Record<Mood, number> = {
  trance:    0.60,  // strong fusion — wall of sound
  avril:     0.40,  // moderate — some independence
  disco:     0.55,  // tight groove fusion
  downtempo: 0.35,  // moderate
  blockhead: 0.45,  // moderate
  lofi:      0.30,  // jazz — independence valued
  flim:      0.25,  // organic — some separation
  xtal:      0.20,  // pointillistic — separation OK
  syro:      0.15,  // IDM — fragmentation is a feature
  ambient:   0.10,  // minimal — floating layers
};

/**
 * Fusion window in seconds. Onsets within this window fuse perceptually.
 */
const FUSION_WINDOW = 0.030; // 30ms

/**
 * Calculate timing correction to promote stream fusion.
 * If two layers' onsets are just outside the fusion window,
 * pull the late one closer.
 *
 * @param layerOffset Current .late() offset of this layer (seconds)
 * @param targetOffset The reference layer's offset (seconds)
 * @param mood Current mood
 * @returns Corrected offset (seconds)
 */
export function fusionCorrection(
  layerOffset: number,
  targetOffset: number,
  mood: Mood
): number {
  const pref = FUSION_PREFERENCE[mood];
  const gap = Math.abs(layerOffset - targetOffset);

  // If already within fusion window, no correction needed
  if (gap <= FUSION_WINDOW) return layerOffset;

  // If close to fusion window, pull toward it
  if (gap < FUSION_WINDOW * 3) {
    const pull = (gap - FUSION_WINDOW) * pref;
    const direction = layerOffset > targetOffset ? -1 : 1;
    return layerOffset + direction * pull;
  }

  return layerOffset; // too far apart — let them be independent
}

/**
 * Calculate gain coherence boost when layers are fused.
 * Fused streams should have balanced gain.
 *
 * @param gapMs Onset gap in milliseconds between layers
 * @param mood Current mood
 * @returns Gain multiplier for the secondary layer (0.95 - 1.1)
 */
export function fusionGainBalance(
  gapMs: number,
  mood: Mood
): number {
  const pref = FUSION_PREFERENCE[mood];
  if (gapMs > 30) return 1.0; // not fused

  // When fused, slightly boost the quieter layer for coherent stream
  const fusionDegree = 1.0 - (gapMs / 30);
  return Math.min(1.1, 1.0 + fusionDegree * pref * 0.1);
}

/**
 * Should fusion processing be applied?
 */
export function shouldApplyFusion(mood: Mood, section: Section): boolean {
  const sectionMult: Record<Section, number> = {
    intro: 0.8, build: 1.2, peak: 1.0, breakdown: 0.6, groove: 1.0,
  };
  return FUSION_PREFERENCE[mood] * (sectionMult[section] ?? 1.0) > 0.08;
}

/**
 * Get fusion preference for a mood (for testing).
 */
export function fusionPreference(mood: Mood): number {
  return FUSION_PREFERENCE[mood];
}
