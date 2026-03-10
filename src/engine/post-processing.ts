/**
 * Consolidated post-processing — single-pass compute-then-apply for effects.
 *
 * The old approach multiplied .room(), .lpf(), .delayfeedback() values through
 * 3-8 sequential regex stages, causing compounding. This module consolidates
 * all sources into single computed multipliers, then applies each effect with
 * one regex pass.
 *
 * Usage:
 *   const roomMult = computeFinalRoom(state, 'melody');
 *   pattern = applyRoomMultiplier(pattern, roomMult);
 */

import { roomMultiplier, roomsizeMultiplier, shouldApplySpatialDepth } from '../theory/spatial-depth';
import { tensionSpaceMultiplier, shouldApplyTensionSpace } from '../theory/tension-space';
import { ensembleRoomMultiplier, ensembleDelayMultiplier, shouldApplyEnsembleThinning } from '../theory/ensemble-thinning';
import { tensionBrightnessMultiplier, shouldApplyTensionBrightness } from '../theory/tension-brightness';
import { filterEnvelopeMultiplier, shouldApplyFilterEnvelope } from '../theory/filter-envelope';
import { delayFeedbackMultiplier, delayWetMultiplier, shouldApplyDelayEvolution } from '../theory/delay-evolution';
import { tensionDelayMultiplier, shouldApplyTensionDelay } from '../theory/tension-delay';
import type { Mood, Section } from '../types';

/* ──────────────── State interface ──────────────── */

export interface PostProcessState {
  section: Section;
  sectionProgress: number;
  tension: { overall: number };
  mood: Mood;
  activeLayers: Set<string>;
}

/* ──────────────── Internal helpers ──────────────── */

/** Safe multiply for regex replacements — prevents NaN cascade */
function safeMul(val: string, mult: number, decimals: number = 2): string {
  const n = parseFloat(val);
  if (isNaN(n) || isNaN(mult)) return val;
  return (n * mult).toFixed(decimals);
}

/* ──────────────── Compute functions ──────────────── */

/**
 * Consolidated room multiplier combining:
 * - spatial-depth (section-based room sweep)
 * - tension-space (tension dries/wettens reverb)
 * - ensemble-thinning (more layers → drier)
 */
export function computeFinalRoom(state: PostProcessState, layerName: string): number {
  let mult = 1.0;

  if (shouldApplySpatialDepth(state.section)) {
    mult *= roomMultiplier(state.section, state.sectionProgress, state.tension.overall);
  }

  if (shouldApplyTensionSpace(layerName)) {
    mult *= tensionSpaceMultiplier(state.tension.overall, state.mood);
  }

  if (shouldApplyEnsembleThinning(state.activeLayers.size)) {
    mult *= ensembleRoomMultiplier(state.activeLayers.size, state.mood);
  }

  return Math.max(0.05, mult);
}

/**
 * Consolidated roomsize multiplier combining:
 * - spatial-depth (section-based roomsize sweep)
 * - tension-space (same multiplier affects size)
 */
export function computeFinalRoomsize(state: PostProcessState, layerName: string): number {
  let mult = 1.0;

  if (shouldApplySpatialDepth(state.section)) {
    mult *= roomsizeMultiplier(state.section, state.sectionProgress);
  }

  if (shouldApplyTensionSpace(layerName)) {
    mult *= tensionSpaceMultiplier(state.tension.overall, state.mood);
  }

  return Math.max(0.05, mult);
}

/**
 * Consolidated LPF multiplier combining:
 * - filter-envelope (section-based sweep)
 * - tension-brightness (tension opens/closes filter)
 */
export function computeFinalLpf(state: PostProcessState, layerName: string): number {
  let mult = 1.0;

  if (shouldApplyFilterEnvelope(state.section)) {
    mult *= filterEnvelopeMultiplier(state.section, state.sectionProgress, state.tension.overall);
  }

  if (shouldApplyTensionBrightness(layerName)) {
    mult *= tensionBrightnessMultiplier(state.tension.overall, state.mood);
  }

  return Math.max(0.1, mult);
}

/**
 * Consolidated delay feedback multiplier combining:
 * - delay-evolution (section-based feedback sweep)
 * - tension-delay (tension increases/decreases echo density)
 * - ensemble-thinning (more layers → tighter delay)
 */
export function computeFinalDelayFeedback(state: PostProcessState, layerName: string): number {
  let mult = 1.0;

  if (shouldApplyDelayEvolution(state.section)) {
    mult *= delayFeedbackMultiplier(state.section, state.sectionProgress);
  }

  if (shouldApplyTensionDelay(layerName)) {
    mult *= tensionDelayMultiplier(state.tension.overall, state.mood);
  }

  if (shouldApplyEnsembleThinning(state.activeLayers.size)) {
    mult *= ensembleDelayMultiplier(state.activeLayers.size, state.mood);
  }

  return Math.max(0.05, mult);
}

/**
 * Consolidated delay wet multiplier from delay-evolution.
 */
export function computeFinalDelayWet(state: PostProcessState, _layerName: string): number {
  let mult = 1.0;

  if (shouldApplyDelayEvolution(state.section)) {
    mult *= delayWetMultiplier(state.section, state.sectionProgress);
  }

  return Math.max(0.05, mult);
}

/* ──────────────── Apply functions ──────────────── */

/**
 * Single regex pass replacing .room(N) values.
 * Skips if |mult - 1| <= 0.05 (near-unity, no audible change).
 */
export function applyRoomMultiplier(pattern: string, mult: number): string {
  if (Math.abs(mult - 1) <= 0.05) return pattern;
  return pattern.replace(/\.room\(([^)]+)\)/g, (_match, val) => {
    return `.room(${safeMul(val, mult)})`;
  });
}

/**
 * Single regex pass replacing .roomsize(N) values.
 * Skips if |mult - 1| <= 0.05.
 */
export function applyRoomsizeMultiplier(pattern: string, mult: number): string {
  if (Math.abs(mult - 1) <= 0.05) return pattern;
  return pattern.replace(/\.roomsize\(([^)]+)\)/g, (_match, val) => {
    return `.roomsize(${safeMul(val, mult)})`;
  });
}

/**
 * Single regex pass replacing .lpf(N) values.
 * Skips if |mult - 1| <= 0.05.
 * Uses 0 decimal places for LPF (frequency values are integers).
 */
export function applyLpfMultiplier(pattern: string, mult: number): string {
  if (Math.abs(mult - 1) <= 0.05) return pattern;
  return pattern.replace(/\.lpf\(([^)]+)\)/g, (_match, val) => {
    return `.lpf(${safeMul(val, mult, 0)})`;
  });
}

/**
 * Single regex pass replacing .delayfeedback(N) values.
 * Caps result at 0.85 to prevent runaway feedback.
 * Skips if |mult - 1| <= 0.05.
 */
export function applyDelayFeedbackMultiplier(pattern: string, mult: number): string {
  if (Math.abs(mult - 1) <= 0.05) return pattern;
  return pattern.replace(/\.delayfeedback\(([^)]+)\)/g, (_match, val) => {
    const n = parseFloat(val);
    if (isNaN(n) || isNaN(mult)) return `.delayfeedback(${val})`;
    const result = Math.min(0.85, n * mult);
    return `.delayfeedback(${result.toFixed(2)})`;
  });
}

/**
 * Single regex pass replacing .delay(N) values (wet amount only).
 * Uses a negative lookahead to avoid matching .delayfeedback() or .delaytime().
 * Caps result at 1.0.
 * Skips if |mult - 1| <= 0.05.
 */
export function applyDelayWetMultiplier(pattern: string, mult: number): string {
  if (Math.abs(mult - 1) <= 0.05) return pattern;
  return pattern.replace(/\.delay\(([^)]+)\)(?!feedback|time)/g, (_match, val) => {
    const n = parseFloat(val);
    if (isNaN(n) || isNaN(mult)) return `.delay(${val})`;
    const result = Math.min(1.0, n * mult);
    return `.delay(${result.toFixed(2)})`;
  });
}
