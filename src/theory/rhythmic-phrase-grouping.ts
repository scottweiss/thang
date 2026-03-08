/**
 * Rhythmic phrase grouping — note groupings imply phrase boundaries.
 *
 * Groups of notes separated by rests create phrase structure.
 * This module determines optimal group sizes and rest placement
 * to create clear, musical phrasing in rhythmic patterns.
 *
 * Applied as rest insertion probability at group boundaries.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood phrase group size (beats per group).
 */
const GROUP_SIZE: Record<Mood, number> = {
  trance:    4,     // 4-beat groups (bar-aligned)
  avril:     4,     // 4-beat classical phrases
  disco:     4,     // 4-beat groove
  downtempo: 3,     // 3-beat groups (asymmetric)
  blockhead: 2,     // 2-beat hip-hop phrases
  lofi:      3,     // 3-beat jazz groups
  flim:      5,     // 5-beat irregular groups
  xtal:      5,     // 5-beat crystalline phrases
  syro:      7,     // 7-beat irregular (prime number)
  ambient:   6,     // 6-beat flowing groups
};

/**
 * Per-mood boundary emphasis (higher = more distinct grouping).
 */
const BOUNDARY_EMPHASIS: Record<Mood, number> = {
  trance:    0.40,  // moderate — clear phrases
  avril:     0.55,  // strong — classical phrasing
  disco:     0.35,  // moderate
  downtempo: 0.40,  // moderate
  blockhead: 0.50,  // strong — punchy phrases
  lofi:      0.45,  // moderate
  flim:      0.50,  // strong — delicate grouping
  xtal:      0.55,  // strong — crystalline phrases
  syro:      0.30,  // weak — flowing
  ambient:   0.25,  // weak — continuous
};

/**
 * Calculate rest probability at a beat position.
 * Higher at group boundaries.
 *
 * @param beatPosition Position within the cycle
 * @param mood Current mood
 * @returns Rest probability (0.0 - 0.6)
 */
export function groupBoundaryRest(
  beatPosition: number,
  mood: Mood
): number {
  const groupSize = GROUP_SIZE[mood];
  const emphasis = BOUNDARY_EMPHASIS[mood];
  const posInGroup = beatPosition % groupSize;
  // Last beat of group has highest rest probability
  const isLastBeat = posInGroup === groupSize - 1;
  if (isLastBeat) return emphasis * 0.6;
  // Second-to-last also slightly elevated
  if (posInGroup === groupSize - 2) return emphasis * 0.2;
  return 0;
}

/**
 * Get group size for a mood (for testing).
 */
export function phraseGroupSize(mood: Mood): number {
  return GROUP_SIZE[mood];
}

/**
 * Get boundary emphasis for a mood (for testing).
 */
export function phraseBoundaryEmphasis(mood: Mood): number {
  return BOUNDARY_EMPHASIS[mood];
}
