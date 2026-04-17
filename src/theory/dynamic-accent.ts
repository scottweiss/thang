/**
 * Dynamic accent — gain emphasis on structurally important notes.
 *
 * Beyond metric accent (which emphasizes beat positions), dynamic
 * accent emphasizes notes that are *musically* important: leap
 * arrivals, highest/lowest notes, syncopated entries, notes after
 * rests. These accents create natural expressiveness.
 *
 * Applied as gain multipliers to specific notes in a phrase.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood accent depth.
 * Higher = more dynamic contrast between accented and unaccented notes.
 */
const ACCENT_DEPTH: Record<Mood, number> = {
  trance:    0.15,  // subtle contrast
  avril:     0.45,  // strong classical dynamics
  disco:     0.25,  // groove accent
  downtempo: 0.30,  // moderate
  blockhead: 0.35,  // choppy accents
  lofi:      0.40,  // jazz dynamics
  flim:      0.38,  // organic expression
  xtal:      0.20,  // gentle accents
  syro:      0.25,  // controlled contrast
  ambient:   0.10,  // barely accented,
  plantasia: 0.10,
};

const NOTE_PC: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

/**
 * Calculate per-note accent multipliers for a phrase.
 *
 * @param elements Note elements (notes and rests)
 * @param mood Current mood
 * @returns Array of gain multipliers (same length as elements)
 */
export function dynamicAccents(elements: string[], mood: Mood): number[] {
  const depth = ACCENT_DEPTH[mood];
  const accents = new Array(elements.length).fill(1.0);

  // Convert to MIDI for analysis
  const midis: (number | null)[] = elements.map(e => {
    if (e === '~') return null;
    const name = e.replace(/\d+$/, '');
    const oct = parseInt(e.match(/\d+$/)?.[0] ?? '4');
    const pc = NOTE_PC[name];
    return pc !== undefined ? pc + oct * 12 : null;
  });

  // Find highest and lowest notes
  const validMidis = midis.filter((m): m is number => m !== null);
  if (validMidis.length < 2) return accents;
  const highest = Math.max(...validMidis);
  const lowest = Math.min(...validMidis);

  for (let i = 0; i < elements.length; i++) {
    if (midis[i] === null) continue;
    let accent = 0;

    // Highest note in phrase
    if (midis[i] === highest) accent += 0.4;
    // Lowest note in phrase
    if (midis[i] === lowest) accent += 0.2;

    // Note after rest (re-entry)
    if (i > 0 && elements[i - 1] === '~') accent += 0.3;

    // Leap arrival (interval >= 5 semitones)
    if (i > 0 && midis[i - 1] !== null) {
      const interval = Math.abs(midis[i]! - midis[i - 1]!);
      if (interval >= 5) accent += 0.25;
    }

    accents[i] = 1.0 + accent * depth;
  }

  return accents;
}

/**
 * Should dynamic accenting be applied?
 */
export function shouldApplyDynamicAccent(mood: Mood): boolean {
  return ACCENT_DEPTH[mood] > 0.12;
}

/**
 * Get accent depth for a mood (for testing).
 */
export function accentDepth(mood: Mood): number {
  return ACCENT_DEPTH[mood];
}
