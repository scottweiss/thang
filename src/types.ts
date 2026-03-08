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

export type Mood = 'ambient' | 'downtempo' | 'lofi' | 'trance' | 'avril' | 'xtal' | 'syro' | 'blockhead' | 'flim' | 'disco';

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

export type Section = 'intro' | 'build' | 'peak' | 'breakdown' | 'groove';

export interface TensionState {
  structural: number;   // from section position (0-1)
  harmonic: number;     // from chord distance to tonic (0-1)
  rhythmic: number;     // from density (0-1)
  overall: number;      // weighted combination (0-1)
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
  section: Section;
  sectionChanged: boolean;
  activeLayers: Set<string>;
  layerGainMultipliers: Record<string, number>;
  tension: TensionState;
  layerCenterPitches: Record<string, number>;
}
