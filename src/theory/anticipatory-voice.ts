/**
 * Anticipatory voice leading — inner voices lean toward next chord.
 *
 * Before a chord change, inner voices (not bass, not soprano)
 * begin moving toward their target notes in the next chord.
 * This creates smooth, inevitable-sounding voice leading where
 * the resolution feels "prepared" rather than abrupt.
 *
 * Based on common-practice anticipation: the 7th of V starts
 * descending before arriving at the 3rd of I.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood anticipation strength.
 * Higher = more pre-movement toward next chord.
 */
const ANTICIPATION_STRENGTH: Record<Mood, number> = {
  trance:    0.15,  // block chords, less anticipation
  avril:     0.40,  // classical voice leading
  disco:     0.20,  // groove-locked
  downtempo: 0.35,  // smooth
  blockhead: 0.25,  // moderate
  lofi:      0.55,  // jazz — maximum voice leading
  flim:      0.40,  // organic movement
  xtal:      0.30,  // floating
  syro:      0.20,  // independent voices
  ambient:   0.45,  // slow, smooth transitions
};

/**
 * Section multiplier for anticipation.
 */
const SECTION_ANTIC: Record<Section, number> = {
  intro:     0.8,
  build:     1.0,
  peak:      0.7,   // strong arrivals, less anticipation
  breakdown: 1.3,   // maximum smoothness
  groove:    1.0,
};

/**
 * Calculate how much an inner voice should move toward its target.
 * Returns a fraction 0-1 of the distance to move.
 *
 * @param ticksUntilChange Ticks until the next chord change
 * @param mood Current mood
 * @param section Current section
 * @returns Movement fraction (0 = don't move, 1 = arrive at target)
 */
export function anticipationAmount(
  ticksUntilChange: number,
  mood: Mood,
  section: Section
): number {
  const strength = ANTICIPATION_STRENGTH[mood] * SECTION_ANTIC[section];

  // More anticipation as chord change approaches
  if (ticksUntilChange > 3) return 0;
  if (ticksUntilChange <= 0) return 0; // already changed

  // Ramp up: 3 ticks out = slight, 1 tick out = full anticipation
  const ramp = (4 - ticksUntilChange) / 3;
  return ramp * strength;
}

/**
 * Calculate the anticipated pitch (between current and target).
 *
 * @param currentMidi Current MIDI note
 * @param targetMidi Target MIDI note (in next chord)
 * @param amount Anticipation amount (0-1)
 * @returns Anticipated MIDI note (rounded to nearest semitone)
 */
export function anticipatedPitch(
  currentMidi: number,
  targetMidi: number,
  amount: number
): number {
  const moved = currentMidi + (targetMidi - currentMidi) * amount;
  return Math.round(moved);
}

/**
 * Find the nearest note in the target chord for voice leading.
 *
 * @param currentPc Current pitch class (0-11)
 * @param targetPcs Pitch classes in the target chord
 * @returns Nearest target pitch class
 */
export function nearestTarget(currentPc: number, targetPcs: number[]): number {
  if (targetPcs.length === 0) return currentPc;

  let best = targetPcs[0];
  let minDist = 12;
  for (const t of targetPcs) {
    const dist = Math.min(Math.abs(currentPc - t), 12 - Math.abs(currentPc - t));
    if (dist < minDist) { minDist = dist; best = t; }
  }
  return best;
}

/**
 * Should anticipatory voice leading be applied?
 *
 * @param mood Current mood
 * @param ticksUntilChange Ticks until next chord change
 * @returns Whether to apply
 */
export function shouldAnticipateVoice(
  mood: Mood,
  ticksUntilChange: number
): boolean {
  return ticksUntilChange > 0 && ticksUntilChange <= 3 &&
         ANTICIPATION_STRENGTH[mood] > 0.1;
}

/**
 * Get anticipation strength for a mood (for testing).
 */
export function anticipationStrength(mood: Mood): number {
  return ANTICIPATION_STRENGTH[mood];
}
