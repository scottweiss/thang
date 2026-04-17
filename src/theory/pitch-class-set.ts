/**
 * Pitch-class set theory — mathematical analysis and generation of pitch collections.
 *
 * Allen Forte's set theory provides tools for understanding pitch relationships
 * beyond traditional scales and chords. Core concepts:
 *
 * - **Normal form**: the most compact arrangement of a pitch-class set
 * - **Prime form**: the canonical (transposition/inversion-equivalent) form
 * - **Interval vector**: counts of each interval class (ic1 through ic6)
 *   - ic1 (m2/M7): dissonance, tension, chromaticism
 *   - ic2 (M2/m7): whole-tone color
 *   - ic3 (m3/M6): minor color, warmth
 *   - ic4 (M3/m6): major color, brightness
 *   - ic5 (P4/P5): open, quintal, medieval
 *   - ic6 (tritone): maximum tension, ambiguity
 *
 * Application: select pitch sets whose interval vectors match the
 * desired emotional character — high ic5 for ambient (open fifths),
 * high ic3/ic4 for warmth, high ic1/ic6 for tension.
 */

import type { Mood, Section } from '../types';

/**
 * Compute the interval vector for a set of pitch classes.
 * Returns [ic1, ic2, ic3, ic4, ic5, ic6] — counts of each interval class.
 *
 * @param pitchClasses  Array of pitch classes (0-11)
 * @returns 6-element array of interval class counts
 */
export function intervalVector(pitchClasses: number[]): [number, number, number, number, number, number] {
  const vec: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
  const pcs = [...new Set(pitchClasses.map(p => ((p % 12) + 12) % 12))];

  for (let i = 0; i < pcs.length; i++) {
    for (let j = i + 1; j < pcs.length; j++) {
      const diff = Math.abs(pcs[i] - pcs[j]);
      const ic = diff > 6 ? 12 - diff : diff;
      if (ic >= 1 && ic <= 6) {
        vec[ic - 1]++;
      }
    }
  }

  return vec;
}

/**
 * Compute the normal form of a pitch-class set.
 * The normal form is the most compact rotation of the sorted set.
 *
 * @param pitchClasses  Array of pitch classes (0-11)
 * @returns Sorted, most compact arrangement
 */
export function normalForm(pitchClasses: number[]): number[] {
  const pcs = [...new Set(pitchClasses.map(p => ((p % 12) + 12) % 12))].sort((a, b) => a - b);
  if (pcs.length <= 1) return pcs;

  let bestRotation = pcs;
  let bestSpan = Infinity;

  for (let i = 0; i < pcs.length; i++) {
    const rotation = [...pcs.slice(i), ...pcs.slice(0, i)];
    // Normalize so first element is 0
    const span = ((rotation[rotation.length - 1] - rotation[0]) % 12 + 12) % 12;
    if (span < bestSpan) {
      bestSpan = span;
      bestRotation = rotation;
    } else if (span === bestSpan) {
      // Tie-break: prefer smaller intervals from the left
      for (let k = rotation.length - 2; k >= 0; k--) {
        const curGap = ((rotation[k] - rotation[0]) % 12 + 12) % 12;
        const bestGap = ((bestRotation[k] - bestRotation[0]) % 12 + 12) % 12;
        if (curGap < bestGap) { bestRotation = rotation; break; }
        if (curGap > bestGap) break;
      }
    }
  }

  return bestRotation;
}

/**
 * Compute the prime form of a pitch-class set.
 * Transposes to start at 0 and compares with inversion to find canonical form.
 *
 * @param pitchClasses  Array of pitch classes (0-11)
 * @returns Prime form (starting at 0, most compact)
 */
export function primeForm(pitchClasses: number[]): number[] {
  if (pitchClasses.length === 0) return [];

  const normal = normalForm(pitchClasses);
  const t0 = normal.map(p => ((p - normal[0]) % 12 + 12) % 12);

  // Also try inversion
  const inverted = pitchClasses.map(p => ((12 - p) % 12));
  const invNormal = normalForm(inverted);
  const invT0 = invNormal.map(p => ((p - invNormal[0]) % 12 + 12) % 12);

  // Compare: prefer the one with smaller intervals from the left
  for (let i = 0; i < Math.min(t0.length, invT0.length); i++) {
    if (t0[i] < invT0[i]) return t0;
    if (t0[i] > invT0[i]) return invT0;
  }

  return t0;
}

/**
 * Score how well a pitch-class set's interval vector matches a mood's
 * desired color profile. Higher score = better match.
 *
 * @param pcs   Pitch class set
 * @param mood  Target mood
 * @returns Match score (0-1)
 */
export function moodSetMatch(pcs: number[], mood: Mood): number {
  if (pcs.length < 2) return 0.5;

  const vec = intervalVector(pcs);
  const total = vec.reduce((a, b) => a + b, 0);
  if (total === 0) return 0.5;

  // Normalize to proportions
  const norm = vec.map(v => v / total);

  // Mood profiles: what interval class proportions are desirable
  // [ic1, ic2, ic3, ic4, ic5, ic6]
  const profiles: Record<Mood, number[]> = {
    ambient:   [0.05, 0.10, 0.15, 0.15, 0.45, 0.10], // open fifths,
    plantasia: [0.05, 0.10, 0.15, 0.15, 0.45, 0.10],
    xtal:      [0.05, 0.15, 0.20, 0.20, 0.30, 0.10], // crystalline
    downtempo: [0.08, 0.12, 0.25, 0.25, 0.20, 0.10], // warm thirds
    lofi:      [0.10, 0.15, 0.25, 0.20, 0.15, 0.15], // jazz color
    avril:     [0.08, 0.10, 0.25, 0.30, 0.20, 0.07], // bright thirds
    flim:      [0.12, 0.15, 0.20, 0.20, 0.20, 0.13], // balanced
    blockhead: [0.10, 0.15, 0.25, 0.20, 0.15, 0.15], // hip-hop warmth
    syro:      [0.18, 0.15, 0.15, 0.15, 0.15, 0.22], // tense, complex
    disco:     [0.05, 0.10, 0.20, 0.35, 0.25, 0.05], // major, bright
    trance:    [0.03, 0.08, 0.15, 0.30, 0.40, 0.04], // open, bright
  };

  const target = profiles[mood];
  // Cosine similarity between actual and target
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < 6; i++) {
    dot += norm[i] * target[i];
    magA += norm[i] * norm[i];
    magB += target[i] * target[i];
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom > 0 ? dot / denom : 0.5;
}

/**
 * Suggest additional pitch classes that would improve the set's
 * match with the target mood's interval profile.
 *
 * @param existing  Current pitch classes
 * @param mood      Target mood
 * @param maxAdd    Maximum pitches to suggest
 * @returns Pitch classes to consider adding
 */
export function suggestPitchClassAdditions(
  existing: number[],
  mood: Mood,
  maxAdd: number = 1
): number[] {
  const currentScore = moodSetMatch(existing, mood);
  const candidates: { pc: number; score: number }[] = [];
  const existingSet = new Set(existing.map(p => ((p % 12) + 12) % 12));

  for (let pc = 0; pc < 12; pc++) {
    if (existingSet.has(pc)) continue;
    const extended = [...existing, pc];
    const score = moodSetMatch(extended, mood);
    if (score > currentScore) {
      candidates.push({ pc, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, maxAdd).map(c => c.pc);
}

/**
 * Get the interval class that most characterizes a set.
 * Returns the interval class (1-6) with the highest count.
 */
export function dominantIntervalClass(pcs: number[]): number {
  const vec = intervalVector(pcs);
  let maxIdx = 0;
  for (let i = 1; i < 6; i++) {
    if (vec[i] > vec[maxIdx]) maxIdx = i;
  }
  return maxIdx + 1; // ic is 1-based
}
