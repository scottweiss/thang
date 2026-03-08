/**
 * Contour variety — prevent melodic shape monotony across phrases.
 *
 * Without this, melodies in long sections repeat the same contour
 * (e.g., every peak phrase is an arch, every groove phrase is flat).
 * Real composers vary their phrase shapes even within the same section.
 *
 * This module tracks a short history of recent contour shapes and
 * selects alternatives when the same shape would repeat. Each section
 * still has primary shapes, but after using one, the system rotates
 * to compatible alternatives.
 *
 * Example: peak section normally uses 'arch'. After two arches,
 * it might pick 'ascending' (still energetic but different shape)
 * or even a brief 'valley' for contrast before returning to 'arch'.
 */

import type { Section, Mood } from '../types';
import type { ContourShape } from './melodic-contour';

/** Compatible contour alternatives per section (ordered by preference) */
const SECTION_CONTOURS: Record<Section, ContourShape[]> = {
  intro:     ['plateau', 'ascending', 'valley'],
  build:     ['ascending', 'arch', 'plateau'],
  peak:      ['arch', 'ascending', 'descending'],
  breakdown: ['valley', 'descending', 'plateau'],
  groove:    ['plateau', 'arch', 'valley', 'ascending'],
};

/** Per-mood variety appetite (0 = always pick primary, 1 = maximum rotation) */
const VARIETY_APPETITE: Record<Mood, number> = {
  lofi:      0.50,   // jazz — constantly varying phrases
  downtempo: 0.40,   // smooth — moderate variety
  flim:      0.55,   // delicate — expressive variety
  avril:     0.45,   // intimate — thoughtful variation
  xtal:      0.35,   // dreamy — some drift
  blockhead: 0.40,   // hip-hop — phrase variation
  disco:     0.30,   // funk — groove consistency with some variety
  syro:      0.60,   // IDM — high variety
  trance:    0.20,   // EDM — repetition is a feature
  ambient:   0.25,   // drone — slow variation
};

/**
 * Select a contour shape that avoids repeating recent history.
 *
 * @param section       Current section
 * @param mood          Current mood
 * @param recentShapes  Last N contour shapes used (most recent first)
 * @returns Selected contour shape
 */
export function selectVariedContour(
  section: Section,
  mood: Mood,
  recentShapes: ContourShape[]
): ContourShape {
  const candidates = SECTION_CONTOURS[section];
  if (!candidates || candidates.length === 0) return 'plateau';

  const variety = VARIETY_APPETITE[mood];

  // No history or low variety: use primary shape
  if (recentShapes.length === 0 || variety < 0.1) {
    return candidates[0];
  }

  // Count consecutive repeats of the most recent shape
  const lastShape = recentShapes[0];
  let consecutiveRepeats = 0;
  for (const shape of recentShapes) {
    if (shape === lastShape) consecutiveRepeats++;
    else break;
  }

  // Compute urgency to change (increases with repeats and variety appetite)
  const changeUrgency = Math.min(1.0, consecutiveRepeats * variety * 0.6);

  // If urgency is low, stick with the section's primary
  if (changeUrgency < 0.3) {
    return candidates[0];
  }

  // Score each candidate: penalize recent usage, bonus for freshness
  const scores = candidates.map(candidate => {
    let score = 1.0;

    // Heavy penalty for matching the last shape
    if (candidate === lastShape) {
      score *= 1.0 - changeUrgency;
    }

    // Lighter penalty for appearing anywhere in recent history
    const recentCount = recentShapes.filter(s => s === candidate).length;
    score *= Math.pow(0.7, recentCount);

    // Bonus for being the primary shape (section-appropriate)
    if (candidate === candidates[0]) {
      score *= 1.2;
    }

    return score;
  });

  // Weighted selection
  const totalScore = scores.reduce((a, b) => a + b, 0);
  if (totalScore <= 0) return candidates[0];

  let roll = Math.random() * totalScore;
  for (let i = 0; i < candidates.length; i++) {
    roll -= scores[i];
    if (roll <= 0) return candidates[i];
  }

  return candidates[candidates.length - 1];
}

/**
 * Get the variety appetite for a mood (for testing).
 */
export function contourVarietyAppetite(mood: Mood): number {
  return VARIETY_APPETITE[mood];
}

/**
 * Get the candidate contours for a section (for testing).
 */
export function sectionContourCandidates(section: Section): ContourShape[] {
  return [...SECTION_CONTOURS[section]];
}
