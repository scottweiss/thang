/**
 * Tintinnabuli — Arvo Pärt's bell-like compositional technique.
 *
 * In Pärt's tintinnabuli system, two voices are inseparable:
 * - **M-voice** (melodic): moves stepwise through the scale
 * - **T-voice** (tintinnabuli): sounds only notes of the tonic triad
 *
 * The T-voice selects the nearest triad tone to the M-voice note,
 * creating a shimmering, bell-like consonance. The result is
 * simultaneously simple and profound — sparse textures that glow
 * with overtones.
 *
 * Types of T-voice positioning relative to M-voice:
 * - **1st position superior**: nearest triad tone ABOVE the M-voice
 * - **1st position inferior**: nearest triad tone BELOW the M-voice
 * - **2nd position superior**: second-nearest triad tone ABOVE
 * - **2nd position inferior**: second-nearest triad tone BELOW
 *
 * Application: during ambient/xtal/flim breakdowns, the arp layer
 * can become a T-voice that shadows the melody's stepwise motion,
 * creating Pärt's characteristic luminous stillness. The harmony
 * layer can also use tintinnabuli voicings for transparent textures.
 */

import type { Mood, Section } from '../types';

/** How much each mood uses tintinnabuli technique (0-1) */
const TINTINNABULI_TENDENCY: Record<Mood, number> = {
  xtal:      0.35,  // ethereal — Pärt's natural home
  ambient:   0.30,  // pure, meditative
  flim:      0.22,  // gentle, organic
  avril:     0.18,  // songwriter — sparse beauty
  downtempo: 0.12,  // subtle stillness
  lofi:      0.08,  // jazz — different aesthetic
  syro:      0.05,  // IDM — too busy usually
  blockhead: 0.03,  // hip-hop — rarely fits
  disco:     0.02,  // dance — rarely fits
  trance:    0.02,  // driving — rarely fits
};

/** Section multipliers */
const SECTION_TINTINNABULI_MULT: Record<Section, number> = {
  intro:     1.5,   // perfect for sparse openings
  build:     0.4,   // too sparse for builds
  peak:      0.2,   // too sparse for peaks
  breakdown: 2.0,   // perfect — stillness after intensity
  groove:    0.8,   // moderate
};

const NOTE_TO_PC: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};
const PC_TO_NOTE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export type TPosition = '1sup' | '1inf' | '2sup' | '2inf';

/**
 * Get tonic triad pitch classes for a given root.
 * Returns [root, major third, perfect fifth] in pitch-class numbers.
 *
 * @param root      Scale root note name
 * @param quality   'maj' or 'min' triad
 * @returns Array of 3 pitch classes
 */
export function tonicTriadPCs(root: string, quality: 'maj' | 'min'): number[] {
  const rootPC = NOTE_TO_PC[root];
  if (rootPC === undefined) return [0, 4, 7]; // fallback C major
  const third = quality === 'maj' ? 4 : 3;
  return [rootPC, (rootPC + third) % 12, (rootPC + 7) % 12];
}

/**
 * Find the nearest tonic triad tone to a given pitch.
 *
 * @param noteName  The M-voice note (e.g., 'D4')
 * @param triadPCs  Pitch classes of the tonic triad
 * @param position  T-voice positioning rule
 * @returns The T-voice note name with octave
 */
export function nearestTriadTone(
  noteName: string,
  triadPCs: number[],
  position: TPosition = '1sup'
): string {
  if (noteName === '~') return '~';
  const match = noteName.match(/^([A-G](?:b|#)?)(\d+)$/);
  if (!match) return noteName;

  const pc = NOTE_TO_PC[match[1]];
  if (pc === undefined) return noteName;
  const oct = parseInt(match[2]);
  const midiApprox = oct * 12 + pc;

  // Build all triad tones in nearby octaves
  const candidates: { note: string; midi: number }[] = [];
  for (let o = Math.max(1, oct - 2); o <= Math.min(7, oct + 2); o++) {
    for (const tpc of triadPCs) {
      candidates.push({
        note: `${PC_TO_NOTE[tpc]}${o}`,
        midi: o * 12 + tpc,
      });
    }
  }

  // Sort by distance from M-voice, then filter by position rule
  candidates.sort((a, b) => Math.abs(a.midi - midiApprox) - Math.abs(b.midi - midiApprox));

  let filtered: typeof candidates;
  switch (position) {
    case '1sup':
      filtered = candidates.filter(c => c.midi > midiApprox);
      return filtered.length > 0 ? filtered[0].note : candidates[0].note;
    case '1inf':
      filtered = candidates.filter(c => c.midi < midiApprox);
      return filtered.length > 0 ? filtered[0].note : candidates[0].note;
    case '2sup':
      filtered = candidates.filter(c => c.midi > midiApprox);
      return filtered.length > 1 ? filtered[1].note : (filtered[0]?.note ?? candidates[0].note);
    case '2inf':
      filtered = candidates.filter(c => c.midi < midiApprox);
      return filtered.length > 1 ? filtered[1].note : (filtered[0]?.note ?? candidates[0].note);
  }
}

/**
 * Generate a T-voice (tintinnabuli voice) from an M-voice melody.
 * Each M-voice note gets a corresponding triad tone.
 *
 * @param mVoice     Melody notes (M-voice)
 * @param root       Scale root
 * @param quality    'maj' or 'min'
 * @param position   T-voice positioning
 * @returns T-voice notes array (same length as mVoice)
 */
export function generateTVoice(
  mVoice: string[],
  root: string,
  quality: 'maj' | 'min',
  position: TPosition = '1sup'
): string[] {
  const triadPCs = tonicTriadPCs(root, quality);
  return mVoice.map(note => nearestTriadTone(note, triadPCs, position));
}

/**
 * Select T-voice position based on mood and section.
 * Superior positions sound brighter, inferior darker.
 */
export function selectPosition(
  mood: Mood,
  section: Section,
  tick: number
): TPosition {
  const positions: Record<Mood, TPosition[]> = {
    xtal:      ['1sup', '2sup', '1inf'],       // bright, open
    ambient:   ['1sup', '1inf', '2inf'],        // equal bright/dark
    flim:      ['1inf', '1sup', '2inf'],        // darker lean
    avril:     ['1sup', '1inf'],                // simple
    downtempo: ['1inf', '2inf', '1sup'],        // warm, low
    lofi:      ['1inf', '1sup'],                // balanced
    syro:      ['2sup', '2inf', '1sup', '1inf'], // wider, more variety
    blockhead: ['1inf', '1sup'],                // simple
    disco:     ['1sup'],                        // bright
    trance:    ['1sup'],                        // bright
  };

  // Breakdowns favor inferior (darker, more introspective)
  const pool = section === 'breakdown'
    ? positions[mood].filter(p => p.includes('inf')).concat(positions[mood].slice(0, 1))
    : positions[mood];

  const hash = ((tick * 65537 + 23003) >>> 0) % pool.length;
  return pool[hash];
}

/**
 * Whether to apply tintinnabuli at this moment.
 */
export function shouldApplyTintinnabuli(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = TINTINNABULI_TENDENCY[mood] * (SECTION_TINTINNABULI_MULT[section] ?? 1.0);
  const hash = ((tick * 2654435761 + 21379) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Get tintinnabuli tendency for a mood (for testing).
 */
export function tintinnabuliTendency(mood: Mood): number {
  return TINTINNABULI_TENDENCY[mood];
}
