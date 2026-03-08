/**
 * Phrase breath mark — gain dip before important entries.
 *
 * In performed music, musicians naturally leave a tiny "breath"
 * (silence or reduced volume) before an important note or phrase
 * start. This module detects phrase boundaries and applies a brief
 * gain dip in the beat before, creating a natural "intake" that
 * makes the next entry feel more impactful.
 *
 * Different from phrase-breathing (which inserts rests between phrases)
 * — this is about dynamic *preparation* before entries.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood breath depth (gain reduction before entries).
 */
const BREATH_DEPTH: Record<Mood, number> = {
  trance:    0.08,  // tiny breath
  avril:     0.30,  // dramatic breath
  disco:     0.12,  // groove breath
  downtempo: 0.25,  // relaxed preparation
  blockhead: 0.15,  // moderate
  lofi:      0.28,  // jazz breathing
  flim:      0.25,  // organic
  xtal:      0.20,  // gentle
  syro:      0.10,  // controlled
  ambient:   0.18,  // spacious breath
};

/**
 * Detect if a position is a "breath mark" (before an important entry).
 *
 * @param elements Array of notes/rests
 * @param position Current position index
 * @returns Whether this position should have a breath mark
 */
export function isBreathMark(elements: string[], position: number): boolean {
  if (position >= elements.length - 1) return false;
  if (elements[position] !== '~') return false; // must be a rest

  // Rest followed by a note = breath mark
  const next = elements[position + 1];
  if (next === '~') return false;

  // Extra strong if preceded by notes (gap after playing)
  if (position > 0 && elements[position - 1] !== '~') return true;

  return true;
}

/**
 * Calculate breath mark gain multiplier.
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier for breath mark positions (0.6-1.0)
 */
export function breathMarkGain(mood: Mood, section: Section): number {
  const depth = BREATH_DEPTH[mood];
  const sectionMult: Record<Section, number> = {
    intro:     0.6,
    build:     0.8,
    peak:      0.5,   // tight, less breathing room
    breakdown: 1.3,   // maximum breathing
    groove:    1.0,
  };
  return Math.max(0.6, 1.0 - depth * (sectionMult[section] ?? 1.0));
}

/**
 * Should breath marks be applied?
 */
export function shouldApplyBreathMarks(mood: Mood): boolean {
  return BREATH_DEPTH[mood] > 0.10;
}

/**
 * Get breath depth for a mood (for testing).
 */
export function breathDepth(mood: Mood): number {
  return BREATH_DEPTH[mood];
}
