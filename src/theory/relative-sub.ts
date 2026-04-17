/**
 * Relative chord substitution — replace chords with their relative
 * major/minor equivalent.
 *
 * Every major chord has a relative minor a minor third below, sharing
 * two of three triad tones:
 *
 *   C major (C-E-G) ↔ A minor (A-C-E)   — share C and E
 *   F major (F-A-C) ↔ D minor (D-F-A)   — share F and A
 *   G major (G-B-D) ↔ E minor (E-G-B)   — share G and B
 *
 * This substitution is subtle — it changes the color without drastically
 * altering the harmonic function:
 *   I → vi   (bright → wistful)
 *   IV → ii  (stable → gentle pull)
 *   V → iii  (dominant → mediant, softer)
 *
 * Used extensively in singer-songwriter, jazz, and film music to add
 * emotional nuance without disrupting the progression flow.
 */

import type { Mood, Section, NoteName, ChordQuality } from '../types';
import { noteIndex, noteFromIndex } from './scales';
import { getChordNotesWithOctave } from './chords';

/** Per-mood probability of relative substitution */
const REL_SUB_PROB: Record<Mood, number> = {
  lofi:      0.18,   // jazz — loves subtle color changes
  downtempo: 0.15,   // smooth — elegant reharmonization
  flim:      0.15,   // delicate — emotional nuance
  avril:     0.12,   // intimate — wistful color
  blockhead: 0.10,   // hip-hop — some color
  xtal:      0.10,   // dreamy — occasional
  disco:     0.06,   // funk — mostly stays on degree
  syro:      0.08,   // IDM — some surprise
  trance:    0.03,   // driving — prefer strong harmony
  ambient:   0.05,   // subtle — very occasional color,
  plantasia: 0.05,
};

/** Section multiplier */
const SECTION_MULT: Record<Section, number> = {
  groove:    1.0,    // settled — nice context for color
  build:     0.7,    // building — less substitution
  peak:      0.4,    // intense — keep function clear
  breakdown: 1.3,    // reflective — great time for relative sub
  intro:     0.6,    // establishing — some color OK
};

/**
 * Get the relative substitute for a chord.
 * Major → relative minor (root down 3 semitones, quality → min/min7)
 * Minor → relative major (root up 3 semitones, quality → maj/maj7)
 *
 * @param root     Original chord root
 * @param quality  Original chord quality
 * @returns { root, quality } of the relative substitute
 */
export function relativeSubstitute(
  root: NoteName,
  quality: ChordQuality
): { root: NoteName; quality: ChordQuality } {
  const rootIdx = noteIndex(root);

  if (quality === 'maj' || quality === 'maj7' || quality === 'add9') {
    // Major → relative minor (down 3 semitones)
    return {
      root: noteFromIndex(rootIdx - 3),
      quality: quality === 'maj7' ? 'min7' : 'min',
    };
  }

  if (quality === 'min' || quality === 'min7' || quality === 'min9') {
    // Minor → relative major (up 3 semitones)
    return {
      root: noteFromIndex(rootIdx + 3),
      quality: quality === 'min7' ? 'maj7' : 'maj',
    };
  }

  // Don't substitute dom7, dim, aug, sus — they have special function
  return { root, quality };
}

/**
 * Whether to apply relative substitution.
 * Only applies to major and minor chords (not dominant, diminished, etc.)
 * Skips degree 4 (V) to preserve dominant function.
 *
 * @param degree   Chord degree (0-6)
 * @param quality  Chord quality
 * @param mood     Current mood
 * @param section  Current section
 */
export function shouldApplyRelativeSub(
  degree: number,
  quality: ChordQuality,
  mood: Mood,
  section: Section
): boolean {
  // Only substitute major/minor triads and 7ths
  const isSubstitutable = ['maj', 'min', 'maj7', 'min7'].includes(quality);
  if (!isSubstitutable) return false;

  // Don't substitute the dominant (V) — it needs its resolution function
  if (degree === 4) return false;

  const prob = REL_SUB_PROB[mood] * SECTION_MULT[section];
  return Math.random() < prob;
}

/**
 * Build the full chord state for a relative substitution.
 *
 * @param originalRoot    Original chord root
 * @param originalQuality Original chord quality
 * @param octave          Base octave
 */
export function relativeSubChord(
  originalRoot: NoteName,
  originalQuality: ChordQuality,
  octave: number
): { root: NoteName; quality: ChordQuality; notes: string[] } {
  const sub = relativeSubstitute(originalRoot, originalQuality);
  return {
    root: sub.root,
    quality: sub.quality,
    notes: getChordNotesWithOctave(sub.root, sub.quality, octave),
  };
}

/**
 * Get the relative sub probability for a mood (for testing).
 */
export function relativeSubProbability(mood: Mood): number {
  return REL_SUB_PROB[mood];
}
