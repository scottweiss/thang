/**
 * Harmonic rhythm patterning — grouped chord change timings.
 *
 * In composed music, chord changes don't happen at uniform intervals.
 * They follow rhythmic patterns that add interest:
 *
 * - **Quick-quick-slow**: Two fast changes then a sustained chord
 *   (creates momentum then resolution, like a musical sigh)
 * - **Long-short**: A long chord followed by a quick change
 *   (creates anticipation then surprise)
 * - **Accelerando**: Progressively shorter chord durations
 *   (builds urgency — used in build sections)
 * - **Even**: Uniform changes (used for stable grooves)
 *
 * The pattern is selected per-section and evolves with mood.
 * Returns a timing multiplier that the chord evolution engine
 * applies to the base chord change interval.
 */

import type { Mood, Section } from '../types';

export type HarmonicRhythmPattern = 'quick-quick-slow' | 'long-short' | 'accelerando' | 'even';

/** Section → preferred harmonic rhythm pattern */
const SECTION_PATTERNS: Record<Section, HarmonicRhythmPattern[]> = {
  intro:     ['long-short', 'even'],
  build:     ['accelerando', 'quick-quick-slow'],
  peak:      ['quick-quick-slow', 'even'],
  breakdown: ['long-short', 'even'],
  groove:    ['even', 'quick-quick-slow'],
};

/** Per-mood tendency toward patterned (vs even) harmonic rhythm */
const PATTERN_TENDENCY: Record<Mood, number> = {
  lofi:      0.50,   // jazz — strong rhythmic harmony
  downtempo: 0.40,   // smooth — some variation
  avril:     0.45,   // intimate — expressive timing
  flim:      0.40,   // delicate — gentle variation
  xtal:      0.30,   // dreamy — some drift
  blockhead: 0.45,   // hip-hop — groove-driven
  disco:     0.35,   // funk — rhythmic but steady
  syro:      0.55,   // IDM — irregular timing
  trance:    0.15,   // EDM — uniform for driving pulse
  ambient:   0.10,   // drone — minimal pattern,
  plantasia: 0.10,
};

/**
 * Select the harmonic rhythm pattern for current context.
 *
 * @param section Current section
 * @param mood    Current mood
 * @param tick    Current tick (for deterministic variation)
 * @returns Pattern type
 */
export function selectHarmonicRhythm(
  section: Section,
  mood: Mood,
  tick: number
): HarmonicRhythmPattern {
  const tendency = PATTERN_TENDENCY[mood];
  if (tendency < 0.15) return 'even';

  const patterns = SECTION_PATTERNS[section];
  // Use tick to create slow rotation between patterns
  // Every ~8 ticks, consider switching (but primary pattern dominates)
  const phaseIndex = Math.floor(tick / 8) % patterns.length;
  return patterns[phaseIndex];
}

/**
 * Compute the chord timing multiplier for a given pattern and
 * position within the pattern cycle.
 *
 * @param pattern     Current harmonic rhythm pattern
 * @param chordIndex  How many chord changes since pattern started (0-based)
 * @param mood        Current mood (scales pattern intensity)
 * @returns Timing multiplier (<1 = faster change, >1 = slower)
 */
export function harmonicRhythmMultiplier(
  pattern: HarmonicRhythmPattern,
  chordIndex: number,
  mood: Mood
): number {
  const tendency = PATTERN_TENDENCY[mood];
  if (tendency < 0.1) return 1.0;

  // Scale the pattern effect by mood tendency
  const scale = tendency;
  let raw: number;

  switch (pattern) {
    case 'quick-quick-slow': {
      // 3-bar cycle: fast, fast, slow
      const pos = chordIndex % 3;
      if (pos < 2) raw = 1.0 - scale * 0.35;  // quick
      else raw = 1.0 + scale * 0.5;            // slow (sustained)
      break;
    }

    case 'long-short': {
      // 2-bar cycle: long, short
      const pos = chordIndex % 2;
      raw = pos === 0
        ? 1.0 + scale * 0.4   // long
        : 1.0 - scale * 0.3;  // short
      break;
    }

    case 'accelerando': {
      // 4-bar cycle: progressively faster
      const pos = chordIndex % 4;
      raw = 1.0 + scale * 0.3 * (1 - pos / 3);
      // pos 0: slowest, pos 3: fastest
      break;
    }

    case 'even':
    default:
      raw = 1.0;
  }

  // Clamp to safe range
  return Math.max(0.5, Math.min(1.6, raw));
}

/**
 * Whether harmonic rhythm patterning should be applied.
 */
export function shouldApplyHarmonicRhythm(mood: Mood): boolean {
  return PATTERN_TENDENCY[mood] >= 0.1;
}

/**
 * Get the pattern tendency for a mood (for testing).
 */
export function harmonicRhythmTendency(mood: Mood): number {
  return PATTERN_TENDENCY[mood];
}
