/**
 * Tessitura — the energetic quality of a voice's register position.
 *
 * In vocal and instrumental writing, where a line sits within its
 * total range has enormous expressive impact:
 *
 * - **High tessitura**: brightness, tension, effort, climax
 *   (think soprano at the top of her range — thrilling but strained)
 * - **Middle tessitura**: comfort, naturalness, clarity
 * - **Low tessitura**: weight, warmth, gravity, intimacy
 *
 * Verdi calculated tessitura precisely — his arias spend most time
 * in the middle range, rising to the top only at climactic moments.
 * This makes those high notes feel earned and dramatic.
 *
 * Application: the melody layer adjusts its gain and brightness
 * based on where the current notes sit within the layer's range.
 * High tessitura notes get a slight brightness boost (effort),
 * while low tessitura notes get warmth (more reverb, less FM).
 * This creates the natural "effort" that makes high passages
 * sound intense and low passages sound intimate.
 */

import type { Mood } from '../types';

/** How sensitive each mood is to tessitura-based expression (0-1) */
const TESSITURA_SENSITIVITY: Record<Mood, number> = {
  avril:     0.55,  // singer — tessitura is everything
  xtal:      0.45,  // expressive range
  flim:      0.40,  // organic expression
  ambient:   0.35,  // spacious, range matters
  lofi:      0.30,  // jazzy expression
  downtempo: 0.25,  // moderate
  blockhead: 0.18,  // less melodic focus
  syro:      0.15,  // technical, less expressive
  disco:     0.10,  // loops stay in range
  trance:    0.08,  // driving, consistent
};

/**
 * Calculate the tessitura position (0-1) of a note within a range.
 * 0 = lowest, 0.5 = middle, 1 = highest.
 *
 * @param noteName   Note with octave (e.g., 'C4')
 * @param lowNote    Lowest note in range (e.g., 'C3')
 * @param highNote   Highest note in range (e.g., 'C6')
 * @returns Position 0-1
 */
export function tessituraPosition(
  noteName: string,
  lowNote: string,
  highNote: string
): number {
  const toMidi = (n: string): number | null => {
    const m = n.match(/^([A-G](?:b|#)?)(\d+)$/);
    if (!m) return null;
    const NOTE_PC: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
    };
    const pc = NOTE_PC[m[1]];
    if (pc === undefined) return null;
    return parseInt(m[2]) * 12 + pc;
  };

  const midi = toMidi(noteName);
  const low = toMidi(lowNote);
  const high = toMidi(highNote);
  if (midi === null || low === null || high === null) return 0.5;
  if (high <= low) return 0.5;

  return Math.max(0, Math.min(1, (midi - low) / (high - low)));
}

/**
 * Calculate average tessitura position for a phrase.
 *
 * @param notes     Array of note names (rests excluded)
 * @param lowNote   Range bottom
 * @param highNote  Range top
 * @returns Average position 0-1
 */
export function phraseTestitura(
  notes: string[],
  lowNote: string,
  highNote: string
): number {
  const positions = notes
    .filter(n => n !== '~')
    .map(n => tessituraPosition(n, lowNote, highNote));
  if (positions.length === 0) return 0.5;
  return positions.reduce((a, b) => a + b, 0) / positions.length;
}

/**
 * Calculate gain adjustment based on tessitura.
 * High tessitura = slight boost (effort/projection).
 * Low tessitura = slight reduction (intimacy/warmth).
 *
 * @param position    Tessitura position 0-1
 * @param sensitivity Mood sensitivity 0-1
 * @returns Gain multiplier (0.85 - 1.15)
 */
export function tessituraGain(position: number, sensitivity: number): number {
  // Linear mapping: 0.5 = neutral, 1.0 = +sensitivity*0.15 boost, 0.0 = -sensitivity*0.15 dip
  const deviation = (position - 0.5) * 2; // -1 to +1
  return 1.0 + deviation * sensitivity * 0.15;
}

/**
 * Calculate brightness (LPF) adjustment based on tessitura.
 * High tessitura = brighter. Low tessitura = darker.
 *
 * @param position    Tessitura position 0-1
 * @param sensitivity Mood sensitivity
 * @returns LPF multiplier (0.85 - 1.2)
 */
export function tessituraBrightness(position: number, sensitivity: number): number {
  const deviation = (position - 0.5) * 2;
  return 1.0 + deviation * sensitivity * 0.2;
}

/**
 * Calculate reverb adjustment based on tessitura.
 * Low tessitura = more reverb (warmth). High = less (clarity).
 *
 * @param position    Tessitura position 0-1
 * @param sensitivity Mood sensitivity
 * @returns Reverb multiplier (0.8 - 1.3)
 */
export function tessituraReverb(position: number, sensitivity: number): number {
  const deviation = (position - 0.5) * 2;
  // Inverse: low position = more reverb
  return 1.0 - deviation * sensitivity * 0.25;
}

/**
 * Generate per-note gain multipliers based on tessitura position.
 *
 * @param notes       Note array (may contain rests)
 * @param lowNote     Range bottom
 * @param highNote    Range top
 * @param mood        Current mood
 * @returns Array of gain multipliers (same length as notes)
 */
export function tessituraGainMap(
  notes: string[],
  lowNote: string,
  highNote: string,
  mood: Mood
): number[] {
  const sensitivity = TESSITURA_SENSITIVITY[mood];
  return notes.map(note => {
    if (note === '~') return 1.0;
    const pos = tessituraPosition(note, lowNote, highNote);
    return tessituraGain(pos, sensitivity);
  });
}

/**
 * Get tessitura sensitivity for a mood (for testing).
 */
export function tessituraSensitivity(mood: Mood): number {
  return TESSITURA_SENSITIVITY[mood];
}
