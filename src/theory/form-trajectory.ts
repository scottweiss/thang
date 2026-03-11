/**
 * Form trajectory — long-range structural arc across the entire piece.
 *
 * Real compositions have an overall shape: introduction, rising action,
 * climax, and denouement. This module tracks the global position in
 * the form and provides trajectory-based modifiers that create a sense
 * of journey across many sections.
 *
 * The trajectory follows a modified bell curve:
 * - Early phase (0-25%): establishing — lower energy ceiling
 * - Rising phase (25-60%): building — energy gradually increases
 * - Climax zone (60-80%): peak intensity — everything at maximum
 * - Denouement (80-100%): unwinding — gradual energy decrease
 *
 * This affects:
 * - Maximum allowed tension (early = lower ceiling)
 * - Section transition probabilities (early = more intros/builds)
 * - Harmonic rhythm speed (climax = faster changes)
 * - Dynamic range (climax = louder peaks, denouement = softer)
 */

import type { Mood, Section } from '../types';

export interface TrajectoryState {
  /** Ticks elapsed since piece start */
  ticksElapsed: number;
  /** Estimated total form length in ticks (adjustable) */
  formLength: number;
}

/**
 * Phase of the overall form.
 */
export type FormPhase = 'establishing' | 'rising' | 'climax' | 'denouement';

/**
 * Get the current form position as 0-1.
 * Cycles: after completing one arc, a new arc begins.
 * The transition from denouement back to establishing
 * creates a natural large-scale rhythm of tension and release.
 */
export function formPosition(state: TrajectoryState): number {
  if (state.formLength <= 0) return 0.5;
  return Math.min(1.0, state.ticksElapsed / state.formLength);
}

/**
 * Determine the current form phase.
 */
export function currentPhase(state: TrajectoryState): FormPhase {
  const pos = formPosition(state);
  if (pos < 0.25) return 'establishing';
  if (pos < 0.60) return 'rising';
  if (pos < 0.80) return 'climax';
  return 'denouement';
}

/**
 * Energy envelope — a smooth curve that defines the overall
 * energy level across the form. Returns 0-1.
 *
 * Shape: slow rise → accelerating rise → plateau → gradual descent
 * Uses a skewed bell curve peaking around 70% through the piece.
 */
export function energyEnvelope(state: TrajectoryState): number {
  const pos = formPosition(state);

  // Skewed gaussian centered at 0.7 with sigma 0.25
  const center = 0.7;
  const sigma = 0.25;
  const gaussian = Math.exp(-Math.pow(pos - center, 2) / (2 * sigma * sigma));

  // Blend with a rising floor so early sections aren't too quiet
  const floor = 0.3 + pos * 0.2;

  return Math.min(1.0, Math.max(floor, gaussian));
}

/**
 * Maximum tension ceiling based on form position.
 * Early in the piece, tension is capped lower to leave room for growth.
 * At the climax, full tension range is available.
 */
export function tensionCeiling(state: TrajectoryState): number {
  const phase = currentPhase(state);
  switch (phase) {
    case 'establishing': return 0.5 + formPosition(state) * 0.4;
    case 'rising': return 0.7 + (formPosition(state) - 0.25) * 0.85;
    case 'climax': return 1.0;
    case 'denouement': return 0.8 - (formPosition(state) - 0.8) * 1.5;
  }
}

/**
 * Gain multiplier from the form trajectory.
 * Applies a gentle dynamic arc — climax is loudest, early/late are softer.
 */
export function trajectoryGainMultiplier(state: TrajectoryState): number {
  const energy = energyEnvelope(state);
  // Map energy 0-1 to gain multiplier 0.78-1.12
  // ~3 dB range between establishing and climax for perceptible macro arc
  return 0.78 + energy * 0.34;
}

/**
 * Section preference weights based on form position.
 * Returns multipliers for each section type that bias the section manager's
 * transition probabilities.
 *
 * Early: favors intro, build (establishing material)
 * Rising: favors build, groove (developing energy)
 * Climax: favors peak, groove (maximum intensity)
 * Denouement: favors breakdown, groove (unwinding)
 */
export function sectionPreference(state: TrajectoryState): Record<Section, number> {
  const phase = currentPhase(state);

  switch (phase) {
    case 'establishing':
      return { intro: 2.0, build: 1.5, peak: 0.3, breakdown: 0.8, groove: 1.0 };
    case 'rising':
      return { intro: 0.3, build: 2.0, peak: 1.0, breakdown: 0.5, groove: 1.5 };
    case 'climax':
      return { intro: 0.1, build: 0.5, peak: 2.5, breakdown: 0.3, groove: 1.5 };
    case 'denouement':
      return { intro: 0.5, build: 0.3, peak: 0.3, breakdown: 2.0, groove: 1.5 };
  }
}

/**
 * Per-mood form length (in ticks).
 * Faster moods have shorter forms; ambient has very long arcs.
 */
export function moodFormLength(mood: Mood): number {
  const lengths: Record<Mood, number> = {
    ambient: 120,
    avril: 100,
    xtal: 100,
    flim: 90,
    downtempo: 80,
    lofi: 70,
    blockhead: 70,
    disco: 60,
    trance: 60,
    syro: 50,
  };
  return lengths[mood];
}
