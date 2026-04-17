import type { Mood, Section, LayerName, ChordQuality } from '../types';

export type LayerRole = 'lead' | 'accompaniment' | 'color';
export type PhrasePath = 'ambient' | 'structured' | 'motivic';
export type ProgressionMode = 'markov' | 'looped';
export type IntervalName =
  | 'P1' | 'm2' | 'M2' | 'm3' | 'M3' | 'P4' | 'TT'
  | 'P5' | 'm6' | 'M6' | 'm7' | 'M7' | 'P8';

export interface TimbrePreset {
  base?: 'sine' | 'triangle' | 'sawtooth' | 'square';
  sound?: string;
  fmIndex?: number;
  attack?: number;
  release?: number;
  lpf?: number;
}

export interface LoopedProgression {
  degrees: number[];
  qualities: ChordQuality[];
}

export interface TensionResponseCurve {
  overall: number;
  harmonic: number;
  rhythmic: number;
}

export interface MoodProfile {
  tempo?: {
    bpm?: number;
    fluctuation?: number;
    fluctuationPeriod?: number;
  };
  harmony?: {
    palette?: number[];
    reharmBudgetPerPhrase?: number;
    progressionMode?: ProgressionMode;
    loopedProgressions?: LoopedProgression[];
    addColorTones?: { ninth?: number; eleventh?: number; thirteenth?: number };
  };
  melody?: {
    rangeSemitones?: number;
    preferredIntervals?: IntervalName[];
    phrasePath?: PhrasePath;
    ornamentAmount?: number;
    blueNoteProb?: number;
  };
  layers?: {
    roles?: Partial<Record<Section, Partial<Record<LayerName, LayerRole>>>>;
    neverActive?: LayerName[];
  };
  timbre?: Partial<Record<LayerName, TimbrePreset>>;
  postProcessing?: {
    enabledStages?: Partial<Record<LayerName, string[]>>;
  };
  tensionResponseCurves?: TensionResponseCurve;
}

export const MOOD_PROFILES: Record<Mood, MoodProfile> = {
  ambient: {},
  downtempo: {},
  lofi: {},
  trance: {},
  avril: {},
  xtal: {},
  syro: {},
  blockhead: {},
  flim: {},
  disco: {},
  plantasia: {
    tempo: { bpm: 95, fluctuation: 0.005, fluctuationPeriod: 16 },
    harmony: {
      // Diatonic only: I, ii, iii, IV, V, vi
      palette: [0, 1, 2, 3, 4, 5],
      reharmBudgetPerPhrase: 0,
      progressionMode: 'looped',
      loopedProgressions: [
        { degrees: [0, 4, 5, 3], qualities: ['maj', 'maj', 'min', 'maj'] },       // I-V-vi-IV
        { degrees: [0, 3, 4, 0], qualities: ['maj', 'maj', 'maj', 'maj'] },       // I-IV-V-I
        { degrees: [0, 2, 3, 4], qualities: ['maj', 'min', 'maj', 'maj'] },       // I-iii-IV-V
        { degrees: [0, 5, 3, 4], qualities: ['maj', 'min', 'maj', 'maj'] },       // I-vi-IV-V
      ],
      addColorTones: { ninth: 0.30, eleventh: 0, thirteenth: 0 },
    },
    melody: {
      rangeSemitones: 12,
      preferredIntervals: ['P1', 'M2', 'm3', 'M3', 'P4', 'P5'],
      phrasePath: 'motivic',
      ornamentAmount: 0.05,
      blueNoteProb: 0,
    },
    layers: {
      roles: {
        intro:     { drone: 'lead', atmosphere: 'accompaniment', melody: 'color' },
        build:     { melody: 'lead', harmony: 'accompaniment', drone: 'accompaniment', atmosphere: 'color' },
        peak:      { melody: 'lead', harmony: 'accompaniment', arp: 'color', drone: 'accompaniment', atmosphere: 'color' },
        breakdown: { drone: 'lead', atmosphere: 'accompaniment' },
        groove:    { melody: 'lead', harmony: 'accompaniment', atmosphere: 'color' },
      },
      neverActive: ['texture'],   // Plantasia has no drums
    },
    timbre: {
      melody:     { base: 'triangle', fmIndex: 1.8, attack: 0.08, release: 0.6, lpf: 2800, sound: 'gm_lead_2_sawtooth' },
      harmony:    { base: 'sine',     fmIndex: 1.2, attack: 0.4,  release: 1.4, lpf: 2200, sound: 'gm_pad_warm' },
      drone:      { base: 'sine',     fmIndex: 0.8, attack: 0.5,  release: 2.0, lpf: 900 },
      atmosphere: { base: 'sine',     fmIndex: 0.6, attack: 0.2,  release: 2.5, lpf: 3200, sound: 'gm_celesta' },
      arp:        { base: 'triangle', fmIndex: 1.4, attack: 0.03, release: 0.3, lpf: 2600 },
    },
    postProcessing: {
      enabledStages: {
        melody:     ['lpf', 'microTiming', 'room', 'envelopeEvolution', 'arrivalEmphasis', 'gainArc'],
        harmony:    ['lpf', 'room', 'chorus', 'envelopeEvolution', 'gainArc'],
        drone:      ['lpf', 'room', 'gainArc'],
        atmosphere: ['lpf', 'room', 'chorus'],
        arp:        ['lpf', 'microTiming', 'room', 'patternDegrade', 'gainArc'],
        texture:    [],
      },
    },
    // Plantasia doesn't build much — narrow tension response for a gentle, stable feel
    tensionResponseCurves: { overall: 0.5, harmonic: 0.4, rhythmic: 0.3 },
  },
};

const ACCOMPANIMENT_ROLE_HINT: LayerRole = 'accompaniment';
const COLOR_ROLE_HINT: LayerRole = 'color';
const LEAD_ROLE_HINT: LayerRole = 'lead';

export function resolveLayerRole(mood: Mood, section: Section, layer: LayerName): LayerRole {
  const explicit = MOOD_PROFILES[mood]?.layers?.roles?.[section]?.[layer];
  if (explicit) return explicit;

  if (layer === 'melody') {
    return section === 'intro' || section === 'breakdown' ? COLOR_ROLE_HINT : LEAD_ROLE_HINT;
  }
  if (layer === 'drone') {
    return section === 'intro' || section === 'breakdown' ? LEAD_ROLE_HINT : ACCOMPANIMENT_ROLE_HINT;
  }
  if (layer === 'harmony') return ACCOMPANIMENT_ROLE_HINT;
  return COLOR_ROLE_HINT;
}

export function isLayerNeverActive(mood: Mood, layer: LayerName): boolean {
  return MOOD_PROFILES[mood]?.layers?.neverActive?.includes(layer) ?? false;
}

export function getReharmBudgetPerPhrase(mood: Mood): number | undefined {
  return MOOD_PROFILES[mood]?.harmony?.reharmBudgetPerPhrase;
}

export function getProgressionMode(mood: Mood): ProgressionMode {
  return MOOD_PROFILES[mood]?.harmony?.progressionMode ?? 'markov';
}

export function getLoopedProgressions(mood: Mood): LoopedProgression[] | undefined {
  return MOOD_PROFILES[mood]?.harmony?.loopedProgressions;
}

export function getMelodyPhrasePath(mood: Mood): PhrasePath | undefined {
  return MOOD_PROFILES[mood]?.melody?.phrasePath;
}

export function getTimbrePreset(mood: Mood, layer: LayerName): TimbrePreset | undefined {
  return MOOD_PROFILES[mood]?.timbre?.[layer];
}

export function getTensionCurve(mood: Mood): TensionResponseCurve {
  return MOOD_PROFILES[mood]?.tensionResponseCurves ?? { overall: 1, harmonic: 1, rhythmic: 1 };
}

// Stages that historically skip certain layers (the `if (this.name !== 'texture')`
// patterns in caching-layer.ts). Formalized here so per-mood overrides can still
// opt in, but existing behavior is preserved when the profile doesn't specify.
const DEFAULT_STAGE_EXCLUDE: Record<string, LayerName[]> = {
  chorus: ['texture'],
  envelopeEvolution: ['texture'],
  tensionArticulation: ['texture'],
  texturalContrast: ['texture'],
  hemiola: ['texture'],
  breathSync: ['texture'],
  resultantRhythm: ['texture'],
  rhythmicPhase: ['texture'],
};

export function isStageEnabledForLayer(mood: Mood, layer: LayerName, stage: string): boolean {
  if (isLayerNeverActive(mood, layer)) return false;
  const enabled = MOOD_PROFILES[mood]?.postProcessing?.enabledStages?.[layer];
  if (enabled !== undefined) return enabled.includes(stage);
  const excluded = DEFAULT_STAGE_EXCLUDE[stage];
  if (excluded && excluded.includes(layer)) return false;
  return true;
}
