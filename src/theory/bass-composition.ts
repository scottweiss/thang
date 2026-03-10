/**
 * Bass composition — composed bass lines per mood style.
 *
 * Provides structured bass patterns that go beyond simple root notes:
 * - Walking: jazz-style root→3rd→5th→approach motion
 * - Pedal: sustained root drone for ambient textures
 * - Riff: rhythmic repeating pattern with rests for drive
 * - Syncopated: funk-style off-beat emphasis
 */

import type { Mood } from '../types';

export type BassStyle = 'walking' | 'pedal' | 'riff' | 'syncopated';

const MOOD_STYLE: Record<Mood, BassStyle> = {
  lofi:      'walking',
  downtempo: 'walking',
  flim:      'walking',
  ambient:   'pedal',
  avril:     'pedal',
  xtal:      'pedal',
  trance:    'riff',
  disco:     'riff',
  blockhead: 'syncopated',
  syro:      'syncopated',
};

/**
 * Get the bass composition style for a mood.
 */
export function getBassStyle(mood: Mood): BassStyle {
  return MOOD_STYLE[mood];
}

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_TO_PITCH: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

/**
 * Get the half step below a target note as an approach tone.
 */
function halfStepBelow(target: string, octave: number): string {
  const pitch = NOTE_TO_PITCH[target];
  if (pitch === undefined) return `${target}${octave}`;
  const below = CHROMATIC[(pitch + 11) % 12]; // -1 mod 12
  const belowOct = pitch === 0 ? octave - 1 : octave;
  return `${below}${Math.max(1, belowOct)}`;
}

/**
 * Find the 5th from chord tones (index 2 if present), or return null.
 */
function findFifth(root: string, chordTones: string[]): string | null {
  // The 5th is typically the 3rd element in chord tones (root, 3rd, 5th)
  if (chordTones.length >= 3) return chordTones[2];
  // If only 2 tones and second isn't root, it might be a 5th or 3rd
  // but we can't tell — return null to signal no 5th
  return null;
}

/**
 * Find the 3rd from chord tones (index 1 if present), or return null.
 */
function findThird(root: string, chordTones: string[]): string | null {
  if (chordTones.length >= 2 && chordTones[1] !== root) return chordTones[1];
  return null;
}

/**
 * Compose a bass line for a given style.
 *
 * @param style       Bass style (walking, pedal, riff, syncopated)
 * @param root        Root note name (e.g. 'C')
 * @param chordTones  Array of chord tone names (e.g. ['C', 'E', 'G'])
 * @param nextRoot    Root of the next chord (for approach tones), or null
 * @param steps       Number of steps to generate
 * @param octave      Bass octave (default 2)
 * @returns Array of note names with octave (e.g. 'C2') or '~' for rests
 */
export function composeBassLine(
  style: BassStyle,
  root: string,
  chordTones: string[],
  nextRoot: string | null,
  steps: number,
  octave: number = 2
): string[] {
  const rootNote = `${root}${octave}`;
  const third = findThird(root, chordTones);
  const fifth = findFifth(root, chordTones);

  const thirdNote = third ? `${third}${octave}` : null;
  const fifthNote = fifth ? `${fifth}${octave}` : null;

  switch (style) {
    case 'walking':
      return composeWalking(rootNote, thirdNote, fifthNote, nextRoot, octave, steps);
    case 'pedal':
      return composePedal(rootNote, steps);
    case 'riff':
      return composeRiff(rootNote, fifthNote, steps);
    case 'syncopated':
      return composeSyncopated(rootNote, fifthNote, steps);
    default:
      return composePedal(rootNote, steps);
  }
}

/**
 * Walking bass: root → 3rd → 5th → approach to next root.
 */
function composeWalking(
  rootNote: string,
  thirdNote: string | null,
  fifthNote: string | null,
  nextRoot: string | null,
  octave: number,
  steps: number
): string[] {
  const beat2 = thirdNote ?? fifthNote ?? rootNote;
  const beat3 = fifthNote ?? rootNote;
  const beat4 = nextRoot ? halfStepBelow(nextRoot, octave) : rootNote;

  const pattern = [rootNote, beat2, beat3, beat4];
  const result: string[] = [];
  for (let i = 0; i < steps; i++) {
    result.push(pattern[i % pattern.length]);
  }
  return result;
}

/**
 * Pedal bass: all beats are root.
 */
function composePedal(rootNote: string, steps: number): string[] {
  return new Array(steps).fill(rootNote);
}

/**
 * Riff bass: rhythmic pattern with rests — root, ~, root, 5th.
 */
function composeRiff(rootNote: string, fifthNote: string | null, steps: number): string[] {
  const fth = fifthNote ?? rootNote;
  const pattern = [rootNote, '~', rootNote, fth];
  const result: string[] = [];
  for (let i = 0; i < steps; i++) {
    result.push(pattern[i % pattern.length]);
  }
  return result;
}

/**
 * Syncopated bass: funk-style off-beat — ~, root, ~, 5th, root, ~, 5th, ~.
 */
function composeSyncopated(rootNote: string, fifthNote: string | null, steps: number): string[] {
  const fth = fifthNote ?? rootNote;
  const pattern = ['~', rootNote, '~', fth, rootNote, '~', fth, '~'];
  const result: string[] = [];
  for (let i = 0; i < steps; i++) {
    result.push(pattern[i % pattern.length]);
  }
  return result;
}
