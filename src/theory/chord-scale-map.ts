/**
 * Chord-scale mapping — choose the best scale mode for each chord.
 *
 * Jazz theory teaches that each chord implies its own scale (mode):
 *   - ii min7 in C major → D dorian
 *   - V dom7 in C major → G mixolydian
 *   - IV maj7 in C major → F lydian
 *   - iii min7 in C major → E phrygian
 *
 * This module maps chord degree + quality to the most characteristic
 * scale mode, then returns the available tensions (color tones) that
 * are safe to use over that chord. This gives melody and arp layers
 * access to richer note choices that match the underlying harmony.
 *
 * The effect is subtle but crucial: a melody playing over a ii-V-I
 * will naturally gravitate toward dorian sounds on the ii, mixolydian
 * on the V, and ionian on the I — just like a jazz musician would.
 */

import type { ChordQuality, Mood } from '../types';

/**
 * Scale degree offsets (semitones from chord root) for each mode.
 * These define which notes are "available" over a given chord.
 */
export interface ChordScaleInfo {
  /** Name of the mode (for debug/display) */
  modeName: string;
  /** Available tensions (semitones from root) beyond basic chord tones */
  availableTensions: number[];
  /** Avoid notes — semitones from root that clash with the chord */
  avoidNotes: number[];
}

/**
 * Get the best scale mode for a chord based on its degree and quality.
 *
 * @param degree  Scale degree (0-6, where 0 = tonic)
 * @param quality Chord quality
 * @param scaleType  Parent scale type ('major' or 'minor' family)
 * @returns Chord-scale information
 */
export function chordScaleInfo(
  degree: number,
  quality: ChordQuality,
  scaleType: string
): ChordScaleInfo {
  const isMinor = scaleType === 'minor' || scaleType === 'aeolian' || scaleType === 'dorian';

  if (isMinor) {
    return MINOR_CHORD_SCALES[degree % 7] ?? DEFAULT_SCALE;
  }
  return MAJOR_CHORD_SCALES[degree % 7] ?? DEFAULT_SCALE;
}

/**
 * Get available color tones for a chord — notes that add color without clashing.
 * Returns semitone offsets from the chord root.
 *
 * @param degree   Scale degree (0-6)
 * @param quality  Chord quality
 * @param scaleType Parent scale type
 * @returns Array of semitone offsets that are safe tensions
 */
export function chordColorTones(
  degree: number,
  quality: ChordQuality,
  scaleType: string
): number[] {
  const info = chordScaleInfo(degree, quality, scaleType);
  return info.availableTensions;
}

/**
 * Check if a semitone offset from chord root is an avoid note.
 */
export function isAvoidNote(
  semitoneFromRoot: number,
  degree: number,
  quality: ChordQuality,
  scaleType: string
): boolean {
  const info = chordScaleInfo(degree, quality, scaleType);
  const normalized = ((semitoneFromRoot % 12) + 12) % 12;
  return info.avoidNotes.includes(normalized);
}

/**
 * How strongly chord-scale mapping should influence note selection.
 * Higher = more modal/jazz, lower = more diatonic/simple.
 */
export function chordScaleStrength(mood: Mood): number {
  return MOOD_CHORD_SCALE_STRENGTH[mood];
}

/**
 * Whether chord-scale mapping should be applied at all.
 */
export function shouldApplyChordScale(mood: Mood): boolean {
  return MOOD_CHORD_SCALE_STRENGTH[mood] >= 0.1;
}

// Major key chord-scale mapping (degree → mode)
const MAJOR_CHORD_SCALES: Record<number, ChordScaleInfo> = {
  0: { // I — Ionian
    modeName: 'ionian',
    availableTensions: [2, 9, 14],  // 9th, 6th (13th)
    avoidNotes: [5],                // 4th (avoid on major)
  },
  1: { // ii — Dorian
    modeName: 'dorian',
    availableTensions: [2, 5, 9],   // 9th, 11th, natural 6th (13th)
    avoidNotes: [],                 // dorian has no avoid notes
  },
  2: { // iii — Phrygian
    modeName: 'phrygian',
    availableTensions: [5],         // 11th
    avoidNotes: [1, 8],            // b9, b13 (avoid notes in phrygian)
  },
  3: { // IV — Lydian
    modeName: 'lydian',
    availableTensions: [2, 6, 9],   // 9th, #11th, 13th
    avoidNotes: [],                 // lydian has no avoid notes (!)
  },
  4: { // V — Mixolydian
    modeName: 'mixolydian',
    availableTensions: [2, 9],      // 9th, 13th
    avoidNotes: [5],                // 4th (avoid on dominant)
  },
  5: { // vi — Aeolian
    modeName: 'aeolian',
    availableTensions: [2, 5],      // 9th, 11th
    avoidNotes: [8],                // b13 (avoid in aeolian)
  },
  6: { // vii° — Locrian
    modeName: 'locrian',
    availableTensions: [5, 10],     // 11th, b7
    avoidNotes: [1],                // b9 (avoid in locrian)
  },
};

// Minor key chord-scale mapping (degree → mode)
const MINOR_CHORD_SCALES: Record<number, ChordScaleInfo> = {
  0: { // i — Aeolian (natural minor)
    modeName: 'aeolian',
    availableTensions: [2, 5],      // 9th, 11th
    avoidNotes: [8],                // b6 functions as avoid on tonic minor
  },
  1: { // ii° — Locrian
    modeName: 'locrian',
    availableTensions: [5, 10],     // 11th, b7
    avoidNotes: [1],                // b9
  },
  2: { // III — Ionian (relative major)
    modeName: 'ionian',
    availableTensions: [2, 9],      // 9th, 13th
    avoidNotes: [5],                // 4th
  },
  3: { // iv — Dorian
    modeName: 'dorian',
    availableTensions: [2, 5, 9],   // 9th, 11th, natural 6th
    avoidNotes: [],
  },
  4: { // v (or V) — Mixolydian/Phrygian dominant
    modeName: 'mixolydian',
    availableTensions: [2, 9],      // 9th, 13th
    avoidNotes: [5],                // 4th
  },
  5: { // VI — Lydian
    modeName: 'lydian',
    availableTensions: [2, 6, 9],   // 9th, #11th, 13th
    avoidNotes: [],
  },
  6: { // VII — Mixolydian
    modeName: 'mixolydian',
    availableTensions: [2, 9],      // 9th, 13th
    avoidNotes: [5],
  },
};

const DEFAULT_SCALE: ChordScaleInfo = {
  modeName: 'ionian',
  availableTensions: [2, 9],
  avoidNotes: [],
};

/** How strongly each mood uses chord-scale mapping */
const MOOD_CHORD_SCALE_STRENGTH: Record<Mood, number> = {
  lofi:      0.55,   // jazz — chord-scale theory is fundamental
  downtempo: 0.45,   // smooth jazz/soul influence
  blockhead: 0.40,   // neo-soul, jazz-hop
  avril:     0.35,   // intimate — benefits from modal color
  flim:      0.30,   // delicate modal shifts
  xtal:      0.30,   // dreamy modal washes
  disco:     0.25,   // funky but less modal
  syro:      0.20,   // IDM — occasional modal thinking
  ambient:   0.15,   // subtle — long tones benefit less,
  plantasia: 0.15,
  trance:    0.10,   // least modal — energy over harmony
};
