/**
 * Perceptual loudness normalization — equal loudness across frequency ranges.
 *
 * Human hearing is less sensitive to very low and very high frequencies
 * (Fletcher-Munson curves). Layers in those ranges need gain compensation
 * to sound as loud as mid-range layers.
 *
 * Applied as a gain correction per layer based on center frequency.
 */

import type { Mood } from '../types';

/**
 * Per-mood normalization strength (higher = more correction).
 */
const NORMALIZATION_STRENGTH: Record<Mood, number> = {
  trance:    0.40,  // moderate
  avril:     0.50,  // strong — balanced orchestral sound
  disco:     0.35,  // moderate
  downtempo: 0.45,  // strong
  blockhead: 0.50,  // strong — punchy mix
  lofi:      0.40,  // moderate
  flim:      0.35,  // moderate
  xtal:      0.30,  // moderate — ambient lets natural curves exist
  syro:      0.25,  // weak — IDM embraces imbalance
  ambient:   0.20,  // weak — natural frequency rolloff is part of the sound,
  plantasia: 0.20,
};

/**
 * Simplified Fletcher-Munson correction at moderate listening levels.
 * Returns a gain multiplier to compensate for hearing sensitivity.
 *
 * @param centerFreq Approximate center frequency of the layer (Hz)
 * @returns Gain correction (0.8 - 1.3)
 */
function fletcherMunsonCorrection(centerFreq: number): number {
  // Human hearing is most sensitive ~2-4kHz
  // Less sensitive below 200Hz and above 8kHz
  const logFreq = Math.log2(Math.max(20, centerFreq));
  // Sensitivity peaks around 11.5 (log2 of ~2900Hz)
  const dist = Math.abs(logFreq - 11.5);
  // Farther from peak = needs more boost
  return 1.0 + dist * 0.04;
}

/**
 * Calculate perceptual loudness gain correction.
 *
 * @param centerFreq Layer center frequency (Hz)
 * @param mood Current mood
 * @returns Gain multiplier (0.85 - 1.25)
 */
export function perceptualGainCorrection(
  centerFreq: number,
  mood: Mood
): number {
  const strength = NORMALIZATION_STRENGTH[mood];
  const correction = fletcherMunsonCorrection(centerFreq);
  // Blend toward 1.0 by (1 - strength)
  const result = 1.0 + (correction - 1.0) * strength;
  return Math.max(0.85, Math.min(1.25, result));
}

/**
 * Get normalization strength for a mood (for testing).
 */
export function normalizationStrength(mood: Mood): number {
  return NORMALIZATION_STRENGTH[mood];
}
