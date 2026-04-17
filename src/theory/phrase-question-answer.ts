/**
 * Phrase question-answer — melodic call triggers complementary response.
 *
 * In music, a "question" phrase (ending on a non-tonic) naturally
 * expects an "answer" phrase (ending on tonic). This module tracks
 * phrase parity and provides direction for resolution.
 *
 * Applied as melodic target and gain emphasis on answer phrases.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood question-answer strength.
 */
const QA_STRENGTH: Record<Mood, number> = {
  trance:    0.40,  // moderate — clear phrases
  avril:     0.60,  // strongest — classical phrasing
  disco:     0.25,  // weak — repeating patterns
  downtempo: 0.45,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.55,  // strong — jazz call-response
  flim:      0.50,  // strong — delicate phrasing
  xtal:      0.45,  // moderate
  syro:      0.15,  // weakest — fragmented phrases
  ambient:   0.35,  // moderate — flowing phrases,
  plantasia: 0.35,
};

/**
 * Section multipliers for Q/A tendency.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.7,   // gentle phrasing
  build:     1.0,   // normal
  peak:      1.2,   // strongest phrasing
  breakdown: 0.9,   // slightly less
  groove:    1.1,   // good phrasing
};

/**
 * Determine if current phrase position is a "question" or "answer".
 *
 * @param phraseIndex Which phrase we're in (0-based)
 * @returns 'question' for odd, 'answer' for even
 */
export function phraseRole(phraseIndex: number): 'question' | 'answer' {
  return phraseIndex % 2 === 0 ? 'question' : 'answer';
}

/**
 * Gain emphasis for answer phrases (resolution gets attention).
 *
 * @param phraseIndex Which phrase we're in
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.95 - 1.15)
 */
export function qaGainEmphasis(
  phraseIndex: number,
  mood: Mood,
  section: Section
): number {
  const strength = QA_STRENGTH[mood] * SECTION_MULT[section];
  const role = phraseRole(phraseIndex);
  if (role === 'answer') {
    // Answer phrases get slight boost
    return 1.0 + strength * 0.15;
  }
  // Question phrases get slight reduction
  return 1.0 - strength * 0.05;
}

/**
 * Whether the phrase should resolve to tonic.
 *
 * @param phraseIndex Which phrase we're in
 * @param mood Current mood
 * @returns true if should target tonic resolution
 */
export function shouldResolveToTonic(
  phraseIndex: number,
  mood: Mood
): boolean {
  const role = phraseRole(phraseIndex);
  if (role !== 'answer') return false;
  return QA_STRENGTH[mood] > 0.2;
}

/**
 * Get Q/A strength for a mood (for testing).
 */
export function qaStrength(mood: Mood): number {
  return QA_STRENGTH[mood];
}
