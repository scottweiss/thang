/**
 * Voice spacing optimization — ensure chord voicings have good
 * intervallic spacing between adjacent voices.
 *
 * In orchestration, the "rule of thumb" is that lower voices need
 * wider spacing (following the harmonic series) while upper voices
 * can be closer together. Violating this creates "mud" in the low
 * register or "thin" sound in the high register.
 *
 * This module analyzes and adjusts voicing spacing:
 * - Minimum spacing in low register (below C3): major 3rd (4 semitones)
 * - Close spacing acceptable in mid-upper register (C4+)
 * - Maximum gap between adjacent voices: octave (12 semitones)
 *
 * Different moods prefer different spacing widths:
 * - Ambient/xtal: wide, open spacing (orchestral)
 * - Jazz (lofi): close voicings (rootless, drop-2 clusters)
 * - Trance: medium spacing (power chord feel)
 */

import type { Mood } from '../types';

/** Minimum semitones between adjacent voices in the low register (below C3) */
const LOW_REGISTER_MIN_SPACING = 4; // major 3rd

/** Minimum semitones between adjacent voices in mid register (C3-C4) */
const MID_REGISTER_MIN_SPACING = 3; // minor 3rd

/** Maximum semitones between any adjacent voices */
const MAX_ADJACENT_GAP = 14; // major 9th + 1

/** Preferred spacing width per mood (multiplier on defaults) */
const SPACING_PREFERENCE: Record<Mood, number> = {
  ambient:   1.4,   // wide, open,
  plantasia: 1.4,
  xtal:      1.3,   // wide, dreamy
  flim:      1.1,   // slightly open
  avril:     1.0,   // balanced
  downtempo: 0.95,  // slightly close
  lofi:      0.85,  // close jazz voicings
  blockhead: 0.90,  // moderate
  disco:     0.95,  // moderate
  syro:      0.80,  // tight clusters OK
  trance:    1.05,  // medium power
};

/**
 * Analyze the spacing quality of a voicing.
 * Returns a score from 0 (poor) to 1 (ideal).
 *
 * @param notes  Chord notes with octave (e.g., ['C3', 'E3', 'G3', 'B3'])
 * @param mood   Current mood
 * @returns Spacing quality score 0-1
 */
export function spacingQuality(notes: string[], mood: Mood): number {
  if (notes.length < 2) return 1.0;

  const midis = notes.map(noteToMidi).filter(m => m >= 0).sort((a, b) => a - b);
  if (midis.length < 2) return 1.0;

  const pref = SPACING_PREFERENCE[mood];
  let totalPenalty = 0;
  let pairs = 0;

  for (let i = 0; i < midis.length - 1; i++) {
    const gap = midis[i + 1] - midis[i];
    const lowestNote = midis[i];

    // Determine minimum spacing based on register
    let minSpacing: number;
    if (lowestNote < 48) { // below C3
      minSpacing = Math.round(LOW_REGISTER_MIN_SPACING * pref);
    } else if (lowestNote < 60) { // C3-C4
      minSpacing = Math.round(MID_REGISTER_MIN_SPACING * pref);
    } else {
      minSpacing = 1; // high register allows close spacing
    }

    // Penalty for too-close spacing
    if (gap < minSpacing) {
      totalPenalty += (minSpacing - gap) / minSpacing;
    }

    // Penalty for too-wide gaps
    if (gap > MAX_ADJACENT_GAP) {
      totalPenalty += (gap - MAX_ADJACENT_GAP) / 12;
    }

    pairs++;
  }

  return Math.max(0, 1 - (pairs > 0 ? totalPenalty / pairs : 0));
}

/**
 * Suggest octave adjustments to improve voicing spacing.
 * Returns an array of octave shifts for each note (0 = no change).
 *
 * @param notes  Chord notes with octave
 * @param mood   Current mood
 * @returns Array of octave adjustments (same length as notes)
 */
export function suggestSpacingFix(notes: string[], mood: Mood): number[] {
  if (notes.length < 2) return notes.map(() => 0);

  const midis = notes.map(noteToMidi);
  const shifts = notes.map(() => 0);

  // Sort indices by pitch
  const indices = midis
    .map((m, i) => ({ midi: m, idx: i }))
    .filter(x => x.midi >= 0)
    .sort((a, b) => a.midi - b.midi);

  if (indices.length < 2) return shifts;

  const pref = SPACING_PREFERENCE[mood];

  // Check adjacent pairs and fix spacing violations
  for (let i = 0; i < indices.length - 1; i++) {
    const lower = indices[i];
    const upper = indices[i + 1];
    const gap = upper.midi - lower.midi;

    // Determine minimum spacing for this register
    let minSpacing: number;
    if (lower.midi < 48) {
      minSpacing = Math.round(LOW_REGISTER_MIN_SPACING * pref);
    } else if (lower.midi < 60) {
      minSpacing = Math.round(MID_REGISTER_MIN_SPACING * pref);
    } else {
      minSpacing = 1;
    }

    // Too close: shift upper voice up an octave
    if (gap < minSpacing && gap > 0) {
      shifts[upper.idx] += 1;
    }

    // Too wide: shift upper voice down an octave (if it wouldn't go too low)
    if (gap > MAX_ADJACENT_GAP && upper.midi - 12 > lower.midi + minSpacing) {
      shifts[upper.idx] -= 1;
    }
  }

  return shifts;
}

/**
 * Apply spacing fixes to a set of notes.
 *
 * @param notes  Chord notes with octave
 * @param mood   Current mood
 * @returns Adjusted notes with better spacing
 */
export function applySpacingOptimization(notes: string[], mood: Mood): string[] {
  const quality = spacingQuality(notes, mood);
  // Only fix if quality is poor
  if (quality > 0.7) return notes;

  const shifts = suggestSpacingFix(notes, mood);
  return notes.map((note, i) => {
    if (shifts[i] === 0) return note;
    const match = note.match(/^([A-G](?:b|#)?)(\d+)$/);
    if (!match) return note;
    const [, name, octStr] = match;
    const newOct = Math.max(1, Math.min(7, parseInt(octStr) + shifts[i]));
    return `${name}${newOct}`;
  });
}

/**
 * Get the spacing preference for a mood (for testing).
 */
export function moodSpacingPreference(mood: Mood): number {
  return SPACING_PREFERENCE[mood];
}

/** Convert note name to MIDI number */
function noteToMidi(note: string): number {
  const match = note.match(/^([A-G])(b|#)?(\d+)$/);
  if (!match) return -1;
  const [, name, accidental, octStr] = match;
  const baseMap: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  };
  let midi = baseMap[name] ?? 0;
  if (accidental === '#') midi++;
  if (accidental === 'b') midi--;
  return midi + (parseInt(octStr) + 1) * 12;
}
