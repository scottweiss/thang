/**
 * Phrase elision — overlapping phrase boundaries for continuous flow.
 *
 * In classical and jazz composition, phrase elision occurs when the
 * ending of one phrase simultaneously serves as the beginning of the
 * next. Instead of clear gaps between phrases, music flows continuously
 * with shared pivot points.
 *
 * Types of elision:
 * - Dovetail: last note of phrase A = first note of phrase B
 * - Anticipation: phrase B starts 1-2 beats before phrase A ends
 * - Sustain: phrase A's final note rings through phrase B's start
 *
 * This creates the difference between choppy phrase-by-phrase
 * composition and flowing musical narrative.
 */

import type { Mood, Section } from '../types';

/** How strongly each mood favors elision (0 = always breathe, 1 = always elide) */
const ELISION_TENDENCY: Record<Mood, number> = {
  ambient:   0.70,   // flowing, continuous
  xtal:      0.60,   // dreamy continuity
  downtempo: 0.50,   // moderate flow
  lofi:      0.45,   // jazz phrasing, some elision
  flim:      0.40,   // organic but segmented
  avril:     0.35,   // singer-songwriter — phrases breathe
  blockhead: 0.25,   // hip-hop — phrases punch, then space
  disco:     0.20,   // grooves are phrase-discrete
  syro:      0.30,   // IDM — structured but flowing
  trance:    0.15,   // phrase boundaries are structural
};

/** Section modifies elision tendency */
const SECTION_ELISION_MULT: Record<Section, number> = {
  intro:     0.8,    // establishing phrases — let them breathe
  build:     1.2,    // building momentum — elide for flow
  peak:      1.0,    // sustained energy
  breakdown: 1.5,    // maximum flow — everything connects
  groove:    1.0,    // neutral
};

/** Overlap amount in slots (how many beats phrases share) */
const ELISION_OVERLAP: Record<Mood, number> = {
  ambient:   2,    // generous overlap
  xtal:      2,
  downtempo: 1,
  lofi:      1,
  flim:      1,
  avril:     1,
  blockhead: 1,
  disco:     1,
  syro:      1,
  trance:    1,
};

export type ElisionType = 'dovetail' | 'anticipation' | 'sustain' | 'none';

/**
 * Determine whether two consecutive phrases should elide.
 * Uses a deterministic approach based on phrase index to avoid
 * randomness that can't be tested.
 *
 * @param phraseIndex  Index of the current phrase (0-based)
 * @param mood         Current mood
 * @param section      Current section
 * @returns Whether phrases should overlap
 */
export function shouldElide(
  phraseIndex: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = ELISION_TENDENCY[mood] * (SECTION_ELISION_MULT[section] ?? 1.0);
  // Deterministic: use golden ratio to create pseudo-random but repeatable pattern
  const hash = ((phraseIndex + 1) * 0.618033988749895) % 1.0;
  return hash < tendency;
}

/**
 * Get the type of elision to apply between phrases.
 *
 * - Dovetail: shared pivot note (most seamless)
 * - Anticipation: next phrase starts early (creates urgency)
 * - Sustain: current phrase rings into next (creates wash)
 *
 * @param phraseIndex  Index of the current phrase
 * @param mood         Current mood
 * @param tension      Current tension (0-1)
 */
export function elisionType(
  phraseIndex: number,
  mood: Mood,
  tension: number
): ElisionType {
  // Higher tension favors anticipation (urgency)
  // Lower tension favors sustain (wash)
  // Moderate tension favors dovetail (seamless)
  if (tension > 0.7) return 'anticipation';
  if (tension < 0.3) return 'sustain';
  // Alternate between dovetail and sustain for variety
  return phraseIndex % 2 === 0 ? 'dovetail' : 'sustain';
}

/**
 * How many slots of overlap between elided phrases.
 */
export function elisionOverlap(mood: Mood, section: Section): number {
  const base = ELISION_OVERLAP[mood];
  // Breakdown gets more overlap for maximum flow
  if (section === 'breakdown') return base + 1;
  return base;
}

/**
 * Adjust breath duration between phrases based on elision.
 * When elision applies, breath is reduced or eliminated.
 *
 * @param baseBreathe   Original breath duration (slots)
 * @param phraseIndex   Index of the current phrase
 * @param mood          Current mood
 * @param section       Current section
 * @returns Adjusted breath duration
 */
export function adjustBreathForElision(
  baseBreathe: number,
  phraseIndex: number,
  mood: Mood,
  section: Section
): number {
  if (!shouldElide(phraseIndex, mood, section)) return baseBreathe;
  const overlap = elisionOverlap(mood, section);
  // Reduce breath by overlap amount, minimum 0
  return Math.max(0, baseBreathe - overlap);
}

/**
 * Get the elision tendency for a mood (for testing/inspection).
 */
export function elisionTendency(mood: Mood): number {
  return ELISION_TENDENCY[mood];
}
