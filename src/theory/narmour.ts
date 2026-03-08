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
