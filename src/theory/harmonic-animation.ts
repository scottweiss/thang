/**
 * Harmonic animation — inner voice movement within held chords.
 *
 * Real pianists don't play block chords and hold them static.
 * They add subtle motion: neighbor tones (step away and back),
 * passing tones (stepping between chord tones), and suspensions.
 *
 * This module generates animated chord patterns where inner voices
 * move while outer voices (root, top note) stay anchored.
 */

import type { Mood, Section, NoteName } from '../types';
import { noteIndex, noteFromIndex } from './scales';

/**
 * Animate a chord voicing by moving an inner voice to a neighbor tone.
 * Creates a pattern like [C E G] → [C F G] → [C E G] (E→F→E neighbor).
 *
 * @param chordNotes  Current chord voicing (e.g., ['C3', 'E3', 'G3', 'Bb3'])
 * @param scaleNotes  Scale notes for diatonic neighbors
 * @param steps       Number of animation steps (typically 4 or 8)
 * @returns Array of voicing arrays, one per step
 */
export function animateChordVoicing(
  chordNotes: string[],
  scaleNotes: string[],
  steps: number
): string[][] {
  if (chordNotes.length < 3 || steps <= 1) {
    return new Array(steps).fill(chordNotes);
  }

  // Pick an inner voice to animate (not root or highest note)
  const innerIndices = [];
  for (let i = 1; i < chordNotes.length - 1; i++) {
    innerIndices.push(i);
  }
  if (innerIndices.length === 0) {
    // Only 2 notes or less — can't animate inner voice, use root neighbor
    return new Array(steps).fill(chordNotes);
  }

  const voiceIdx = innerIndices[Math.floor(Math.random() * innerIndices.length)];
  const targetNote = chordNotes[voiceIdx];

  // Find neighbor tone (step up or down within scale)
  const neighbor = findScaleNeighbor(targetNote, scaleNotes);
  if (!neighbor) return new Array(steps).fill(chordNotes);

  // Create animation: chord → neighbor → chord → chord (or variations)
  const result: string[][] = [];
  for (let i = 0; i < steps; i++) {
    const voicing = [...chordNotes];
    // Move to neighbor on specific beats (e.g., beat 2 and 6 in 8-step)
    const phase = i % (steps <= 4 ? 4 : 8);
    if (phase === 1 || phase === 5) {
      voicing[voiceIdx] = neighbor;
    }
    result.push(voicing);
  }

  return result;
}

/**
 * Find the nearest scale neighbor (upper or lower) for a note.
 */
export function findScaleNeighbor(
  note: string,
  scaleNotes: string[]
): string | null {
  const match = note.match(/^([A-Gb#]+)(\d)$/);
  if (!match) return null;

  const noteName = match[1] as NoteName;
  const octave = parseInt(match[2]);
  const pitch = noteIndex(noteName) + octave * 12;

  // Build pitch set from scale notes
  const scalePitchClasses = scaleNotes.map(n => noteIndex(n as NoteName));

  // Search both up and down for nearest scale neighbor
  let upPitch: number | null = null;
  let downPitch: number | null = null;

  for (let offset = 1; offset <= 3; offset++) {
    if (upPitch === null) {
      const cp = pitch + offset;
      if (scalePitchClasses.includes(cp % 12)) upPitch = cp;
    }
    if (downPitch === null) {
      const cp = pitch - offset;
      if (cp >= 0 && scalePitchClasses.includes(((cp % 12) + 12) % 12)) downPitch = cp;
    }
    if (upPitch !== null && downPitch !== null) break;
  }

  // Pick the nearest; slight upward bias when equidistant (upper neighbors lead)
  let chosen: number | null = null;
  if (upPitch !== null && downPitch !== null) {
    const upDist = upPitch - pitch;
    const downDist = pitch - downPitch;
    if (upDist < downDist) chosen = upPitch;
    else if (downDist < upDist) chosen = downPitch;
    else chosen = Math.random() < 0.6 ? upPitch : downPitch;
  } else {
    chosen = upPitch ?? downPitch;
  }

  if (chosen === null) return null;

  const chosenPC = ((chosen % 12) + 12) % 12;
  const chosenOct = Math.floor(chosen / 12);
  return `${noteFromIndex(chosenPC)}${chosenOct}`;
}

/**
 * Convert animated voicings to a Strudel note pattern.
 * Each step's voicing is wrapped in brackets for simultaneous notes.
 *
 * @param voicings  Array of voicing arrays from animateChordVoicing
 * @returns Strudel note pattern string
 */
export function voicingsToPattern(voicings: string[][]): string {
  return voicings
    .map(v => {
      // Guard against empty voicings — empty brackets `[]` crash Strudel's parser
      if (v.length === 0) return '~';
      if (v.length === 1) return v[0];
      return `[${v.join(',')}]`;
    })
    .join(' ');
}

/**
 * Should harmonic animation be applied in this context?
 */
export function shouldAnimateHarmony(
  mood: Mood,
  section: Section
): boolean {
  const prob = animationProbability(mood, section);
  return Math.random() < prob;
}

/**
 * Probability of harmonic animation.
 */
export function animationProbability(
  mood: Mood,
  section: Section
): number {
  const moodBase = MOOD_ANIMATION[mood];
  if (moodBase === 0) return 0;
  const sectionMult = SECTION_ANIMATION[section];
  return Math.min(0.5, moodBase * sectionMult);
}

/** Per-mood base probability of harmonic animation */
const MOOD_ANIMATION: Record<Mood, number> = {
  lofi:      0.30,   // Rhodes-style inner voice movement
  downtempo: 0.25,   // gentle motion
  avril:     0.20,   // intimate, piano-like
  flim:      0.20,   // delicate animation
  blockhead: 0.15,   // jazzy
  xtal:      0.15,   // dreamy motion
  disco:     0.10,   // string pads can move
  syro:      0.10,   // occasional complexity
  trance:    0.05,   // mostly static pads
  ambient:   0.0,    // static washes
};

/** Section multiplier */
const SECTION_ANIMATION: Record<Section, number> = {
  groove:    1.2,    // settled — room for decoration
  breakdown: 1.0,    // space for inner voice detail
  build:     0.7,    // building — less decoration
  intro:     0.8,    // establishing — some motion
  peak:      0.5,    // too busy — keep harmony simple
};
