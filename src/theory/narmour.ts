/**
 * Narmour Implication-Realization model for melodic contour.
 *
 * Based on Eugene Narmour's cognitive theory of melody perception:
 * - Small intervals (1-2 steps) imply PROCESS: continuation in same direction
 * - Large intervals (3+ steps) imply REVERSAL: change direction, smaller step
 *
 * This creates melodies that feel "inevitable yet surprising" —
 * stepwise motion continues naturally, leaps resolve satisfyingly.
 */

/**
 * Given a pitch ladder size, previous index and current index,
 * compute the next index using Narmour I-R principles.
 */
export function narmourNext(
  ladderSize: number, prevIdx: number, currIdx: number
): number {
  const interval = currIdx - prevIdx;
  const absInterval = Math.abs(interval);
  const direction = interval === 0
    ? (Math.random() < 0.5 ? 1 : -1)
    : Math.sign(interval);

  let nextIdx: number;

  if (absInterval <= 2) {
    // PROCESS: continue same direction, similar step size
    const jitter = Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0;
    const step = direction * Math.max(1, absInterval + jitter);
    nextIdx = currIdx + step;
  } else {
    // REVERSAL: opposite direction, smaller step
    const reversalSize = Math.max(1, absInterval - 1 - Math.floor(Math.random() * 2));
    nextIdx = currIdx + (-direction * reversalSize);

    // 20% chance of registral return (jump back near starting pitch)
    if (Math.random() < 0.2) {
      nextIdx = prevIdx + (Math.random() < 0.5 ? -1 : 1);
    }
  }

  return Math.max(0, Math.min(ladderSize - 1, nextIdx));
}

/**
 * Build a melodic phrase using Narmour I-R principles.
 *
 * @param ladderSize  Total pitches available in the ladder
 * @param anchorIdx   Starting pitch index (usually a chord tone)
 * @param length      Number of notes to generate
 */
export function buildNarmourPhrase(
  ladderSize: number, anchorIdx: number, length: number
): number[] {
  if (length <= 0) return [];

  const clamped = Math.max(0, Math.min(ladderSize - 1, anchorIdx));
  const phrase: number[] = [clamped];

  if (length === 1) return phrase;

  // Second note: small step from anchor
  const firstStep = Math.random() < 0.5 ? 1 : -1;
  const second = Math.max(0, Math.min(ladderSize - 1, clamped + firstStep));
  phrase.push(second);

  // Subsequent notes: Narmour I-R
  for (let i = 2; i < length; i++) {
    const prev = phrase[i - 2];
    const curr = phrase[i - 1];
    phrase.push(narmourNext(ladderSize, prev, curr));
  }

  return phrase;
}

/**
 * Apply chord-tone gravity to a phrase: pull the last note(s) toward
 * the nearest chord tone for musical closure.
 *
 * @param phrase        Array of ladder indices
 * @param chordIndices  Indices in the ladder that are chord tones
 * @param ladderSize    Total pitches in the ladder
 * @param strength      How many ending notes are pulled (1-3)
 */
export function applyChordToneGravity(
  phrase: number[], chordIndices: number[], ladderSize: number, strength: number = 1
): number[] {
  if (phrase.length === 0 || chordIndices.length === 0) return phrase;

  const result = [...phrase];
  const pullCount = Math.min(strength, result.length);

  for (let i = 0; i < pullCount; i++) {
    const idx = result.length - 1 - i;
    const current = result[idx];

    // Find nearest chord tone
    let nearest = chordIndices[0];
    let minDist = Math.abs(current - nearest);
    for (const ct of chordIndices) {
      const dist = Math.abs(current - ct);
      if (dist < minDist) {
        minDist = dist;
        nearest = ct;
      }
    }

    // Pull toward it: last note lands on chord tone,
    // second-to-last moves halfway there
    if (i === 0) {
      result[idx] = nearest;
    } else {
      // Approach notes: move partway toward the chord tone
      const step = Math.sign(nearest - current) * Math.max(1, Math.ceil(minDist / 2));
      result[idx] = Math.max(0, Math.min(ladderSize - 1, current + step));
    }
  }

  return result;
}
