/**
 * Melodic cadence gestures — recognizable phrase endings.
 *
 * Well-composed melodies don't just stop — they END with a gesture
 * that creates closure. Common cadential patterns:
 *
 * - **Step-down**: 2→1 (re→do) — the most natural resolution
 * - **Leading tone**: 7→1 (ti→do) — strong, classical
 * - **Enclosure**: approach from above AND below (3→2→1 or 7→1)
 * - **Suspension**: hold a non-chord tone, resolve by step
 * - **Leap to tonic**: jump down to do — decisive, strong ending
 *
 * The gesture is applied to the last 2-3 notes before a rest,
 * pulling them toward the chord root or tonic for resolution.
 */

import type { Mood } from '../types';

export type CadenceType = 'step-down' | 'leading-tone' | 'enclosure' | 'leap-to-tonic' | 'none';

/**
 * Apply a cadential gesture to a phrase's ending notes.
 * Modifies the last 2-3 notes before a rest to create resolution.
 *
 * @param elements   Step array (notes and '~' rests)
 * @param ladder     Available pitch ladder (sorted low to high)
 * @param chordIndices Indices of chord tones in the ladder
 * @param mood       Current mood
 * @param restToken  Rest marker
 * @returns Modified elements with cadential endings
 */
export function applyCadenceGesture(
  elements: string[],
  ladder: string[],
  chordIndices: number[],
  mood: Mood,
  restToken: string = '~'
): string[] {
  if (ladder.length < 3 || chordIndices.length === 0) return elements;

  const cadence = pickCadenceType(mood);
  if (cadence === 'none') return elements;

  const result = [...elements];

  // Find phrase endings: positions where a non-rest is followed by a rest (or end)
  for (let i = 0; i < result.length; i++) {
    if (result[i] === restToken) continue;
    const isLast = i === result.length - 1 || result[i + 1] === restToken;
    if (!isLast) continue;

    // This is a phrase-ending note. Find the previous notes in this phrase.
    const phraseEnd = i;
    const phraseNotes: number[] = []; // indices into result
    for (let j = phraseEnd; j >= 0 && result[j] !== restToken; j--) {
      phraseNotes.unshift(j);
    }

    if (phraseNotes.length < 2) continue;

    // Find nearest chord tone (resolution target)
    const currentIdx = ladder.indexOf(result[phraseEnd]);
    if (currentIdx < 0) continue;

    const targetIdx = nearestChordTone(currentIdx, chordIndices);
    if (targetIdx < 0 || targetIdx >= ladder.length) continue;

    // Apply the gesture to the last 2-3 notes
    switch (cadence) {
      case 'step-down': {
        // Approach from one step above the target
        if (phraseNotes.length >= 2 && targetIdx + 1 < ladder.length) {
          result[phraseNotes[phraseNotes.length - 1]] = ladder[targetIdx];
          result[phraseNotes[phraseNotes.length - 2]] = ladder[targetIdx + 1];
        }
        break;
      }
      case 'leading-tone': {
        // Approach from one step below the target
        if (phraseNotes.length >= 2 && targetIdx - 1 >= 0) {
          result[phraseNotes[phraseNotes.length - 1]] = ladder[targetIdx];
          result[phraseNotes[phraseNotes.length - 2]] = ladder[targetIdx - 1];
        }
        break;
      }
      case 'enclosure': {
        // Above → below → target (or below → above → target)
        if (phraseNotes.length >= 3 && targetIdx + 1 < ladder.length && targetIdx - 1 >= 0) {
          result[phraseNotes[phraseNotes.length - 1]] = ladder[targetIdx];
          result[phraseNotes[phraseNotes.length - 2]] = ladder[targetIdx - 1];
          result[phraseNotes[phraseNotes.length - 3]] = ladder[targetIdx + 1];
        }
        break;
      }
      case 'leap-to-tonic': {
        // Just set the final note to the target (the leap is implicit from distance)
        result[phraseNotes[phraseNotes.length - 1]] = ladder[targetIdx];
        break;
      }
    }
  }

  return result;
}

/**
 * Pick a cadence type based on mood character.
 */
function pickCadenceType(mood: Mood): CadenceType {
  const roll = Math.random();
  const probs = MOOD_CADENCE_PROBS[mood];

  let cumulative = 0;
  for (const [type, prob] of probs) {
    cumulative += prob;
    if (roll < cumulative) return type;
  }
  return 'none';
}

/**
 * Find the nearest chord tone index to a given position.
 */
function nearestChordTone(currentIdx: number, chordIndices: number[]): number {
  let best = chordIndices[0];
  let bestDist = Math.abs(currentIdx - best);
  for (const ci of chordIndices) {
    const d = Math.abs(currentIdx - ci);
    if (d < bestDist) {
      best = ci;
      bestDist = d;
    }
  }
  return best;
}

/**
 * Per-mood cadence type probabilities.
 * [type, probability] pairs. Sum should be <= 1.0, remainder = 'none'.
 */
const MOOD_CADENCE_PROBS: Record<Mood, [CadenceType, number][]> = {
  lofi:      [['step-down', 0.3], ['leading-tone', 0.15], ['enclosure', 0.1]],
  blockhead: [['step-down', 0.2], ['leap-to-tonic', 0.15], ['enclosure', 0.1]],
  downtempo: [['step-down', 0.25], ['leading-tone', 0.1]],
  ambient:   [['step-down', 0.1]],
  plantasia: [['step-down', 0.1]],
  trance:    [['leap-to-tonic', 0.2], ['step-down', 0.1]],
  avril:     [['step-down', 0.35], ['leading-tone', 0.2], ['enclosure', 0.15]],
  xtal:      [['step-down', 0.15], ['leading-tone', 0.1]],
  syro:      [['enclosure', 0.15], ['leading-tone', 0.1]],
  flim:      [['step-down', 0.25], ['leading-tone', 0.15], ['enclosure', 0.1]],
  disco:     [['step-down', 0.2], ['leap-to-tonic', 0.15]],
};
