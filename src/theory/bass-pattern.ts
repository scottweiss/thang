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
  lofi:      { style: 'root-fifth',  octave: 2, followChord: true },
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

    case 'walking':
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
