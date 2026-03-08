/**
 * Bass pattern generation — chord-following bass lines.
 *
 * Different genres have characteristic bass behaviors:
 * - Ambient/drone: static root pedal (no change needed)
 * - Disco/funk: octave-jumping patterns following chord root
 * - Lofi/hip-hop: sparse root-fifth patterns on chord changes
 * - Trance: driving root patterns with fifth approach notes
 * - Downtempo: slow root movement with passing tones
 *
 * This module generates bass patterns that follow the current chord
 * rather than staying locked to the scale root.
 */

import type { Mood } from '../types';

export type BassStyle = 'pedal' | 'root-fifth' | 'octave-jump' | 'walking' | 'driving';

interface BassConfig {
  style: BassStyle;
  octave: number;
  followChord: boolean;  // whether bass follows chord changes
}

const MOOD_BASS: Record<Mood, BassConfig> = {
  ambient:   { style: 'pedal',       octave: 2, followChord: false },
  downtempo: { style: 'root-fifth',  octave: 2, followChord: true },
  lofi:      { style: 'walking',     octave: 2, followChord: true },
  trance:    { style: 'driving',     octave: 2, followChord: true },
  avril:     { style: 'pedal',       octave: 2, followChord: false },
  xtal:      { style: 'pedal',       octave: 1, followChord: false },
  syro:      { style: 'driving',     octave: 2, followChord: true },
  blockhead: { style: 'root-fifth',  octave: 2, followChord: true },
  flim:      { style: 'pedal',       octave: 2, followChord: false },
  disco:     { style: 'octave-jump', octave: 2, followChord: true },
};

/**
 * Get the bass configuration for a mood.
 */
export function getBassConfig(mood: Mood): BassConfig {
  return MOOD_BASS[mood];
}

/**
 * Generate a bass note pattern for the current chord.
 *
 * @param chordRoot  Root note of the current chord (e.g., 'D')
 * @param fifth      Fifth of the chord (e.g., 'A')
 * @param mood       Current mood
 * @param steps      Number of steps in the pattern (default 4)
 * @returns Array of note strings with octave numbers
 */
export function generateBassPattern(
  chordRoot: string,
  fifth: string,
  mood: Mood,
  steps: number = 4
): string[] {
  const config = MOOD_BASS[mood];
  const oct = config.octave;
  const root = `${chordRoot}${oct}`;
  const rootLow = `${chordRoot}${oct - 1}`;
  const fth = `${fifth}${oct - 1}`;

  switch (config.style) {
    case 'pedal':
      // Sustained root — all same note
      return new Array(steps).fill(root);

    case 'root-fifth': {
      // Root-heavy with fifth approach — classic hip-hop/downtempo
      const patterns = [
        [root, root, fth, fth],
        [root, '~', root, fth],
        [root, root, root, fth],
        [root, '~', fth, root],
      ];
      return patterns[Math.floor(Math.random() * patterns.length)].slice(0, steps);
    }

    case 'octave-jump': {
      // Root with octave jumps — disco/funk
      const patterns = [
        [root, root, rootLow, root],
        [root, root, fth, root],
        [root, '~', root, '~'],
        [root, root, rootLow, fth],
      ];
      return patterns[Math.floor(Math.random() * patterns.length)].slice(0, steps);
    }

    case 'driving': {
      // Eighth-note drive — trance/syro
      const patterns = [
        [root, root, fth, root],
        [root, root, root, root],
        [root, root, fth, fth],
      ];
      return patterns[Math.floor(Math.random() * patterns.length)].slice(0, steps);
    }

    case 'walking': {
      // Walking bass — scale-based motion: root, passing tone, fifth, approach
      // Classic jazz walking bass line structure
      const patterns = [
        [root, scaleToneAbove(chordRoot, oct), fth, scaleApproach(chordRoot, oct)],
        [root, fth, scaleToneAbove(chordRoot, oct), root],
        [root, scaleToneBelow(chordRoot, oct), fth, root],
        [root, root, scaleToneAbove(chordRoot, oct), fth],
      ];
      return patterns[Math.floor(Math.random() * patterns.length)].slice(0, steps);
    }

    default:
      return new Array(steps).fill(root);
  }
}

/**
 * Check if a mood's bass should follow chord changes.
 */
export function bassFollowsChord(mood: Mood): boolean {
  return MOOD_BASS[mood].followChord;
}

/**
 * Per-mood probability of using bass approach notes.
 * Moods with active bass benefit most; pedal moods don't approach.
 */
const MOOD_APPROACH_PROB: Partial<Record<Mood, number>> = {
  downtempo: 0.35,
  lofi: 0.3,
  trance: 0.4,
  syro: 0.5,
  blockhead: 0.35,
  disco: 0.45,
};

/**
 * Whether the bass should use approach notes toward the next chord.
 *
 * @param mood               Current mood
 * @param ticksSinceChange   Ticks since the last chord change
 * @param hasNextHint        Whether a next chord hint is available
 */
export function shouldBassApproach(
  mood: Mood,
  ticksSinceChange: number,
  hasNextHint: boolean
): boolean {
  if (!hasNextHint) return false;
  if (!MOOD_BASS[mood].followChord) return false;
  // Only approach when we've been on the current chord for at least 2 ticks
  if (ticksSinceChange < 2) return false;
  return Math.random() < (MOOD_APPROACH_PROB[mood] ?? 0);
}

/**
 * Walking bass helpers — scale-tone motion from root.
 */
function scaleToneAbove(root: string, octave: number): string {
  // Major 2nd above root (whole step)
  const pitch = NOTE_TO_PITCH_LOCAL[root];
  if (pitch === undefined) return `${root}${octave}`;
  const above = CHROMATIC_LOCAL[(pitch + 2) % 12];
  return `${above}${octave}`;
}

function scaleToneBelow(root: string, octave: number): string {
  // Major 2nd below root (whole step down)
  const pitch = NOTE_TO_PITCH_LOCAL[root];
  if (pitch === undefined) return `${root}${octave}`;
  const below = CHROMATIC_LOCAL[(pitch + 10) % 12]; // -2 mod 12 = 10
  const belowOct = (pitch - 2 < 0) ? octave - 1 : octave;
  return `${below}${Math.max(1, belowOct)}`;
}

function scaleApproach(root: string, octave: number): string {
  // Chromatic approach from below (half step below root)
  const pitch = NOTE_TO_PITCH_LOCAL[root];
  if (pitch === undefined) return `${root}${octave}`;
  const approach = CHROMATIC_LOCAL[(pitch + 11) % 12]; // -1 mod 12 = 11
  const approachOct = (pitch - 1 < 0) ? octave - 1 : octave;
  return `${approach}${Math.max(1, approachOct)}`;
}

const CHROMATIC_LOCAL = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_TO_PITCH_LOCAL: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

/** Chromatic note names in order. */
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_TO_PITCH: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

/**
 * Generate 1-2 approach notes walking toward the next chord's root.
 * Uses chromatic or scale-step motion from the current root.
 *
 * @param currentRoot  Current chord root (e.g., 'C')
 * @param nextRoot     Next chord root (e.g., 'F')
 * @param octave       Bass octave
 * @returns Array of 1-2 approach note strings, or empty if same root
 */
export function bassApproachNotes(
  currentRoot: string,
  nextRoot: string,
  octave: number
): string[] {
  const fromPitch = NOTE_TO_PITCH[currentRoot];
  const toPitch = NOTE_TO_PITCH[nextRoot];
  if (fromPitch === undefined || toPitch === undefined) return [];
  if (fromPitch === toPitch) return [];

  // Find shortest path direction
  let interval = (toPitch - fromPitch + 12) % 12;
  if (interval > 6) interval -= 12;

  const direction = interval > 0 ? 1 : -1;
  const absInterval = Math.abs(interval);

  if (absInterval <= 2) {
    // Very close — single chromatic step
    const step1 = ((fromPitch + direction + 12) % 12);
    return [`${CHROMATIC[step1]}${octave}`];
  }

  // Two approach notes: walk chromatically from 2 semitones away
  const step1Pitch = ((toPitch - 2 * direction + 12) % 12);
  const step2Pitch = ((toPitch - 1 * direction + 12) % 12);

  // Handle octave wrapping for approach from below
  const step1Oct = (direction > 0 && step1Pitch > toPitch) ? octave - 1 : octave;
  const step2Oct = (direction > 0 && step2Pitch > toPitch) ? octave - 1 : octave;

  return [
    `${CHROMATIC[step1Pitch]}${step1Oct}`,
    `${CHROMATIC[step2Pitch]}${step2Oct}`,
  ];
}
