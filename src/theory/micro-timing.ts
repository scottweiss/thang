/**
 * Micro-timing humanization — subtle timing offsets for a human feel.
 *
 * Different moods have different timing characters:
 * - Lofi/blockhead: lazy, behind the beat (positive nudge)
 * - Trance/disco: pushing, ahead of the beat (negative nudge)
 * - Ambient/flim: loose, gentle random drift
 * - Syro: tight, almost mechanical but with tiny glitches
 *
 * Section modulates the amount: breakdowns are looser, peaks tighter.
 * Applied via Strudel's .nudge() parameter (seconds offset per event).
 */

import type { Mood, Section } from '../types';

interface TimingCharacter {
  bias: number;      // -1 to 1: negative = push (ahead), positive = lazy (behind)
  amount: number;    // 0-1: overall humanization strength
  variation: number; // 0-1: random variation per step (0 = uniform, 1 = very random)
  swing: number;     // 0-1: systematic off-beat delay (0 = straight, 0.5 = triplet swing)
}

const MOOD_TIMING: Record<Mood, TimingCharacter> = {
  ambient:   { bias: 0,     amount: 0.15, variation: 0.8, swing: 0 },
  plantasia: { bias: 0,     amount: 0.15, variation: 0.8, swing: 0 },
  downtempo: { bias: 0.3,   amount: 0.25, variation: 0.5, swing: 0.15 },
  lofi:      { bias: 0.5,   amount: 0.35, variation: 0.4, swing: 0.35 },
  trance:    { bias: -0.2,  amount: 0.10, variation: 0.3, swing: 0 },
  avril:     { bias: 0.1,   amount: 0.20, variation: 0.6, swing: 0.05 },
  xtal:      { bias: 0,     amount: 0.20, variation: 0.7, swing: 0.08 },
  syro:      { bias: 0,     amount: 0.08, variation: 0.9, swing: 0.12 },
  blockhead: { bias: 0.4,   amount: 0.30, variation: 0.5, swing: 0.30 },
  flim:      { bias: 0,     amount: 0.18, variation: 0.7, swing: 0.05 },
  disco:     { bias: -0.15, amount: 0.12, variation: 0.3, swing: 0.20 },
};

const SECTION_TIGHTNESS: Record<Section, number> = {
  intro: 0.7,
  build: 0.85,
  peak: 0.5,      // tightest — locked groove at climax
  breakdown: 1.0, // loosest — breathing room
  groove: 0.75,
};

/**
 * Generate a nudge pattern string for Strudel's .nudge() parameter.
 * Returns a space-separated string of small timing offsets in seconds.
 *
 * Values are typically ±5-25ms — imperceptible individually but
 * collectively create a human, "played" feel rather than mechanical.
 *
 * @param mood     Current mood (determines timing character)
 * @param section  Current section (peaks are tighter, breakdowns looser)
 * @param steps    Number of steps to generate
 * @param seed     Random seed for deterministic variation
 * @returns Nudge pattern string e.g. "0.0082 -0.0041 0.0120 0.0003"
 */
export function generateNudgePattern(
  mood: Mood,
  section: Section,
  steps: number,
  seed: number = 0
): string {
  if (steps <= 0) return '0';

  const character = MOOD_TIMING[mood] ?? MOOD_TIMING.downtempo;
  const tightness = SECTION_TIGHTNESS[section] ?? 0.75;
  const scaledAmount = character.amount * tightness;

  // Max offset in seconds (5-25ms range)
  const maxOffset = scaledAmount * 0.025;

  // Deterministic PRNG (LCG)
  let s = (seed + 17) | 0;
  function nextRandom(): number {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  }

  // Swing offset: systematic delay on off-beats (odd indices)
  // Applied as additional positive offset on top of humanization
  const swingOffset = character.swing * 0.025; // max ~12ms of swing

  const nudges: string[] = [];
  for (let i = 0; i < steps; i++) {
    const random = (nextRandom() * 2 - 1) * character.variation;
    let offset = (character.bias + random) * maxOffset;
    // Apply swing to off-beat positions (odd indices)
    if (i % 2 === 1 && swingOffset > 0) {
      offset += swingOffset;
    }
    nudges.push(offset.toFixed(4));
  }

  return nudges.join(' ');
}

/**
 * Whether micro-timing should be applied for this mood.
 * All moods benefit, but some have such minimal amounts
 * that the string overhead isn't worth it.
 */
export function shouldApplyMicroTiming(mood: Mood): boolean {
  const character = MOOD_TIMING[mood];
  return character !== undefined && character.amount >= 0.08;
}

/**
 * Get the timing character for a mood (for external inspection/testing).
 */
export function getTimingCharacter(mood: Mood): TimingCharacter {
  return { ...(MOOD_TIMING[mood] ?? MOOD_TIMING.downtempo) };
}
