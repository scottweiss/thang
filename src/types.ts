export type NoteName = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export type ScaleType =
  | 'major'
  | 'minor'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian'
  | 'pentatonic'
  | 'minor_pentatonic';

export type ChordQuality = 'maj' | 'min' | 'maj7' | 'min7' | 'dom7' | 'sus2' | 'sus4' | 'dim' | 'aug';

export type Mood = 'ambient' | 'downtempo' | 'lofi' | 'trance';

export interface ScaleState {
  root: NoteName;
  type: ScaleType;
  notes: NoteName[];
}

export interface ChordState {
  symbol: string;
  root: NoteName;
  quality: ChordQuality;
  notes: string[];
  degree: number;
}

export interface LayerParams {
  gain: number;
  density: number;
  brightness: number;
  spaciousness: number;
}

export interface LayerOutput {
  name: string;
  orbit: number;
  patternCode: string;
}

export interface GlobalParams {
  tempo: number;
  density: number;
  brightness: number;
  spaciousness: number;
}

export interface GenerativeState {
  scale: ScaleState;
  currentChord: ChordState;
  chordHistory: ChordState[];
  progressionIndex: number;
  mood: Mood;
  params: GlobalParams;
  elapsed: number;
  lastChordChange: number;
  lastScaleChange: number;
  tick: number;
  chordChanged: boolean;
  scaleChanged: boolean;
}
