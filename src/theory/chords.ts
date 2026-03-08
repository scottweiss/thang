import { NoteName, ChordQuality, ChordState, ScaleState } from '../types';
import { noteIndex, noteFromIndex, getScaleNotes } from './scales';

// Consonant chord qualities only - no diminished or augmented
// For ambient/downtempo, favor 7ths and sus chords
const MAJOR_SCALE_QUALITIES: ChordQuality[] = ['maj7', 'min7', 'min7', 'maj7', 'dom7', 'min7', 'min7'];
const MINOR_SCALE_QUALITIES: ChordQuality[] = ['min7', 'min7', 'maj7', 'min7', 'min7', 'maj7', 'dom7'];
const DORIAN_SCALE_QUALITIES: ChordQuality[] = ['min7', 'min7', 'maj7', 'dom7', 'min7', 'min7', 'maj7'];
const MIXOLYDIAN_SCALE_QUALITIES: ChordQuality[] = ['dom7', 'min7', 'min7', 'maj7', 'min7', 'min7', 'maj7'];
const LYDIAN_SCALE_QUALITIES: ChordQuality[] = ['maj7', 'dom7', 'min7', 'min7', 'maj7', 'min7', 'min7'];

const QUALITY_MAP: Record<string, ChordQuality[]> = {
  major: MAJOR_SCALE_QUALITIES,
  minor: MINOR_SCALE_QUALITIES,
  aeolian: MINOR_SCALE_QUALITIES,
  dorian: DORIAN_SCALE_QUALITIES,
  mixolydian: MIXOLYDIAN_SCALE_QUALITIES,
  lydian: LYDIAN_SCALE_QUALITIES,
  phrygian: MINOR_SCALE_QUALITIES,
  locrian: MINOR_SCALE_QUALITIES,
  pentatonic: MAJOR_SCALE_QUALITIES,
  minor_pentatonic: MINOR_SCALE_QUALITIES,
};

// Only consonant intervals - no tritones, no minor 2nds
const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  maj:  [0, 4, 7],
  min:  [0, 3, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  dim:  [0, 3, 7],    // replaced dim triad with minor to avoid dissonance
  aug:  [0, 4, 7],    // replaced aug triad with major to avoid dissonance
};

export function getChordNotes(root: NoteName, quality: ChordQuality): NoteName[] {
  const rootIdx = noteIndex(root);
  return CHORD_INTERVALS[quality].map(i => noteFromIndex(rootIdx + i));
}

export function getChordNotesWithOctave(root: NoteName, quality: ChordQuality, baseOctave: number): string[] {
  const rootIdx = noteIndex(root);
  const intervals = CHORD_INTERVALS[quality];
  return intervals.map(i => {
    const note = noteFromIndex(rootIdx + i);
    const oct = baseOctave + Math.floor((rootIdx + i) / 12);
    return `${note}${oct}`;
  });
}

export function getChordSymbol(root: NoteName, quality: ChordQuality): string {
  // Strudel voicing() uses jazz symbols: ^7 = maj7, m7, 7 = dom7
  const qualityStr: Record<ChordQuality, string> = {
    maj: '', min: 'm', maj7: '^7', min7: 'm7', dom7: '7',
    sus2: 'sus2', sus4: 'sus4', dim: 'm', aug: '',
  };
  return `${root}${qualityStr[quality]}`;
}

export function chordsInScale(scale: ScaleState): ChordState[] {
  const scaleNotes = getScaleNotes(scale.root, scale.type);
  const qualities = QUALITY_MAP[scale.type] || MAJOR_SCALE_QUALITIES;
  const degreesToUse = Math.min(scaleNotes.length, 7);

  return Array.from({ length: degreesToUse }, (_, i) => {
    const root = scaleNotes[i];
    const quality = qualities[i];
    return {
      symbol: getChordSymbol(root, quality),
      root,
      quality,
      notes: getChordNotesWithOctave(root, quality, 3),
      degree: i,
    };
  });
}
