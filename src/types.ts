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

export type ChordQuality = 'maj' | 'min' | 'maj7' | 'min7' | 'dom7' | 'sus2' | 'sus4' | 'dim' | 'aug' | 'add9' | 'min9';

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
  /** Independent emotional axes */
  energy?: number;        // density + volume + tempo feel (0-1)
  intimacy?: number;      // inverse of spaciousness + arrangement density (0-1, high = intimate/close)
  resolutionPull?: number; // how strongly current chord wants to resolve (0-1)
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
  ticksSinceChordChange: number;
  nextChordHint?: ChordState;  // probable next chord for anticipation
  layerPhraseDensity: Record<string, number>;  // per-layer note density (0-1) for call-and-response
  layerStepPattern: Record<string, string[]>;  // per-layer step arrays for rhythmic counterpoint
  sectionProgress: number;  // 0-1 how far through current section
  activeMotif?: string[];   // current melody motif for cross-layer thematic unity
  melodyDirection?: 'ascending' | 'descending' | 'static';  // melody motion for contrapuntal arp
  /** Core rhythmic cell for cross-layer unity */
  rhythmAnchor?: boolean[];
  compositionPlan?: import('./engine/composition-plan').CompositionPlan;
  /** Current section's compositional directives */
  sectionDirectives?: {
    harmonicRhythm: 'slow' | 'normal' | 'accelerating';
    contrastingMelody: boolean;
    arrangementDensity: 'sparse' | 'normal' | 'full';
  };
  /** Active progression loop for current section */
  progressionLoop?: ProgressionLoop;
  /** Active narrative arc for emotional journey */
  narrativeArc?: import('./theory/narrative-arc').NarrativeArc;
  /** Bar-level timing state */
  barClock?: BarClockState;
}

/** A repeating chord progression that defines a section's harmonic identity */
export interface ProgressionLoop {
  /** Scale degrees (0-based: 0=I, 1=ii, 2=iii, 3=IV, 4=V, 5=vi, 6=vii°) */
  degrees: number[];
  /** Chord quality per degree */
  qualities: ChordQuality[];
  /** Bars each chord sustains before advancing to next in loop */
  barsPerChord: number;
  /** Total times to repeat the full loop (-1 = until section ends) */
  loopCount: number;
}

/** Bar clock state tracked in GenerativeState */
export interface BarClockState {
  /** Current bar number since piece start */
  currentBar: number;
  /** Bar duration in seconds (4 / cps) */
  barDuration: number;
  /** Position within current bar (0-1) */
  barProgress: number;
  /** Bar number within current section */
  sectionBar: number;
  /** Bar number within current progression loop (resets each loop) */
  loopBar: number;
  /** Current chord index within the loop (0 to loop.degrees.length-1) */
  loopChordIndex: number;
}

export type LayerName = 'drone' | 'harmony' | 'melody' | 'texture' | 'arp' | 'atmosphere';

export interface DashboardOverrides {
  layers: Partial<Record<LayerName, {
    enabled?: boolean;
    gain?: number;
    instrument?: string;
  }>>;
  mix: Partial<Record<LayerName, {
    room?: number;
    delay?: number;
    lpf?: number;
    pan?: number;
  }>>;
  musical: {
    scaleRoot?: NoteName;
    scaleType?: ScaleType;
    tempo?: number;
  };
  masterGain?: number;
}
