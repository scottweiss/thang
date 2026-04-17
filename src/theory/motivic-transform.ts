/**
 * Motivic transformation — classical development techniques applied to motifs.
 *
 * Great composers don't just repeat motifs. They develop them:
 * - Inversion: flip intervals (up→down, down→up)
 * - Retrograde: play backwards
 * - Augmentation: stretch rhythm (half speed)
 * - Diminution: compress rhythm (double speed)
 * - Transposition: shift to different scale degree
 *
 * These transformations create unity-through-variety: the listener
 * recognizes the source material while hearing something new.
 *
 * Applied per-section: builds use augmentation (broadening),
 * peaks use diminution (intensity), breakdowns use retrograde
 * (reflection), grooves use inversion (new perspective).
 */

import type { Mood, Section } from '../types';

export type TransformType = 'identity' | 'inversion' | 'retrograde' | 'augmentation' | 'diminution' | 'retrograde-inversion';

/**
 * Invert a motif: flip intervals around the first note.
 * [C3, E3, G3] (up 4, up 3) → [C3, Ab2, F2] (down 4, down 3)
 *
 * Works on scale-degree indices (0-based ladder positions).
 */
export function invertMotif(indices: number[], ladderLength: number): number[] {
  if (indices.length < 2) return [...indices];
  const pivot = indices[0];
  return indices.map(idx => {
    const interval = idx - pivot;
    const inverted = pivot - interval;
    return Math.max(0, Math.min(ladderLength - 1, inverted));
  });
}

/**
 * Retrograde: reverse the motif order.
 */
export function retrogradeMotif(indices: number[]): number[] {
  return [...indices].reverse();
}

/**
 * Retrograde inversion: invert then reverse (or equivalently reverse then invert).
 */
export function retrogradeInversion(indices: number[], ladderLength: number): number[] {
  return retrogradeMotif(invertMotif(indices, ladderLength));
}

/**
 * Augmentation: stretch motif by inserting rests between notes.
 * Returns indices with -1 indicating rest positions.
 * [0, 2, 4] → [0, -1, 2, -1, 4, -1]
 */
export function augmentMotif(indices: number[]): number[] {
  if (indices.length === 0) return [];
  const result: number[] = [];
  for (let i = 0; i < indices.length; i++) {
    result.push(indices[i]);
    if (i < indices.length - 1) {
      result.push(-1); // rest
    }
  }
  return result;
}

/**
 * Diminution: compress motif by taking every other note.
 * [0, 2, 4, 6, 8] → [0, 4, 8]
 * Keeps at least 2 notes.
 */
export function diminishMotif(indices: number[]): number[] {
  if (indices.length <= 2) return [...indices];
  const result: number[] = [];
  for (let i = 0; i < indices.length; i += 2) {
    result.push(indices[i]);
  }
  // Always include last note for resolution
  if (result[result.length - 1] !== indices[indices.length - 1]) {
    result.push(indices[indices.length - 1]);
  }
  return result;
}

/**
 * Transpose a motif by shifting all indices.
 * Clamps to ladder bounds.
 */
export function transposeMotif(indices: number[], shift: number, ladderLength: number): number[] {
  return indices.map(idx => {
    if (idx < 0) return idx; // preserve rests
    return Math.max(0, Math.min(ladderLength - 1, idx + shift));
  });
}

/**
 * Apply a named transformation to a motif.
 */
export function applyTransform(
  indices: number[],
  transform: TransformType,
  ladderLength: number
): number[] {
  switch (transform) {
    case 'identity':
      return [...indices];
    case 'inversion':
      return invertMotif(indices, ladderLength);
    case 'retrograde':
      return retrogradeMotif(indices);
    case 'retrograde-inversion':
      return retrogradeInversion(indices, ladderLength);
    case 'augmentation':
      return augmentMotif(indices);
    case 'diminution':
      return diminishMotif(indices);
  }
}

/**
 * Pick the best transformation for the current musical context.
 * Each section has characteristic development techniques.
 */
export function sectionTransform(section: Section, progress: number): TransformType {
  switch (section) {
    case 'intro':
      // Intro: identity early, gentle inversion as it develops
      return progress < 0.6 ? 'identity' : 'inversion';
    case 'build':
      // Build: augmentation creates broadening, then diminution for urgency
      return progress < 0.5 ? 'augmentation' : 'diminution';
    case 'peak':
      // Peak: diminution for intensity, retrograde-inversion for climax
      return progress < 0.7 ? 'diminution' : 'retrograde-inversion';
    case 'breakdown':
      // Breakdown: retrograde for reflection, inversion for contemplation
      return progress < 0.5 ? 'retrograde' : 'inversion';
    case 'groove':
      // Groove: identity (let it breathe), occasional inversion
      return progress < 0.7 ? 'identity' : 'inversion';
  }
}

/**
 * Should motivic transformation be applied?
 * Not all moods benefit equally — structured moods use it more.
 */
export function shouldTransformMotif(mood: Mood, section: Section): boolean {
  const prob = MOOD_TRANSFORM_PROB[mood] * SECTION_TRANSFORM_MULT[section];
  return Math.random() < prob;
}

/**
 * Deterministic version for testing.
 */
export function transformProbability(mood: Mood, section: Section): number {
  return MOOD_TRANSFORM_PROB[mood] * SECTION_TRANSFORM_MULT[section];
}

const MOOD_TRANSFORM_PROB: Record<Mood, number> = {
  lofi:      0.25,   // jazzy development
  downtempo: 0.30,   // classical influence
  blockhead: 0.20,   // hip-hop sample flipping
  flim:      0.35,   // intricate IDM development
  avril:     0.25,   // intimate variation
  xtal:      0.20,   // dreamy transformation
  syro:      0.40,   // complex IDM development
  trance:    0.15,   // repetitive — less transformation
  disco:     0.10,   // groove-based — keep motifs stable
  ambient:   0.05,   // minimal structure,
  plantasia: 0.05,
};

const SECTION_TRANSFORM_MULT: Record<Section, number> = {
  intro:     0.5,    // establishing — keep simple
  build:     1.2,    // developing — more transformation
  peak:      1.0,    // climax — transform for intensity
  breakdown: 1.3,    // reflection — most development
  groove:    0.7,    // settled — less transformation
};
