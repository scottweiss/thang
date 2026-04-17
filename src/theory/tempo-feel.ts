/**
 * Tempo feel — subtle tempo fluctuations that make rhythm feel alive.
 *
 * Mechanical quantized rhythm sounds robotic. Human musicians naturally
 * fluctuate tempo: slightly rushing through exciting passages, pulling
 * back at transitions, breathing with the phrase structure.
 *
 * This module provides a continuous tempo multiplier that creates
 * micro-fluctuations, distinct from rubato (which is cadence-specific)
 * and tempo-trajectory (which is section-level). This operates at
 * the phrase level — a gentle sine wave of tempo variation.
 *
 * The fluctuation is very subtle (±1-3%) but creates the difference
 * between "dead" and "alive" sounding rhythm.
 *
 * Different moods have different tempo feel:
 * - Jazz (lofi): noticeable fluctuation (±3%, slow breathing)
 * - Trance: very tight (±0.5%, mechanical feel is desirable)
 * - Ambient: moderate fluctuation (±2%, organic breathing)
 */

import type { Mood, Section } from '../types';

/** Maximum tempo fluctuation per mood (as fraction, e.g., 0.03 = ±3%) */
const FLUCTUATION_DEPTH: Record<Mood, number> = {
  lofi:      0.020,   // jazz breathing (was 0.030)
  avril:     0.018,   // singer-songwriter feel (was 0.025)
  flim:      0.015,   // organic IDM (was 0.025)
  downtempo: 0.015,   // laid back feel (was 0.020)
  xtal:      0.012,   // dreamy fluctuation (was 0.018)
  ambient:   0.010,   // organic breathing (was 0.020),
  plantasia: 0.010,
  blockhead: 0.008,   // hip-hop pocket (was 0.015)
  syro:      0.006,   // tight but not mechanical (was 0.010)
  disco:     0.004,   // groove-locked (was 0.012)
  trance:    0.003,   // near-mechanical (was 0.005)
};

/** Fluctuation cycle period in ticks (how often tempo breathes) */
const CYCLE_PERIOD: Record<Mood, number> = {
  lofi:      12,    // slow breathing (~24 seconds)
  avril:     10,    // moderate breathing
  flim:      8,     // quicker breathing
  downtempo: 14,    // very slow breathing
  ambient:   16,    // slowest breathing,
  plantasia: 16,
  xtal:      14,    // slow
  blockhead: 8,     // moderate
  disco:     6,     // quicker feel
  syro:      5,     // quick fluctuation
  trance:    8,     // moderate cycle
};

/** Section modifies fluctuation depth */
const SECTION_DEPTH_MULT: Record<Section, number> = {
  intro:     1.2,    // more organic at start
  build:     0.8,    // tightens toward peak
  peak:      0.6,    // tightest at peak
  breakdown: 1.5,    // most organic at breakdown
  groove:    1.0,    // neutral
};

/**
 * Compute a tempo multiplier for the current tick.
 * Returns a value close to 1.0 (e.g., 0.97-1.03) that should be
 * applied to the .slow() or cycle rate.
 *
 * @param tick     Current tick
 * @param mood     Current mood
 * @param section  Current section
 * @returns Tempo multiplier (0.95-1.05)
 */
export function tempoFeelMultiplier(
  tick: number,
  mood: Mood,
  section: Section
): number {
  const depth = FLUCTUATION_DEPTH[mood] * (SECTION_DEPTH_MULT[section] ?? 1.0);
  const period = CYCLE_PERIOD[mood];

  // Sine wave fluctuation with slight asymmetry (rush slightly faster than drag)
  const phase = (tick / period) * Math.PI * 2;
  const sine = Math.sin(phase);

  // Asymmetric: rushing (positive) is slightly more pronounced
  const asymmetry = sine > 0 ? 1.1 : 0.9;

  return 1.0 + sine * depth * asymmetry;
}

/**
 * Whether tempo feel should be applied.
 */
export function shouldApplyTempoFeel(mood: Mood): boolean {
  return FLUCTUATION_DEPTH[mood] >= 0.005;
}

/**
 * Get fluctuation depth for a mood (for testing).
 */
export function tempoFeelDepth(mood: Mood): number {
  return FLUCTUATION_DEPTH[mood];
}
