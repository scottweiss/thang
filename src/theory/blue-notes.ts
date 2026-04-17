/**
 * Blue notes — chromatic melody inflections from parallel modes.
 *
 * In tonal music, certain chromatic alterations add emotional color
 * without disrupting the harmonic framework:
 * - ♭3 in major: blues/gospel warmth (minor third in major context)
 * - ♭7 in major: dominant/mixolydian flavor
 * - ♮3 in minor: momentary brightness (picardy-like)
 * - ♭5 in any key: tritone "blue note" (jazz/blues tension)
 *
 * These are applied sparingly to melodic lines — a single altered note
 * amid diatonic motion creates a fleeting color shift. The ear registers
 * it as expressive rather than wrong, because the surrounding context
 * remains tonal.
 *
 * Different moods use different inflection palettes:
 * - Lofi/blockhead: heavy blue note usage (♭3, ♭7, ♭5)
 * - Syro: chromatic passing tones (any half-step neighbor)
 * - Ambient/avril: rare, subtle (♭7 only)
 * - Trance/disco: very rare (stays diatonic)
 */

import type { Mood } from '../types';

/** Chromatic note names for lookup */
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

export interface BlueNoteConfig {
  /** Overall probability of applying a blue note inflection (0-1) */
  probability: number;
  /** Which scale degree alterations are available (semitone offsets from scale degrees) */
  inflections: BlueInflection[];
}

export interface BlueInflection {
  /** Scale degree to alter (0-6) */
  degree: number;
  /** Semitone shift (-1 = flat, +1 = sharp) */
  shift: number;
  /** Relative weight (higher = more likely to be chosen) */
  weight: number;
}

/** Inflection palettes per mood */
const MOOD_BLUE_NOTES: Record<Mood, BlueNoteConfig> = {
  lofi: {
    probability: 0.12,
    inflections: [
      { degree: 2, shift: -1, weight: 3 },  // ♭3 — classic blue note
      { degree: 6, shift: -1, weight: 2 },  // ♭7 — mixolydian color
      { degree: 4, shift: -1, weight: 1 },  // ♭5 — tritone blue note
    ],
  },
  blockhead: {
    probability: 0.10,
    inflections: [
      { degree: 2, shift: -1, weight: 3 },  // ♭3
      { degree: 6, shift: -1, weight: 2 },  // ♭7
      { degree: 4, shift: -1, weight: 1 },  // ♭5
    ],
  },
  downtempo: {
    probability: 0.08,
    inflections: [
      { degree: 2, shift: -1, weight: 2 },  // ♭3
      { degree: 6, shift: -1, weight: 3 },  // ♭7
    ],
  },
  syro: {
    probability: 0.10,
    inflections: [
      { degree: 2, shift: -1, weight: 1 },  // ♭3
      { degree: 6, shift: -1, weight: 1 },  // ♭7
      { degree: 4, shift: -1, weight: 2 },  // ♭5 — acid flavor
      { degree: 1, shift: +1, weight: 1 },  // #2 — chromatic passing
    ],
  },
  flim: {
    probability: 0.06,
    inflections: [
      { degree: 6, shift: -1, weight: 2 },  // ♭7
      { degree: 2, shift: -1, weight: 1 },  // ♭3
    ],
  },
  xtal: {
    probability: 0.05,
    inflections: [
      { degree: 6, shift: -1, weight: 2 },  // ♭7 — hazy warmth
    ],
  },
  avril: {
    probability: 0.04,
    inflections: [
      { degree: 6, shift: -1, weight: 2 },  // ♭7 — subtle color
    ],
  },
  ambient: {
    probability: 0.03,
    inflections: [
      { degree: 6, shift: -1, weight: 1 },  // ♭7 — very rare
    ],
  },
  plantasia: {
    probability: 0.03,
    inflections: [
      { degree: 6, shift: -1, weight: 1 },  // ♭7 — very rare
    ],
  },
  trance: {
    probability: 0.02,
    inflections: [
      { degree: 6, shift: -1, weight: 1 },  // ♭7 — almost never
    ],
  },
  disco: {
    probability: 0.04,
    inflections: [
      { degree: 2, shift: -1, weight: 1 },  // ♭3 — funky passing tone
      { degree: 6, shift: -1, weight: 2 },  // ♭7 — disco mixolydian
    ],
  },
};

/**
 * Get the blue note configuration for a mood.
 */
export function getBlueNoteConfig(mood: Mood): BlueNoteConfig {
  return MOOD_BLUE_NOTES[mood];
}

/**
 * Attempt to apply a blue note inflection to a single note.
 *
 * @param noteName    Note with octave (e.g., 'E4')
 * @param scaleNotes  Scale note names without octave (e.g., ['C', 'D', 'E', 'F', 'G', 'A', 'B'])
 * @param mood        Current mood
 * @param tension     Current tension (0-1); higher tension = more likely
 * @returns The (possibly altered) note string
 */
export function applyBlueNote(
  noteName: string,
  scaleNotes: string[],
  mood: Mood,
  tension: number
): string {
  const config = MOOD_BLUE_NOTES[mood];
  if (!config || config.inflections.length === 0) return noteName;

  // Tension increases probability slightly (blues notes express tension)
  const adjustedProb = config.probability * (0.8 + tension * 0.4);
  if (Math.random() >= adjustedProb) return noteName;

  // Parse the note
  const match = noteName.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) return noteName;
  const [, name, octStr] = match;
  const octave = parseInt(octStr);

  // Find which scale degree this note is
  const degreeIdx = scaleNotes.indexOf(name);
  if (degreeIdx < 0) return noteName; // chromatic note, skip

  // Find applicable inflections for this degree
  const applicable = config.inflections.filter(inf => inf.degree === degreeIdx);
  if (applicable.length === 0) return noteName;

  // Weighted random selection among applicable inflections
  const totalWeight = applicable.reduce((sum, inf) => sum + inf.weight, 0);
  let roll = Math.random() * totalWeight;
  let chosen = applicable[0];
  for (const inf of applicable) {
    roll -= inf.weight;
    if (roll <= 0) { chosen = inf; break; }
  }

  // Apply the chromatic shift
  const semitone = NOTE_TO_SEMITONE[name];
  if (semitone === undefined) return noteName;

  let newSemitone = (semitone + chosen.shift + 12) % 12;
  let newOctave = octave;
  // Handle octave wrapping
  if (chosen.shift < 0 && semitone === 0) newOctave--;
  if (chosen.shift > 0 && semitone === 11) newOctave++;

  return `${CHROMATIC[newSemitone]}${newOctave}`;
}

/**
 * Apply blue note inflections to an array of melody elements.
 * Rests ('~') are passed through unchanged.
 */
export function applyBlueNotes(
  elements: string[],
  scaleNotes: string[],
  mood: Mood,
  tension: number
): string[] {
  return elements.map(el => {
    if (el === '~') return el;
    return applyBlueNote(el, scaleNotes, mood, tension);
  });
}
