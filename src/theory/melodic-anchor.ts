/**
 * Melodic anchor tones — structurally important pitches that recur
 * throughout a piece, creating subliminal coherence.
 *
 * In classical composition, a "kopfton" (head tone) or structural
 * pitch serves as an anchor that the melody keeps returning to.
 * This creates a sense of unity even as the melody explores different
 * territory. Think of how a jazz improvisation keeps touching the
 * root or 5th of the key.
 *
 * This module:
 * 1. Selects anchor tones based on the current key and mood
 * 2. Biases note selection toward anchors at phrase boundaries
 * 3. Tracks how recently anchors were sounded (recency weighting)
 *
 * Different moods use different anchor strategies:
 * - Jazz (lofi): 3rd and 7th as anchors (guide tones)
 * - Ambient: root and 5th (stable, grounded)
 * - Trance: root (single strong anchor)
 * - IDM (syro): 2nd and 6th (non-obvious anchors for interest)
 */

import type { Mood } from '../types';

/** Anchor scale degrees per mood (0-indexed from root) */
const MOOD_ANCHORS: Record<Mood, number[]> = {
  ambient:   [0, 4],      // root, P5
  xtal:      [0, 4],      // root, P5
  downtempo: [0, 2, 4],   // root, M3, P5
  lofi:      [2, 6],      // M3, M7 (guide tones)
  flim:      [0, 2],      // root, M3
  avril:     [0, 4],      // root, P5
  blockhead: [0, 4, 6],   // root, P5, M7
  disco:     [0, 2, 4],   // root, M3, P5
  syro:      [1, 5],      // M2, M6 (non-obvious)
  trance:    [0],          // root only
};

/** How strongly to bias toward anchors per mood (0-1) */
const ANCHOR_STRENGTH: Record<Mood, number> = {
  trance:    0.50,   // very strong root pull
  lofi:      0.40,   // guide tone magnetism
  disco:     0.35,   // clear tonal center
  blockhead: 0.35,   // grounded
  downtempo: 0.30,   // moderate pull
  avril:     0.30,   // intimate return
  flim:      0.25,   // gentle pull
  xtal:      0.20,   // dreamy, less anchored
  syro:      0.20,   // intentionally unstable
  ambient:   0.15,   // floating
};

/**
 * Get the anchor tones for the current key and mood.
 * Returns note names (without octave) that serve as structural anchors.
 *
 * @param scaleNotes  Notes in the current scale (e.g., ['C', 'D', 'E', 'F', 'G', 'A', 'B'])
 * @param mood        Current mood
 * @returns Array of anchor note names (without octave)
 */
export function getAnchorTones(scaleNotes: string[], mood: Mood): string[] {
  const degrees = MOOD_ANCHORS[mood];
  return degrees
    .filter(d => d < scaleNotes.length)
    .map(d => scaleNotes[d]);
}

/**
 * Compute a bias multiplier for a candidate note based on anchor proximity.
 * Notes that match an anchor get boosted, others are unaffected.
 *
 * @param candidateNote  Candidate note name (without octave, e.g., 'E')
 * @param scaleNotes     Notes in the current scale
 * @param mood           Current mood
 * @param atPhraseBound  Whether we're at a phrase boundary (start/end)
 * @returns Multiplier for the candidate's selection weight (1.0-2.0)
 */
export function anchorBias(
  candidateNote: string,
  scaleNotes: string[],
  mood: Mood,
  atPhraseBound: boolean
): number {
  const anchors = getAnchorTones(scaleNotes, mood);
  const strength = ANCHOR_STRENGTH[mood];

  // Strip octave from candidate
  const pitchClass = candidateNote.replace(/\d+$/, '');

  if (anchors.includes(pitchClass)) {
    // Stronger bias at phrase boundaries (beginning/end of phrases)
    const boundaryBoost = atPhraseBound ? 1.5 : 1.0;
    return 1.0 + strength * boundaryBoost;
  }

  return 1.0;
}

/**
 * Check if a note is an anchor tone for the current context.
 *
 * @param note       Note name (with or without octave)
 * @param scaleNotes Scale notes
 * @param mood       Current mood
 * @returns true if the note is an anchor
 */
export function isAnchorTone(
  note: string,
  scaleNotes: string[],
  mood: Mood
): boolean {
  const pitchClass = note.replace(/\d+$/, '');
  return getAnchorTones(scaleNotes, mood).includes(pitchClass);
}

/**
 * Score how well a melody fragment uses anchor tones.
 * Used to evaluate melody quality.
 *
 * @param notes      Melody notes (with octave)
 * @param scaleNotes Scale notes
 * @param mood       Current mood
 * @returns Score 0-1 (1 = perfect anchor usage)
 */
export function anchorUsageScore(
  notes: string[],
  scaleNotes: string[],
  mood: Mood
): number {
  if (notes.length === 0) return 0;

  const anchors = getAnchorTones(scaleNotes, mood);
  const anchorHits = notes.filter(n => {
    const pc = n.replace(/\d+$/, '');
    return anchors.includes(pc);
  }).length;

  const ratio = anchorHits / notes.length;
  const target = ANCHOR_STRENGTH[mood]; // target anchor density

  // Score based on how close we are to the target density
  // Too few anchors = low score, too many = also slightly low (boring)
  const dist = Math.abs(ratio - target);
  return Math.max(0, 1 - dist * 2);
}

/**
 * Get anchor strength for a mood (for testing).
 */
export function melodicAnchorStrength(mood: Mood): number {
  return ANCHOR_STRENGTH[mood];
}
