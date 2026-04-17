/**
 * Cadential sequence planning — multi-chord cadential patterns
 * that create deliberate, satisfying section transitions.
 *
 * Instead of chord-by-chord steering toward tonic, this plans
 * complete cadential sequences (ii-V-I, IV-V-I, vi-ii-V-I)
 * that lock in 2-4 chord changes before the section boundary.
 *
 * Different moods prefer different cadential patterns:
 * - Jazz moods (lofi): ii-V-I, iii-vi-ii-V-I (extended turnaround)
 * - Pop moods (avril): IV-V-I, vi-IV-V-I
 * - EDM moods (trance): V-I (short, impactful)
 * - Modal moods (ambient): IV-I plagal, or no cadence
 *
 * The sequence is triggered when section progress crosses a threshold,
 * and each chord in the sequence is forced in order.
 */

import type { Mood, Section } from '../types';

export interface CadentialPlan {
  /** Sequence of scale degrees to force (last should be 0 = tonic) */
  degrees: number[];
  /** Index into the sequence (how many chords we've played so far) */
  position: number;
}

/** Cadential patterns per mood, ordered by preference */
const MOOD_CADENCES: Record<Mood, number[][]> = {
  lofi:      [[1, 4, 0], [2, 5, 1, 4, 0]],        // ii-V-I, iii-vi-ii-V-I
  downtempo: [[1, 4, 0], [3, 4, 0]],               // ii-V-I, IV-V-I
  avril:     [[3, 4, 0], [5, 3, 4, 0]],            // IV-V-I, vi-IV-V-I
  flim:      [[3, 4, 0], [1, 4, 0]],               // IV-V-I, ii-V-I
  xtal:      [[3, 0], [3, 4, 0]],                   // IV-I (plagal), IV-V-I
  blockhead: [[1, 4, 0], [3, 4, 0]],               // ii-V-I, IV-V-I
  disco:     [[1, 4, 0], [4, 0]],                   // ii-V-I, V-I
  syro:      [[4, 0], [6, 4, 0]],                   // V-I, vii-V-I
  trance:    [[4, 0]],                               // V-I (short, impactful)
  ambient:   [[3, 0]],                               // IV-I (plagal only),
  plantasia: [[3, 0]],
};

/** Section progress threshold for triggering cadential planning */
const CADENCE_THRESHOLD: Record<Section, number> = {
  intro:     0.80,   // cadence late in intro
  build:     0.75,   // cadence before the drop
  peak:      0.85,   // cadence near end of peak
  breakdown: 0.80,   // cadence before groove return
  groove:    0.85,   // cadence late in groove
};

/**
 * Check if we should start a cadential sequence.
 *
 * @param sectionProgress  Current section progress (0-1)
 * @param section          Current section
 * @param currentPlan      Existing plan (null if none active)
 * @returns true if a new cadential plan should be created
 */
export function shouldStartCadentialSequence(
  sectionProgress: number,
  section: Section,
  currentPlan: CadentialPlan | null
): boolean {
  // Don't start a new plan if one is already active
  if (currentPlan !== null && currentPlan.position < currentPlan.degrees.length) {
    return false;
  }

  const threshold = CADENCE_THRESHOLD[section];
  return sectionProgress >= threshold;
}

/**
 * Create a cadential plan for the current mood and context.
 *
 * @param mood           Current mood
 * @param currentDegree  Current chord degree
 * @returns Cadential plan with degree sequence
 */
export function createCadentialPlan(
  mood: Mood,
  currentDegree: number
): CadentialPlan {
  const patterns = MOOD_CADENCES[mood];

  // If already on V (4), use the shortest cadence (just resolve to I)
  if (currentDegree === 4) {
    return { degrees: [0], position: 0 };
  }

  // If already on I (0), return empty plan (already resolved)
  if (currentDegree === 0) {
    return { degrees: [], position: 0 };
  }

  // Pick a pattern — prefer one whose first degree is close to current
  let bestPattern = patterns[0];
  let bestDist = Infinity;

  for (const pattern of patterns) {
    const firstDegree = pattern[0];
    const dist = Math.min(
      Math.abs(firstDegree - currentDegree),
      7 - Math.abs(firstDegree - currentDegree)
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestPattern = pattern;
    }
  }

  return { degrees: [...bestPattern], position: 0 };
}

/**
 * Get the next degree in the cadential plan.
 * Returns null if the plan is complete.
 *
 * @param plan  Current cadential plan
 * @returns Next target degree, or null if plan is done
 */
export function nextCadentialDegree(plan: CadentialPlan): number | null {
  if (plan.position >= plan.degrees.length) return null;
  return plan.degrees[plan.position];
}

/**
 * Advance the cadential plan by one step.
 */
export function advanceCadentialPlan(plan: CadentialPlan): void {
  plan.position++;
}

/**
 * Whether a cadential plan is still active (has more degrees to play).
 */
export function isCadentialPlanActive(plan: CadentialPlan | null): boolean {
  if (!plan) return false;
  return plan.position < plan.degrees.length;
}

/**
 * Return the appropriate chord quality for a cadential target degree.
 * V → dom7, vii → dim, ii → min/min7 (jazz moods), IV → maj, I → maj.
 */
export function cadentialQuality(
  degree: number,
  mood: Mood
): import('../types').ChordQuality {
  const jazzMoods: Set<Mood> = new Set(['lofi', 'downtempo', 'flim']);
  switch (degree) {
    case 4: return 'dom7'; // V
    case 6: return 'dim';  // vii°
    case 1: return jazzMoods.has(mood) ? 'min7' : 'min'; // ii
    case 5: return 'min';  // vi
    case 3: return 'maj';  // IV
    case 0: return 'maj';  // I
    default: return 'maj';
  }
}
