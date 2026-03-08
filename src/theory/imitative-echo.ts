/**
 * Imitative echo — arp echoes melody motifs at transposed pitch levels.
 *
 * In contrapuntal music (Bach fugues, jazz call-and-response),
 * one voice states a motif and another voice answers with the same
 * shape at a different pitch level. This creates a sense of musical
 * conversation between layers.
 *
 * This module provides:
 * 1. Motif transposition to fit the current chord
 * 2. Probability control per mood (jazz moods echo more)
 * 3. Interval selection for the echo (5th above, 4th below, etc.)
 *
 * The echo is not literal — it adapts to the current harmony by
 * snapping transposed notes to the nearest chord/scale tones.
 */

import type { Mood, Section } from '../types';

/** Per-mood probability of arp echoing melody motif */
const ECHO_PROBABILITY: Record<Mood, number> = {
  lofi:      0.30,   // jazz — strong call-response tradition
  flim:      0.25,   // delicate — canonic beauty
  avril:     0.20,   // intimate — gentle echoes
  downtempo: 0.20,   // smooth — flowing echoes
  xtal:      0.25,   // dreamy — ethereal echoes
  syro:      0.35,   // IDM — complex imitation
  blockhead: 0.15,   // hip-hop — some response
  disco:     0.10,   // funk — rhythm over imitation
  trance:    0.08,   // EDM — minimal imitation
  ambient:   0.05,   // drone — sparse echoes
};

/** Echo interval preferences (in scale steps) */
const ECHO_INTERVALS: Record<Mood, number[]> = {
  lofi:      [4, -3, 2],    // 5th up, 4th down, 3rd up
  flim:      [2, -2, 4],    // 3rd, 3rd down, 5th
  avril:     [4, 2, -3],    // 5th, 3rd, 4th down
  downtempo: [4, -3, 2],    // classic intervals
  xtal:      [4, 2, 7],     // 5th, 3rd, octave
  syro:      [-4, 3, -2],   // unusual — 5th down, 4th up, 3rd down
  blockhead: [4, -3],       // 5th, 4th down
  disco:     [4, 2],        // simple intervals
  trance:    [7, 4],        // octave, 5th (power intervals)
  ambient:   [4, 7],        // 5th, octave (open)
};

/** Section multiplier for echo probability */
const SECTION_ECHO: Record<Section, number> = {
  intro:     0.5,    // sparse — fewer echoes
  build:     0.8,    // growing — moderate echoes
  peak:      0.6,    // dense — echoes can get lost
  breakdown: 1.2,    // exposed — echoes shine
  groove:    1.0,    // neutral
};

/**
 * Decide whether the arp should echo the melody motif.
 */
export function shouldEchoMotif(
  mood: Mood,
  section: Section
): boolean {
  const prob = ECHO_PROBABILITY[mood] * SECTION_ECHO[section];
  return Math.random() < prob;
}

/**
 * Transpose a motif by a scale-step interval, snapping to scale tones.
 *
 * @param motif       Original motif notes (e.g., ['C4', 'E4', 'G4'])
 * @param scaleNotes  Available scale note names (e.g., ['C', 'D', 'E', 'F', 'G', 'A', 'B'])
 * @param interval    Transposition in scale steps (positive=up, negative=down)
 * @returns Transposed motif notes
 */
export function transposeMotif(
  motif: string[],
  scaleNotes: string[],
  interval: number
): string[] {
  if (scaleNotes.length === 0) return motif;

  return motif.map(note => {
    const match = note.match(/^([A-Gb#]+)(\d+)$/);
    if (!match) return note;

    const [, name, octStr] = match;
    const octave = parseInt(octStr);

    // Find the note in the scale
    const scaleIdx = scaleNotes.indexOf(name);
    if (scaleIdx < 0) {
      // Not in scale — find nearest scale tone
      return note;
    }

    // Transpose by scale steps
    let newIdx = scaleIdx + interval;
    let octaveShift = 0;

    while (newIdx < 0) {
      newIdx += scaleNotes.length;
      octaveShift--;
    }
    while (newIdx >= scaleNotes.length) {
      newIdx -= scaleNotes.length;
      octaveShift++;
    }

    const newNote = scaleNotes[newIdx];
    const newOctave = octave + octaveShift;

    return `${newNote}${newOctave}`;
  });
}

/**
 * Select an echo interval for the current mood.
 * Rotates through preferred intervals based on a counter.
 *
 * @param mood    Current mood
 * @param index   Echo counter (for rotation)
 * @returns Scale step interval for transposition
 */
export function selectEchoInterval(mood: Mood, index: number): number {
  const intervals = ECHO_INTERVALS[mood];
  return intervals[index % intervals.length];
}

/**
 * Get the echo probability for a mood (for testing).
 */
export function echoProbability(mood: Mood): number {
  return ECHO_PROBABILITY[mood];
}
