/**
 * Chromatic approach chords — insert passing diminished chords between
 * diatonic harmonies for smoother voice leading.
 *
 * In jazz and film scoring, diminished 7th chords are used as passing
 * harmonies between diatonic chords. Because dim7 chords are symmetrical
 * (all minor 3rds), they connect ANY two chords chromatically:
 *
 *   C → C#dim7 → Dm    (ascending chromatic approach)
 *   Em → Ebdim7 → Dm   (descending chromatic approach)
 *
 * The diminished chord shares common tones with both the preceding and
 * following chords, creating an incredibly smooth transition.
 *
 * Rules:
 * - Only insert between chords whose roots are a whole step or more apart
 * - The passing chord root is a semitone below the target (ascending approach)
 *   or a semitone above (descending approach)
 * - Always dim7 quality (fully diminished)
 * - Short duration — typically half the normal chord length
 */

import type { Mood, Section, NoteName } from '../types';
import { noteIndex, noteFromIndex } from './scales';

/** Per-mood probability of inserting a chromatic approach chord */
const APPROACH_PROB: Record<Mood, number> = {
  lofi:      0.20,   // jazz — loves chromatic passing
  downtempo: 0.15,   // smooth — nice color
  blockhead: 0.10,   // hip-hop jazz — occasional
  flim:      0.12,   // delicate — tasteful surprise
  disco:     0.08,   // funk — some chromaticism
  syro:      0.10,   // IDM — harmonic complexity
  avril:     0.08,   // intimate — subtle
  xtal:      0.05,   // dreamy — rare
  trance:    0.02,   // driving — clean harmony preferred
  ambient:   0.00,   // too static for passing chords,
  plantasia: 0.00,
};

/** Section multiplier — approach chords work best in settled sections */
const SECTION_MULT: Record<Section, number> = {
  groove:    1.2,    // settled — great context
  build:     0.8,    // building — OK
  peak:      0.5,    // intense — keep it simple
  breakdown: 1.0,    // spacious — nice color
  intro:     0.4,    // too early — establishing tonality
};

/**
 * Whether the interval between two chord roots warrants a passing chord.
 * Only applies when roots are 2+ semitones apart (whole step or more).
 *
 * @param currentRoot  Current chord root
 * @param nextRoot     Next chord root
 * @returns true if a passing chord would be useful
 */
export function needsApproachChord(
  currentRoot: NoteName,
  nextRoot: NoteName
): boolean {
  const curr = noteIndex(currentRoot);
  const next = noteIndex(nextRoot);
  const interval = Math.abs(next - curr);
  // Chromatic interval (modular distance)
  const dist = Math.min(interval, 12 - interval);
  // Only insert when roots are 2-6 semitones apart
  // (1 semitone = already chromatic, 7+ = too far for a single passing chord)
  return dist >= 2 && dist <= 6;
}

/**
 * Compute the root of the chromatic approach chord.
 * Uses ascending approach (semitone below target) by default,
 * or descending approach if the current root is above the target.
 *
 * @param currentRoot  Current chord root
 * @param nextRoot     Target chord root
 * @returns Root of the passing diminished chord
 */
export function approachChordRoot(
  currentRoot: NoteName,
  nextRoot: NoteName
): NoteName {
  const curr = noteIndex(currentRoot);
  const next = noteIndex(nextRoot);

  // Determine direction: ascending or descending approach
  const upDist = ((next - curr) + 12) % 12;
  const downDist = ((curr - next) + 12) % 12;

  if (upDist <= downDist) {
    // Ascending approach: semitone below target
    return noteFromIndex(next - 1);
  } else {
    // Descending approach: semitone above target
    return noteFromIndex(next + 1);
  }
}

/**
 * Build diminished 7th chord notes for the approach chord.
 *
 * Dim7 intervals: root, m3 (+3), dim5 (+6), dim7 (+9)
 * All intervals are minor thirds — perfectly symmetrical.
 *
 * @param root    Root of the diminished chord
 * @param octave  Base octave
 * @returns Array of note names with octave
 */
export function approachChordNotes(
  root: NoteName,
  octave: number
): string[] {
  const rootIdx = noteIndex(root);
  return [
    `${noteFromIndex(rootIdx)}${octave}`,
    `${noteFromIndex(rootIdx + 3)}${octave}`,
    `${noteFromIndex(rootIdx + 6)}${octave}`,
    `${noteFromIndex(rootIdx + 9)}${octave}`,
  ];
}

/**
 * Whether to insert a chromatic approach chord before the next chord.
 *
 * @param currentRoot  Current chord root
 * @param nextRoot     Next chord root
 * @param mood         Current mood
 * @param section      Current section
 * @returns true if an approach chord should be inserted
 */
export function shouldInsertApproachChord(
  currentRoot: NoteName,
  nextRoot: NoteName,
  mood: Mood,
  section: Section
): boolean {
  if (!needsApproachChord(currentRoot, nextRoot)) return false;
  const prob = APPROACH_PROB[mood] * SECTION_MULT[section];
  return Math.random() < prob;
}

/**
 * Get the approach chord probability for a mood (for testing).
 */
export function approachChordProbability(mood: Mood): number {
  return APPROACH_PROB[mood];
}
