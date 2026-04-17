/**
 * Harmonic anticipation — melody previews the next chord before it arrives.
 *
 * In jazz and classical music, skilled improvisers "hear ahead" — their
 * melody notes start belonging to the NEXT chord 1-2 beats before the
 * actual chord change. This creates a sense of forward motion and
 * inevitability, like the melody is pulling the harmony forward.
 *
 * When the nextChordHint is available in GenerativeState, this module
 * determines which melody notes should be "borrowed" from the upcoming
 * chord to create anticipation.
 *
 * The effect is subtle but powerful: listeners subconsciously feel the
 * harmonic motion before it happens, making changes feel organic rather
 * than abrupt.
 */

import type { Mood, Section, ChordState } from '../types';

/** How strongly each mood uses harmonic anticipation (0-1) */
const ANTICIPATION_STRENGTH: Record<Mood, number> = {
  lofi:      0.50,   // jazz staple — hear ahead
  downtempo: 0.40,   // smooth forward motion
  avril:     0.35,   // singer-songwriter — some lookahead
  flim:      0.30,   // organic IDM
  ambient:   0.25,   // subtle — harmony moves slowly anyway,
  plantasia: 0.25,
  xtal:      0.25,   // dreamy anticipation
  blockhead: 0.20,   // hip-hop — chords anchor beats
  syro:      0.20,   // IDM — some forward motion
  disco:     0.15,   // grooves lock to current chord
  trance:    0.10,   // minimal harmonic movement
};

/** Section modifiers for anticipation */
const SECTION_ANTICIPATION_MULT: Record<Section, number> = {
  intro:     0.5,    // establishing — stay grounded
  build:     1.3,    // forward momentum — anticipate more
  peak:      0.8,    // energy is current, not forward
  breakdown: 1.2,    // pull toward resolution
  groove:    1.0,    // neutral
};

/**
 * How many ticks before a chord change anticipation should begin.
 * This is a "lookahead window" — melody starts borrowing next-chord
 * tones this many ticks before the change.
 */
const ANTICIPATION_WINDOW: Record<Mood, number> = {
  lofi:      2,    // 2 ticks (~4 seconds) of lookahead
  downtempo: 2,
  avril:     1,
  flim:      1,
  ambient:   2,
  plantasia: 2,
  xtal:      2,
  blockhead: 1,
  syro:      1,
  disco:     1,
  trance:    1,
};

/**
 * Determine whether a melody note should be borrowed from the next chord.
 *
 * @param ticksSinceChordChange  How many ticks since the last chord change
 * @param chordDuration          Expected duration of current chord (ticks)
 * @param mood                   Current mood
 * @param section                Current section
 * @returns Probability (0-1) that the next note should anticipate the coming chord
 */
export function anticipationProbability(
  ticksSinceChordChange: number,
  chordDuration: number,
  mood: Mood,
  section: Section
): number {
  const window = ANTICIPATION_WINDOW[mood];
  const ticksUntilChange = chordDuration - ticksSinceChordChange;

  // Only anticipate when close to chord change
  if (ticksUntilChange > window || ticksUntilChange <= 0) return 0;

  // Ramp up probability as we approach the change
  const proximity = 1.0 - (ticksUntilChange / (window + 1));
  const strength = ANTICIPATION_STRENGTH[mood] * (SECTION_ANTICIPATION_MULT[section] ?? 1.0);

  return Math.min(1.0, proximity * strength);
}

/**
 * Given the current and next chord, find notes that belong to the
 * next chord but NOT the current chord — these are the anticipation tones.
 *
 * @param currentChord  Current chord
 * @param nextChord     Upcoming chord
 * @returns Array of note names that can be used as anticipation tones
 */
export function anticipationTones(
  currentChord: ChordState,
  nextChord: ChordState
): string[] {
  const currentSet = new Set(
    currentChord.notes.map(n => n.replace(/[0-9]/g, ''))
  );
  // Notes in next chord that aren't in current — these create forward pull
  return nextChord.notes
    .map(n => n.replace(/[0-9]/g, ''))
    .filter(n => !currentSet.has(n));
}

/**
 * Bias a melody note toward an anticipation tone.
 * Returns a score (0-1) for how strongly a candidate note should
 * be favored if it matches an anticipation tone.
 *
 * @param candidateNote  The note being considered (pitch class, e.g. "D")
 * @param antTones       Available anticipation tones
 * @param probability    Current anticipation probability
 * @returns Bias multiplier (1.0 = no bias, >1.0 = favor this note)
 */
export function anticipationBias(
  candidateNote: string,
  antTones: string[],
  probability: number
): number {
  if (antTones.length === 0 || probability <= 0) return 1.0;
  const pitch = candidateNote.replace(/[0-9]/g, '');
  if (antTones.includes(pitch)) {
    // Boost by probability — stronger anticipation = stronger bias
    return 1.0 + probability * 1.5;
  }
  return 1.0;
}

/**
 * Whether harmonic anticipation should be active for this mood.
 */
export function shouldAnticipate(mood: Mood): boolean {
  return ANTICIPATION_STRENGTH[mood] >= 0.10;
}

/**
 * Get anticipation strength for a mood (for testing).
 */
export function anticipationStrength(mood: Mood): number {
  return ANTICIPATION_STRENGTH[mood];
}
