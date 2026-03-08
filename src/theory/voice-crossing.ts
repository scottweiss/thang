/**
 * Voice-crossing tension — tracks how tangled voicings are.
 *
 * When voices cross (e.g., alto sings higher than soprano),
 * it creates a specific kind of muddiness. Some crossing is
 * expressive (Romantic period), but too much blurs the texture.
 *
 * Also models range compression/expansion — voices crowded
 * in the same octave feel claustrophobic, while wide spread
 * feels spacious. Mood determines the ideal balance.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood tolerance for voice crossing (0-1).
 * Higher = more crossings tolerated.
 */
const CROSSING_TOLERANCE: Record<Mood, number> = {
  trance:    0.10,  // clean, separate voices
  avril:     0.15,  // mostly clear
  disco:     0.12,  // clean grooves
  downtempo: 0.25,  // moderate complexity
  blockhead: 0.35,  // embraces tangles
  lofi:      0.30,  // jazz voicings cross
  flim:      0.40,  // organic, messy OK
  xtal:      0.50,  // floating, crossings add color
  syro:      0.55,  // intentional chaos
  ambient:   0.20,  // wide open, avoid crossing
};

/**
 * Target range spread per mood (in semitones).
 * Wider = more spacious voicings.
 */
const TARGET_SPREAD: Record<Mood, number> = {
  trance:    18,  // moderate spread
  avril:     16,  // piano-like
  disco:     15,  // compact grooves
  downtempo: 20,  // moderate-wide
  blockhead: 14,  // tight, funky
  lofi:      22,  // jazz — wide voicings
  flim:      24,  // organic spread
  xtal:      28,  // very wide, spacious
  syro:      20,  // varied
  ambient:   30,  // maximum spaciousness
};

/**
 * Section multiplier for target spread.
 */
const SECTION_SPREAD_MULT: Record<Section, number> = {
  intro:     0.8,   // close together, intimate
  build:     1.0,   // expanding
  peak:      1.2,   // wide, powerful
  breakdown: 0.7,   // compressed, vulnerable
  groove:    1.0,   // normal
};

/**
 * Count the number of voice crossings in a set of pitches.
 * Assumes pitches are ordered by voice (soprano, alto, tenor, bass).
 *
 * @param pitches MIDI note values ordered by voice (high to low)
 * @returns Number of crossings
 */
export function countCrossings(pitches: number[]): number {
  if (pitches.length < 2) return 0;

  let crossings = 0;
  for (let i = 0; i < pitches.length - 1; i++) {
    if (pitches[i] < pitches[i + 1]) {
      crossings++;
    }
  }
  return crossings;
}

/**
 * Calculate the range spread of a voicing (in semitones).
 *
 * @param pitches MIDI note values
 * @returns Spread in semitones
 */
export function voicingSpread(pitches: number[]): number {
  if (pitches.length < 2) return 0;
  return Math.max(...pitches) - Math.min(...pitches);
}

/**
 * Calculate crossing tension (0-1).
 * 0 = no tension (within tolerance), 1 = maximum tension.
 *
 * @param pitches MIDI note values ordered by voice
 * @param mood Current mood
 * @returns Crossing tension 0-1
 */
export function crossingTension(pitches: number[], mood: Mood): number {
  if (pitches.length < 2) return 0;

  const crossings = countCrossings(pitches);
  const maxPossible = pitches.length - 1;
  const crossingRatio = crossings / maxPossible;

  const tolerance = CROSSING_TOLERANCE[mood];

  // Tension rises above tolerance threshold
  if (crossingRatio <= tolerance) return 0;
  return Math.min(1, (crossingRatio - tolerance) / (1 - tolerance));
}

/**
 * Calculate spread tension — how far the voicing spread deviates
 * from the mood's target.
 *
 * @param pitches MIDI note values
 * @param mood Current mood
 * @param section Current section
 * @returns Spread tension 0-1 (0 = ideal, 1 = very far from target)
 */
export function spreadTension(
  pitches: number[],
  mood: Mood,
  section: Section
): number {
  if (pitches.length < 2) return 0;

  const spread = voicingSpread(pitches);
  const target = TARGET_SPREAD[mood] * SECTION_SPREAD_MULT[section];

  const deviation = Math.abs(spread - target);
  // Normalize: 12 semitones deviation = tension 1.0
  return Math.min(1, deviation / 12);
}

/**
 * Should the voicing be respaced to reduce crossing tension?
 *
 * @param pitches MIDI note values ordered by voice
 * @param mood Current mood
 * @returns Whether to respace
 */
export function shouldRespace(pitches: number[], mood: Mood): boolean {
  return crossingTension(pitches, mood) > 0.3;
}

/**
 * Sort pitches to eliminate crossings (simple respacing).
 * Returns pitches sorted high to low.
 *
 * @param pitches MIDI note values
 * @returns Sorted pitches (descending)
 */
export function eliminateCrossings(pitches: number[]): number[] {
  return [...pitches].sort((a, b) => b - a);
}

/**
 * Calculate a combined voicing quality score.
 * Higher = better voicing (less crossing tension + good spread).
 *
 * @param pitches MIDI note values ordered by voice
 * @param mood Current mood
 * @param section Current section
 * @returns Quality score 0-1
 */
export function voicingQuality(
  pitches: number[],
  mood: Mood,
  section: Section
): number {
  const ct = crossingTension(pitches, mood);
  const st = spreadTension(pitches, mood, section);
  // Weight crossing tension more heavily (it's more noticeable)
  return Math.max(0, 1 - ct * 0.6 - st * 0.4);
}

/**
 * Get crossing tolerance for a mood (for testing).
 */
export function crossingTolerance(mood: Mood): number {
  return CROSSING_TOLERANCE[mood];
}
