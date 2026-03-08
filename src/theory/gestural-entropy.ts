/**
 * Gestural entropy — anticipation modeling and surprise deficit.
 *
 * Tracks how predictable the musical gestures have been over time.
 * When entropy drops too low (too predictable), forces unexpected
 * gestures. When entropy is too high (chaotic), encourages
 * repetition for coherence.
 *
 * A "gesture" is an abstract musical action: step-wise motion,
 * leap, rest, repetition, direction change. The entropy of
 * recent gestures determines if the listener needs novelty or
 * stability.
 */

import type { Mood, Section } from '../types';

/** Gesture types that can occur in a melodic line. */
export type GestureType =
  | 'step-up'      // ascending step (1-2 semitones)
  | 'step-down'    // descending step
  | 'leap-up'      // ascending leap (3+ semitones)
  | 'leap-down'    // descending leap
  | 'repeat'       // same note
  | 'rest'         // silence
  | 'direction-change'; // reversal of motion

/**
 * Per-mood target entropy (0-1).
 * Lower = more predictable, higher = more chaotic.
 */
const TARGET_ENTROPY: Record<Mood, number> = {
  trance:    0.30,  // repetitive by nature
  avril:     0.40,  // balanced
  disco:     0.35,  // groove-oriented
  downtempo: 0.45,  // moderate variety
  blockhead: 0.55,  // likes surprises
  lofi:      0.50,  // jazz variation
  flim:      0.55,  // organic unpredictability
  xtal:      0.65,  // floating, needs drift
  syro:      0.75,  // maximum variety
  ambient:   0.40,  // slow evolution
};

/**
 * Section multipliers for entropy target.
 */
const SECTION_ENTROPY_MULT: Record<Section, number> = {
  intro:     0.7,   // establish patterns first
  build:     0.9,   // growing complexity
  peak:      1.1,   // maximum intensity/variety
  breakdown: 0.8,   // simplified but not static
  groove:    1.0,   // cruising
};

/**
 * Classify an interval as a gesture type.
 *
 * @param interval Signed semitone interval (positive = up)
 * @returns GestureType
 */
export function classifyGesture(interval: number): GestureType {
  if (interval === 0) return 'repeat';
  const abs = Math.abs(interval);
  if (abs <= 2) return interval > 0 ? 'step-up' : 'step-down';
  return interval > 0 ? 'leap-up' : 'leap-down';
}

/**
 * Calculate Shannon entropy of a gesture history.
 * Returns value 0-1 normalized by max possible entropy.
 *
 * @param history Recent gesture types (last 8-16 gestures)
 * @returns Normalized entropy (0 = completely predictable, 1 = maximum variety)
 */
export function gestureEntropy(history: GestureType[]): number {
  if (history.length < 2) return 0.5; // neutral with no data

  // Count gesture frequencies
  const counts = new Map<GestureType, number>();
  for (const g of history) {
    counts.set(g, (counts.get(g) ?? 0) + 1);
  }

  // Shannon entropy
  const n = history.length;
  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / n;
    if (p > 0) entropy -= p * Math.log2(p);
  }

  // Normalize by max entropy (log2 of number of gesture types)
  const maxEntropy = Math.log2(7); // 7 gesture types
  return Math.min(1, entropy / maxEntropy);
}

/**
 * Calculate how far current entropy deviates from the mood's target.
 * Positive = too chaotic, negative = too predictable.
 *
 * @param history Recent gesture history
 * @param mood Current mood
 * @param section Current section
 * @returns Entropy deficit (-1 to 1, negative = needs more variety)
 */
export function entropyDeficit(
  history: GestureType[],
  mood: Mood,
  section: Section
): number {
  const current = gestureEntropy(history);
  const target = TARGET_ENTROPY[mood] * SECTION_ENTROPY_MULT[section];
  return current - target;
}

/**
 * Should we force an unexpected gesture to combat predictability?
 *
 * @param history Recent gesture history
 * @param mood Current mood
 * @param section Current section
 * @returns Whether to inject surprise
 */
export function shouldInjectSurprise(
  history: GestureType[],
  mood: Mood,
  section: Section
): boolean {
  const deficit = entropyDeficit(history, mood, section);
  return deficit < -0.15; // significantly too predictable
}

/**
 * Should we force repetition/stability to combat chaos?
 *
 * @param history Recent gesture history
 * @param mood Current mood
 * @param section Current section
 * @returns Whether to inject stability
 */
export function shouldInjectStability(
  history: GestureType[],
  mood: Mood,
  section: Section
): boolean {
  const deficit = entropyDeficit(history, mood, section);
  return deficit > 0.20; // significantly too chaotic
}

/**
 * Suggest a gesture type that would move entropy toward target.
 *
 * @param history Recent gesture history
 * @param mood Current mood
 * @param section Current section
 * @param tick Current tick for deterministic selection
 * @returns Suggested gesture type
 */
export function suggestGesture(
  history: GestureType[],
  mood: Mood,
  section: Section,
  tick: number
): GestureType {
  const deficit = entropyDeficit(history, mood, section);

  if (deficit < -0.15) {
    // Too predictable — find least-used gesture type
    const counts = new Map<GestureType, number>();
    const types: GestureType[] = [
      'step-up', 'step-down', 'leap-up', 'leap-down',
      'repeat', 'rest', 'direction-change',
    ];
    for (const g of history) counts.set(g, (counts.get(g) ?? 0) + 1);

    // Sort by frequency (ascending) and pick deterministically
    const sorted = [...types].sort(
      (a, b) => (counts.get(a) ?? 0) - (counts.get(b) ?? 0)
    );
    const idx = ((tick * 2654435761) >>> 0) % Math.min(3, sorted.length);
    return sorted[idx];
  }

  if (deficit > 0.20) {
    // Too chaotic — find most-used gesture and repeat it
    const counts = new Map<GestureType, number>();
    for (const g of history) counts.set(g, (counts.get(g) ?? 0) + 1);

    let best: GestureType = 'step-up';
    let bestCount = 0;
    for (const [g, c] of counts) {
      if (c > bestCount) { bestCount = c; best = g; }
    }
    return best;
  }

  // Entropy is on target — pick randomly from recent gestures
  const idx = ((tick * 2654435761) >>> 0) % history.length;
  return history[idx] ?? 'step-up';
}

/**
 * Get target entropy for a mood (for testing).
 */
export function targetEntropy(mood: Mood): number {
  return TARGET_ENTROPY[mood];
}
