import { NoteName, ScaleType, ScaleState } from '../types';

const CHROMATIC: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Semitone intervals from root for each scale type
const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major:           [0, 2, 4, 5, 7, 9, 11],
  minor:           [0, 2, 3, 5, 7, 8, 10],
  dorian:          [0, 2, 3, 5, 7, 9, 10],
  phrygian:        [0, 1, 3, 5, 7, 8, 10],
  lydian:          [0, 2, 4, 6, 7, 9, 11],
  mixolydian:      [0, 2, 4, 5, 7, 9, 10],
  aeolian:         [0, 2, 3, 5, 7, 8, 10],
  locrian:         [0, 1, 3, 5, 6, 8, 10],
  pentatonic:      [0, 2, 4, 7, 9],
  minor_pentatonic:[0, 3, 5, 7, 10],
};

// Normalize note name to sharp-based chromatic index
const NOTE_INDEX: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

export function noteIndex(note: NoteName): number {
  return NOTE_INDEX[note];
}

export function noteFromIndex(idx: number): NoteName {
  return CHROMATIC[((idx % 12) + 12) % 12];
}

export function getScaleNotes(root: NoteName, type: ScaleType): NoteName[] {
  const rootIdx = noteIndex(root);
  return SCALE_INTERVALS[type].map(interval => noteFromIndex(rootIdx + interval));
}

export function getScaleNotesWithOctaves(root: NoteName, type: ScaleType, startOctave: number, endOctave: number): string[] {
  const notes = getScaleNotes(root, type);
  const rootIdx = noteIndex(root);
  const result: string[] = [];
  for (let oct = startOctave; oct <= endOctave; oct++) {
    for (const note of notes) {
      const idx = noteIndex(note);
      // Handle octave boundary: notes below root in chromatic order get next octave
      const actualOct = idx < rootIdx ? oct + 1 : oct;
      if (actualOct <= endOctave) {
        result.push(`${note}${actualOct}`);
      }
    }
  }
  return result;
}

export function buildScaleState(root: NoteName, type: ScaleType): ScaleState {
  return {
    root,
    type,
    notes: getScaleNotes(root, type),
  };
}

// Get pentatonic subset of the current scale (first 5 notes, skipping 4th and 7th degree)
export function getPentatonicSubset(scale: ScaleState): NoteName[] {
  const notes = scale.notes;
  if (notes.length <= 5) return [...notes];
  // For 7-note scales, take degrees 1, 2, 3, 5, 6 (skip 4th and 7th)
  return [notes[0], notes[1], notes[2], notes[4], notes[5]];
}

// Scales that share many notes with the current one (for smooth modulation)
export function getRelatedScales(current: ScaleState): { root: NoteName; type: ScaleType; commonNotes: number }[] {
  const currentNoteSet = new Set(current.notes.map(n => noteIndex(n)));
  const candidates: { root: NoteName; type: ScaleType; commonNotes: number }[] = [];

  const typesToTry: ScaleType[] = ['major', 'minor', 'dorian', 'mixolydian', 'lydian', 'aeolian'];

  for (const root of CHROMATIC) {
    for (const type of typesToTry) {
      if (root === current.root && type === current.type) continue;
      const notes = getScaleNotes(root, type);
      const common = notes.filter(n => currentNoteSet.has(noteIndex(n))).length;
      if (common >= 5) {
        candidates.push({ root, type, commonNotes: common });
      }
    }
  }

  return candidates.sort((a, b) => b.commonNotes - a.commonNotes);
}

export function getStrudelScale(root: NoteName, type: ScaleType): string {
  const typeMap: Record<ScaleType, string> = {
    major: 'major',
    minor: 'minor',
    dorian: 'dorian',
    phrygian: 'phrygian',
    lydian: 'lydian',
    mixolydian: 'mixolydian',
    aeolian: 'minor',
    locrian: 'locrian',
    pentatonic: 'major pentatonic',
    minor_pentatonic: 'minor pentatonic',
  };
  return `${root}:${typeMap[type]}`;
}
