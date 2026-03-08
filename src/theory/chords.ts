import { NoteName, ChordQuality, ChordState, ScaleState, Mood } from '../types';
import { noteIndex, noteFromIndex, getScaleNotes } from './scales';

// Base chord qualities per scale type (used as foundation, mood overrides apply)
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

// Mood-specific quality transforms — applied on top of base scale qualities
function applyMoodQualities(baseQualities: ChordQuality[], mood: Mood): ChordQuality[] {
  switch (mood) {
    case 'ambient':
      // Open, floating — replace some 7ths with sus chords
      return baseQualities.map((q, i) => {
        if (i === 0 || i === 3) return 'sus2'; // I and IV become sus2
        if (i === 4) return 'sus4';             // V becomes sus4
        if (q === 'min7') return 'min';         // simplify minor 7ths to triads
        return q;
      });
    case 'downtempo':
      // Warm, sophisticated — keep most 7ths, add some sus
      return baseQualities.map((q, i) => {
        if (i === 3 && Math.random() < 0.4) return 'sus4'; // occasional IV → sus4
        return q;
      });
    case 'lofi':
      // Jazzy — all 7ths, this is the sweet spot
      return baseQualities;
    case 'trance':
      // Simple, powerful — mostly triads
      return baseQualities.map(q => {
        if (q === 'maj7') return 'maj';
        if (q === 'min7') return 'min';
        if (q === 'dom7') return 'maj';
        return q;
      });
    case 'avril':
      // Intimate, bittersweet — keep most 7ths, add sus2 for open warmth
      return baseQualities.map((q, i) => {
        if (i === 0) return 'sus2';              // I becomes sus2 — open, wistful
        if (i === 3 && Math.random() < 0.5) return 'sus2'; // IV sometimes sus2
        return q;                                 // keep maj7/min7 for warmth
      });
    case 'xtal':
      // Dreamy open voicings — mostly min7 and sus2, hazy and warm
      return baseQualities.map((q, i) => {
        if (i === 0 || i === 3) return 'sus2';    // I and IV become sus2 — open, dreamy
        if (q === 'maj7' || q === 'dom7') return 'min7'; // soften to minor 7ths
        return q === 'min' ? 'min7' : q;           // enrich minor triads to 7ths
      });
    case 'syro':
      // Tense, chromatic — keep dom7s and min7s, add some dissonance
      return baseQualities.map((q, i) => {
        if (i === 4) return 'dom7';                // V stays dominant — tension
        if (q === 'maj') return 'dom7';            // major becomes dominant 7
        if (q === 'min') return 'min7';            // minor becomes minor 7
        return q;                                   // keep existing 7th chords
      });
    case 'blockhead':
      // Jazzy color — keep dom7s for jazz flavor, add sus4 on IV
      return baseQualities.map((q, i) => {
        if (i === 3 && Math.random() < 0.5) return 'sus4'; // IV sometimes sus4
        return q;                                            // keep dom7s and min7s
      });
    case 'flim':
      // Bright and open — mostly maj7 and sus2
      return baseQualities.map((q, i) => {
        if (i === 0 || i === 3) return 'sus2';     // I and IV become sus2 — open, bright
        if (q === 'dom7') return 'maj7';            // soften dom7 to maj7
        return q;
      });
  }
}

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

export function chordsInScale(scale: ScaleState, mood?: Mood): ChordState[] {
  const scaleNotes = getScaleNotes(scale.root, scale.type);
  let qualities = QUALITY_MAP[scale.type] || MAJOR_SCALE_QUALITIES;

  if (mood) {
    qualities = applyMoodQualities(qualities, mood);
  }

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
