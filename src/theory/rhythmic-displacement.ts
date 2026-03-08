/**
 * Rhythmic displacement for syncopation and groove.
 *
 * Displacement shifts a rhythmic pattern by a fraction of a beat,
 * creating syncopation. This is fundamental to nearly every groove-based
 * genre: jazz swing, funk offbeats, drum & bass anticipation, etc.
 *
 * Types of displacement:
 * - Anticipation: notes arrive slightly early (pulls listener forward)
 * - Delay: notes arrive slightly late (creates laid-back feel)
 * - Rotation: entire pattern shifts cyclically (new accents emerge)
 */

/**
 * Rotate a pattern array by `offset` positions.
 * Positive offset = shift right (delay), negative = shift left (anticipation).
 *
 * @param pattern  Array of any type (notes, booleans, etc.)
 * @param offset   Number of positions to rotate (wraps around)
 * @returns New rotated array
 */
export function rotatePattern<T>(pattern: T[], offset: number): T[] {
  if (pattern.length === 0) return [];
  const len = pattern.length;
  const normalizedOffset = ((offset % len) + len) % len;
  return [
    ...pattern.slice(len - normalizedOffset),
    ...pattern.slice(0, len - normalizedOffset),
  ];
}

/**
 * Apply displacement to a step pattern by shifting active steps.
 * Steps that fall off the end wrap around.
 *
 * @param steps       Array of step values (notes or rests)
 * @param restValue   What counts as a rest (e.g., '~')
 * @param offset      How many steps to shift (positive = later)
 * @returns Displaced pattern
 */
export function displaceSteps(
  steps: string[],
  restValue: string,
  offset: number
): string[] {
  if (steps.length === 0 || offset === 0) return [...steps];

  // Extract active positions
  const active: { pos: number; value: string }[] = [];
  steps.forEach((s, i) => {
    if (s !== restValue) active.push({ pos: i, value: s });
  });

  // Create new pattern with displaced positions
  const result = new Array(steps.length).fill(restValue);
  for (const { pos, value } of active) {
    const newPos = ((pos + offset) % steps.length + steps.length) % steps.length;
    // Only place if slot is empty (first come first served on collision)
    if (result[newPos] === restValue) {
      result[newPos] = value;
    }
  }

  return result;
}

/**
 * Create a syncopated version of a pattern by moving some on-beat
 * notes to off-beat positions. Amount controls how many notes move.
 *
 * @param steps     Pattern array
 * @param restValue What counts as a rest
 * @param amount    Syncopation amount (0-1, higher = more off-beat)
 * @param beatSize  How many steps per beat (e.g., 4 for 16th notes)
 * @returns Syncopated pattern
 */
export function syncopate(
  steps: string[],
  restValue: string,
  amount: number,
  beatSize: number = 4
): string[] {
  if (steps.length === 0) return [];

  const result = [...steps];

  for (let i = 0; i < result.length; i++) {
    if (result[i] === restValue) continue;

    // Is this an on-beat position?
    const isOnBeat = i % beatSize === 0;
    if (!isOnBeat) continue;

    // Should we move it?
    if (Math.random() >= amount) continue;

    // Try to move to the preceding off-beat position (anticipation)
    const target = i - 1;
    if (target >= 0 && result[target] === restValue) {
      result[target] = result[i];
      result[i] = restValue;
    }
  }

  return result;
}

/**
 * Generate a displacement amount appropriate for a mood.
 * Some moods want tight, on-beat patterns (trance, disco),
 * while others want loose, displaced feels (lofi, blockhead).
 *
 * @returns Displacement in steps (can be fractional)
 */
export function moodDisplacement(mood: string): number {
  const displacements: Record<string, number> = {
    ambient: 0,
    downtempo: 0,
    lofi: 1,       // anticipate by 1 16th note (classic lofi push)
    trance: 0,
    avril: 0,
    xtal: 0,
    syro: 0,       // already complex enough rhythmically
    blockhead: 1,  // hip-hop swing anticipation
    flim: 0,
    disco: 0,
  };
  return displacements[mood] ?? 0;
}
