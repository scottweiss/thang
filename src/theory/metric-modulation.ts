/**
 * Metric modulation — reinterpret rhythmic subdivisions to create
 * perceived tempo shifts without changing the actual BPM.
 *
 * In acoustic music, metric modulation (Elliott Carter) redefines
 * which note value gets the beat: e.g., triplet eighth notes at 120 BPM
 * become regular eighths at 180 BPM (= 120 * 3/2).
 *
 * In our generative context, we achieve this by temporarily changing
 * the `.slow()` divisor during section transitions, creating a sense
 * of acceleration or deceleration that resolves into the new section.
 *
 * Ratios:
 *   3:2 — triplet feel → creates ~50% speedup illusion
 *   4:3 — dotted feel → creates ~33% speedup illusion
 *   2:3 — inverse triplet → creates ~33% slowdown illusion
 *   3:4 — inverse dotted → creates ~25% slowdown illusion
 */

import type { Mood, Section } from '../types';

export type ModulationRatio = '3:2' | '4:3' | '2:3' | '3:4';

/** Numeric values for each ratio */
const RATIO_VALUES: Record<ModulationRatio, number> = {
  '3:2': 3 / 2,   // acceleration
  '4:3': 4 / 3,   // mild acceleration
  '2:3': 2 / 3,   // deceleration
  '3:4': 3 / 4,   // mild deceleration
};

/** How much each mood uses metric modulation (0-1) */
const MODULATION_TENDENCY: Record<Mood, number> = {
  syro:      0.25,  // IDM — rhythmic complexity (was 0.35)
  flim:      0.18,  // glitchy transitions (was 0.25)
  lofi:      0.12,  // jazz — tempo shifts (was 0.20)
  blockhead: 0.10,  // hip-hop — occasional (was 0.30)
  downtempo: 0.08,  // subtle (was 0.10)
  avril:     0.05,  // rare (was 0.08)
  xtal:      0.03,  // mostly static (was 0.05)
  disco:     0.0,   // groove-locked — no metric modulation (was 0.15)
  trance:    0.0,   // groove-locked — no metric modulation (was 0.12)
  ambient:   0.0,   // no metric modulation (was 0.03)
};

/** Which transitions favor acceleration vs deceleration */
const TRANSITION_DIRECTION: Record<string, 'accelerate' | 'decelerate'> = {
  'intro→build':     'accelerate',
  'build→peak':      'accelerate',
  'peak→breakdown':  'decelerate',
  'breakdown→groove':'accelerate',
  'groove→build':    'accelerate',
  'groove→breakdown':'decelerate',
  'peak→groove':     'decelerate',
  'intro→groove':    'accelerate',
};

/**
 * Determine whether metric modulation should occur during a transition.
 *
 * @param fromSection  Section we're leaving
 * @param toSection    Section we're entering
 * @param mood         Current mood
 * @param tick         Current tick (for determinism)
 */
export function shouldModulate(
  fromSection: Section,
  toSection: Section,
  mood: Mood,
  tick: number
): boolean {
  if (fromSection === toSection) return false;
  const tendency = MODULATION_TENDENCY[mood];
  const hash = ((tick * 2654435761 + 1999) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Select the modulation ratio for a transition.
 * Acceleration uses 3:2 or 4:3; deceleration uses 2:3 or 3:4.
 *
 * @param fromSection  Section leaving
 * @param toSection    Section entering
 * @param mood         Current mood
 * @param tick         Tick for deterministic selection
 */
export function modulationRatio(
  fromSection: Section,
  toSection: Section,
  mood: Mood,
  tick: number
): ModulationRatio {
  const key = `${fromSection}→${toSection}`;
  const direction = TRANSITION_DIRECTION[key] ?? 'accelerate';

  // Stronger moods (syro, blockhead) get more dramatic ratios
  const dramatic = MODULATION_TENDENCY[mood] > 0.2;

  if (direction === 'accelerate') {
    return dramatic ? '3:2' : '4:3';
  } else {
    return dramatic ? '2:3' : '3:4';
  }
}

/**
 * Get the .slow() multiplier for metric modulation.
 * Apply to a layer's pattern during the transition window.
 *
 * @param ratio  The modulation ratio
 * @returns Multiplier for .slow() value
 */
export function modulationSlowMult(ratio: ModulationRatio): number {
  return RATIO_VALUES[ratio];
}

/**
 * Calculate how many ticks the modulation window lasts.
 * Typically 2-4 ticks (4-8 seconds) to let the listener feel the shift.
 */
export function modulationWindowTicks(mood: Mood): number {
  // Faster moods get shorter windows
  if (MODULATION_TENDENCY[mood] > 0.25) return 2;
  if (MODULATION_TENDENCY[mood] > 0.1) return 3;
  return 4;
}

/**
 * Get the interpolated modulation multiplier during the transition window.
 * Ramps from 1.0 → ratio → 1.0 over the window for a smooth effect.
 *
 * @param progress  0-1 progress through the modulation window
 * @param ratio     Target ratio
 * @returns Current multiplier (1.0 at edges, ratio at peak)
 */
export function modulationEnvelope(progress: number, ratio: ModulationRatio): number {
  const target = RATIO_VALUES[ratio];
  // Bell curve: sin(π * progress) peaks at 0.5
  const envelope = Math.sin(Math.PI * Math.max(0, Math.min(1, progress)));
  // Interpolate from 1.0 toward target
  return 1.0 + (target - 1.0) * envelope;
}

/**
 * Get modulation tendency for a mood (for testing).
 */
export function modulationTendency(mood: Mood): number {
  return MODULATION_TENDENCY[mood];
}
