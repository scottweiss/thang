/**
 * Bass contrary motion — bias bass direction opposite to melody.
 *
 * The most fundamental counterpoint rule: when the melody rises,
 * the bass should tend to fall (and vice versa). This creates
 * harmonic independence between the outer voices, making the music
 * sound richer and more composed.
 *
 * Applied by reordering bass pattern candidates so that patterns
 * moving opposite to the melody are preferred.
 */

import type { Mood } from '../types';

/**
 * How strongly each mood favors contrary motion.
 * Jazz/classical moods prefer it strongly; driving/electronic moods less.
 */
const CONTRARY_STRENGTH: Record<Mood, number> = {
  lofi:      0.60,   // jazz — strong voice independence
  downtempo: 0.50,   // smooth — noticeable independence
  blockhead: 0.45,   // hip-hop — moderate independence
  avril:     0.40,   // intimate — gentle contrary motion
  flim:      0.35,   // delicate — some independence
  disco:     0.35,   // funk — bass has its own groove
  xtal:      0.30,   // dreamy — subtle
  ambient:   0.20,   // static — bass barely moves
  syro:      0.15,   // IDM — bass follows its own logic
  trance:    0.10,   // driving — bass and melody align for power
};

export type BassDirection = 'ascending' | 'descending' | 'static';

/**
 * Suggest bass direction based on melody direction.
 * Returns the opposite direction when contrary motion is strong,
 * or 'static' when the effect is minimal.
 *
 * @param melodyDirection Current melody direction
 * @param mood           Current mood
 * @returns Suggested bass direction
 */
export function suggestBassDirection(
  melodyDirection: 'ascending' | 'descending' | 'static' | undefined,
  mood: Mood
): BassDirection {
  if (!melodyDirection || melodyDirection === 'static') return 'static';

  const strength = CONTRARY_STRENGTH[mood];
  if (Math.random() >= strength) return 'static'; // no bias

  // Contrary motion: opposite direction
  return melodyDirection === 'ascending' ? 'descending' : 'ascending';
}

/**
 * Reorder bass pattern candidates to prefer the suggested direction.
 * Patterns matching the suggested direction are moved to the front.
 *
 * @param patterns    Array of bass patterns (each is string[])
 * @param direction   Suggested bass direction
 * @param root        Root note for comparison
 * @param fifth       Fifth note for comparison
 * @returns Reordered patterns array (same length)
 */
export function biasBassPatterns<T extends string[]>(
  patterns: T[],
  direction: BassDirection,
  root: string,
  fifth: string
): T[] {
  if (direction === 'static' || patterns.length <= 1) return patterns;

  // Score each pattern by how well it matches the desired direction
  const scored = patterns.map((p, idx) => {
    const score = patternDirectionScore(p, direction, root, fifth);
    return { pattern: p, score, idx };
  });

  // Sort by score (higher = better match), stable sort preserves original order for ties
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
  return scored.map(s => s.pattern);
}

/**
 * Score how well a pattern matches the desired direction.
 * Higher score = better match.
 */
function patternDirectionScore(
  pattern: string[],
  direction: BassDirection,
  root: string,
  fifth: string
): number {
  // Simple heuristic: count directional moves in the pattern
  let score = 0;
  const notes = pattern.filter(n => n !== '~');
  if (notes.length < 2) return 0;

  for (let i = 1; i < notes.length; i++) {
    const prev = approximatePitch(notes[i - 1], root, fifth);
    const curr = approximatePitch(notes[i], root, fifth);
    const diff = curr - prev;

    if (direction === 'ascending' && diff > 0) score++;
    else if (direction === 'descending' && diff < 0) score++;
    else if (diff !== 0) score--; // wrong direction penalized
  }

  return score;
}

/**
 * Very rough pitch approximation for bass notes.
 * Just enough to determine direction (up/down).
 */
function approximatePitch(note: string, root: string, fifth: string): number {
  const match = note.match(/^([A-G][b#]?)(\d+)$/);
  if (!match) return 0;
  const name = match[1];
  const oct = parseInt(match[2]);
  const base: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  };
  return oct * 12 + (base[name] ?? 0);
}

/**
 * Whether contrary motion should be applied for this mood.
 */
export function shouldApplyContraryMotion(mood: Mood): boolean {
  return CONTRARY_STRENGTH[mood] >= 0.15;
}

/**
 * Get the contrary motion strength for a mood (for testing).
 */
export function contraryMotionStrength(mood: Mood): number {
  return CONTRARY_STRENGTH[mood];
}
