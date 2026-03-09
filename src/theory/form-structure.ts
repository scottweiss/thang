/**
 * Dynamic form structure — mood-aware section transition probabilities.
 *
 * Real music doesn't follow rigid ABCD forms. A DJ might extend a groove,
 * fake out a drop, or go straight from peak to peak. This module provides
 * per-mood Markov-style transition matrices that determine what section
 * comes next, creating more organic and surprising form.
 *
 * Musical principles:
 * - Trance/disco: predictable builds to reward listeners who expect "the drop"
 * - Ambient/xtal: meandering, no strict peak, long grooves
 * - Syro/blockhead: chaotic, skips around unpredictably
 * - The longer the piece plays, the more adventurous transitions become
 */

import type { Mood, Section } from '../types';

/**
 * Transition probabilities from one section to possible next sections.
 * Keys are target sections, values are relative weights (not normalized).
 */
type TransitionWeights = Partial<Record<Section, number>>;
type TransitionMatrix = Record<Section, TransitionWeights>;

const FORM_MATRICES: Record<Mood, TransitionMatrix> = {
  ambient: {
    // Ambient: meandering, avoids strong peaks, loves groove and breakdown
    build:     { peak: 5, groove: 3, breakdown: 2 },
    peak:      { breakdown: 6, groove: 4 },
    breakdown: { groove: 7, build: 3 },
    groove:    { build: 4, breakdown: 3, groove: 2, peak: 1 },  // can repeat groove
    intro:     { build: 10 },
  },
  downtempo: {
    build:     { peak: 6, groove: 3, breakdown: 1 },
    peak:      { breakdown: 5, groove: 4, peak: 1 },
    breakdown: { groove: 7, build: 3 },
    groove:    { build: 5, breakdown: 2, groove: 2, peak: 1 },
    intro:     { build: 10 },
  },
  lofi: {
    // Lofi: chill, likes to hang in grooves, occasional peaks
    build:     { peak: 5, groove: 4, breakdown: 1 },
    peak:      { breakdown: 4, groove: 5, peak: 1 },
    breakdown: { groove: 8, build: 2 },
    groove:    { build: 3, breakdown: 2, groove: 4, peak: 1 },
    intro:     { build: 10 },
  },
  trance: {
    // Trance: very structured, reliable drops, occasional double peaks
    build:     { peak: 9, breakdown: 1 },
    peak:      { breakdown: 6, groove: 3, peak: 1 },  // rare double peak
    breakdown: { groove: 4, build: 6 },  // breakdowns often lead back to build
    groove:    { build: 7, breakdown: 2, peak: 1 },
    intro:     { build: 10 },
  },
  avril: {
    // Avril: gentle, meditative, long sections, rare peaks
    build:     { peak: 4, groove: 4, breakdown: 2 },
    peak:      { breakdown: 7, groove: 3 },
    breakdown: { groove: 6, build: 3, breakdown: 1 },  // can extend breakdown
    groove:    { build: 3, breakdown: 3, groove: 3, peak: 1 },
    intro:     { build: 10 },
  },
  xtal: {
    // Xtal: dreamy, long transitions, avoids sharp peaks
    build:     { peak: 4, groove: 5, breakdown: 1 },
    peak:      { breakdown: 6, groove: 4 },
    breakdown: { groove: 7, build: 2, breakdown: 1 },
    groove:    { build: 3, breakdown: 3, groove: 3, peak: 1 },
    intro:     { build: 10 },
  },
  syro: {
    // Syro: chaotic, unpredictable, quick transitions
    build:     { peak: 6, groove: 2, breakdown: 2 },
    peak:      { breakdown: 3, groove: 3, peak: 2, build: 2 },  // can go anywhere
    breakdown: { groove: 4, build: 4, peak: 2 },  // breakdowns are unstable
    groove:    { build: 4, peak: 2, breakdown: 2, groove: 2 },
    intro:     { build: 8, groove: 2 },
  },
  blockhead: {
    // Blockhead: sample-based, likes groove and build, cinematic peaks
    build:     { peak: 7, groove: 2, breakdown: 1 },
    peak:      { breakdown: 5, groove: 4, peak: 1 },
    breakdown: { groove: 6, build: 4 },
    groove:    { build: 5, breakdown: 2, groove: 2, peak: 1 },
    intro:     { build: 10 },
  },
  flim: {
    // Flim: delicate, prefers groove/breakdown, careful peaks
    build:     { peak: 5, groove: 3, breakdown: 2 },
    peak:      { breakdown: 6, groove: 4 },
    breakdown: { groove: 7, build: 2, breakdown: 1 },
    groove:    { build: 3, breakdown: 3, groove: 3, peak: 1 },
    intro:     { build: 10 },
  },
  disco: {
    // Disco: energetic, loves peaks and grooves, brief breakdowns
    build:     { peak: 8, groove: 1, breakdown: 1 },
    peak:      { breakdown: 3, groove: 5, peak: 2 },  // loves extending peaks
    breakdown: { groove: 5, build: 5 },
    groove:    { build: 5, peak: 2, breakdown: 1, groove: 2 },
    intro:     { build: 10 },
  },
};

/**
 * Select the next section based on mood-specific transition probabilities.
 *
 * @param mood           Current mood
 * @param currentSection Section we're transitioning FROM
 * @param cycleCount     How many complete cycles we've been through (0 = first)
 * @returns The next section to transition to
 */
export function selectNextSection(
  mood: Mood,
  currentSection: Section,
  cycleCount: number = 0,
  formPreference?: Partial<Record<Section, number>>
): Section {
  const matrix = FORM_MATRICES[mood] ?? FORM_MATRICES.downtempo;
  const weights = matrix[currentSection] ?? { build: 10 };

  // Build entries array with weights
  const entries: [Section, number][] = [];
  for (const [section, weight] of Object.entries(weights) as [Section, number][]) {
    let adjustedWeight = weight;
    // After first cycle, slightly boost adventurous transitions (self-repeats, skips)
    if (cycleCount > 0 && section === currentSection) {
      adjustedWeight *= 1.3;  // more likely to repeat sections in later cycles
    }
    // Form trajectory bias: macro arc shapes section choices
    // (establishing favors intros, climax favors peaks, etc.)
    if (formPreference?.[section] != null) {
      adjustedWeight *= formPreference[section]!;
    }
    entries.push([section, adjustedWeight]);
  }

  // Weighted random selection
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * totalWeight;

  for (const [section, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return section;
  }

  // Fallback
  return entries[0][0];
}

/**
 * Get the raw transition weights for inspection/testing.
 */
export function getTransitionWeights(
  mood: Mood,
  fromSection: Section
): TransitionWeights {
  const matrix = FORM_MATRICES[mood] ?? FORM_MATRICES.downtempo;
  return { ...(matrix[fromSection] ?? { build: 10 }) };
}
