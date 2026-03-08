/**
 * Spectral width — voicing spread affects filter bandwidth.
 *
 * Wide voicings (notes spread across registers) need wider filter
 * bandwidth to let all voices through. Tight/closed voicings can
 * use narrower filters for more focused sound.
 *
 * Applied as LPF/Q adjustment based on voicing interval span.
 */

import type { Mood } from '../types';

/**
 * Per-mood width sensitivity (higher = more filter response to voicing width).
 */
const WIDTH_SENSITIVITY: Record<Mood, number> = {
  trance:    0.30,  // moderate
  avril:     0.50,  // strong — orchestral clarity
  disco:     0.20,  // weak — bright everywhere
  downtempo: 0.35,  // moderate
  blockhead: 0.25,  // weak — punchy everywhere
  lofi:      0.45,  // strong — warm filter tracking
  flim:      0.40,  // moderate
  xtal:      0.55,  // strongest — detailed filtering
  syro:      0.35,  // moderate — acid filter
  ambient:   0.50,  // strong — evolving filters
};

/**
 * Calculate voicing span in semitones from pitch classes.
 *
 * @param pitchClasses Array of pitch classes (0-11)
 * @returns Span in semitones (0-11)
 */
export function voicingSpan(pitchClasses: number[]): number {
  if (pitchClasses.length <= 1) return 0;
  const sorted = [...pitchClasses].sort((a, b) => a - b);
  // Use the widest interval between consecutive notes on the circle
  let maxGap = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    maxGap = Math.max(maxGap, sorted[i + 1] - sorted[i]);
  }
  // Also check wrap-around gap
  const wrapGap = 12 - sorted[sorted.length - 1] + sorted[0];
  maxGap = Math.max(maxGap, wrapGap);
  // Span is 12 minus the largest gap (the complement of the widest gap)
  return 12 - maxGap;
}

/**
 * LPF multiplier based on voicing width.
 * Wide voicings get higher LPF (more bandwidth).
 *
 * @param pitchClasses Array of pitch classes (0-11)
 * @param mood Current mood
 * @returns LPF multiplier (0.9 - 1.2)
 */
export function spectralWidthLpf(
  pitchClasses: number[],
  mood: Mood
): number {
  const span = voicingSpan(pitchClasses);
  const sensitivity = WIDTH_SENSITIVITY[mood];
  // Wider span → higher LPF multiplier
  const widthFactor = (span / 11) * 0.3 * sensitivity;
  return Math.max(0.9, Math.min(1.2, 1.0 + widthFactor));
}

/**
 * Get width sensitivity for a mood (for testing).
 */
export function widthSensitivity(mood: Mood): number {
  return WIDTH_SENSITIVITY[mood];
}
