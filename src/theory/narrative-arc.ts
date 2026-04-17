/**
 * Narrative Arc Templates — pre-composed emotional journeys.
 *
 * Each arc defines a story that the music tells. Rather than
 * random-walking through tension values, arcs give the piece
 * a purposeful emotional trajectory.
 */
import type { Mood, Section } from '../types';

export type ArcType = 'journey' | 'meditation' | 'dance' | 'elegy' | 'triumph';

export interface ArcPhase {
  /** Name of this emotional phase */
  name: string;
  /** Fraction of total piece this phase spans (0-1, all phases sum to 1) */
  duration: number;
  /** Target tension ceiling for this phase */
  tensionCeiling: number;
  /** Target energy for this phase */
  energyTarget: number;
  /** Preferred sections during this phase */
  sectionWeights: Record<Section, number>;
  /** Descriptive character — for documentation, not code */
  character: string;
}

export interface NarrativeArc {
  type: ArcType;
  phases: ArcPhase[];
}

// ---- Arc definitions ----

const JOURNEY: NarrativeArc = {
  type: 'journey',
  phases: [
    {
      name: 'departure',
      duration: 0.15,
      tensionCeiling: 0.4,
      energyTarget: 0.3,
      sectionWeights: { intro: 3.0, build: 1.0, peak: 0.1, breakdown: 0.5, groove: 0.8 },
      character: 'calm beginning, establishing the world',
    },
    {
      name: 'wonder',
      duration: 0.20,
      tensionCeiling: 0.6,
      energyTarget: 0.5,
      sectionWeights: { intro: 0.2, build: 2.0, peak: 0.5, breakdown: 0.5, groove: 1.5 },
      character: 'discovering new territory, growing curiosity',
    },
    {
      name: 'challenge',
      duration: 0.25,
      tensionCeiling: 0.9,
      energyTarget: 0.8,
      sectionWeights: { intro: 0.1, build: 1.5, peak: 2.5, breakdown: 0.3, groove: 1.0 },
      character: 'confrontation, highest intensity, the test',
    },
    {
      name: 'revelation',
      duration: 0.20,
      tensionCeiling: 0.7,
      energyTarget: 0.6,
      sectionWeights: { intro: 0.1, build: 0.5, peak: 1.0, breakdown: 2.0, groove: 1.5 },
      character: 'understanding arrives, tension releasing into meaning',
    },
    {
      name: 'homecoming',
      duration: 0.20,
      tensionCeiling: 0.4,
      energyTarget: 0.35,
      sectionWeights: { intro: 0.3, build: 0.3, peak: 0.1, breakdown: 1.5, groove: 2.0 },
      character: 'return transformed, peaceful resolution',
    },
  ],
};

const MEDITATION: NarrativeArc = {
  type: 'meditation',
  phases: [
    {
      name: 'settling',
      duration: 0.20,
      tensionCeiling: 0.3,
      energyTarget: 0.25,
      sectionWeights: { intro: 3.0, build: 0.5, peak: 0.1, breakdown: 1.0, groove: 0.8 },
      character: 'arriving, letting go of outside world',
    },
    {
      name: 'deepening',
      duration: 0.30,
      tensionCeiling: 0.5,
      energyTarget: 0.35,
      sectionWeights: { intro: 0.3, build: 1.0, peak: 0.3, breakdown: 1.5, groove: 2.0 },
      character: 'sinking deeper, awareness expanding',
    },
    {
      name: 'stillness',
      duration: 0.25,
      tensionCeiling: 0.3,
      energyTarget: 0.2,
      sectionWeights: { intro: 0.5, build: 0.2, peak: 0.1, breakdown: 2.5, groove: 1.0 },
      character: 'the center, minimal movement, maximum presence',
    },
    {
      name: 'emergence',
      duration: 0.25,
      tensionCeiling: 0.45,
      energyTarget: 0.4,
      sectionWeights: { intro: 0.3, build: 0.8, peak: 0.2, breakdown: 1.0, groove: 2.0 },
      character: 'returning to surface, carrying peace outward',
    },
  ],
};

const DANCE: NarrativeArc = {
  type: 'dance',
  phases: [
    {
      name: 'warmup',
      duration: 0.12,
      tensionCeiling: 0.5,
      energyTarget: 0.4,
      sectionWeights: { intro: 2.0, build: 1.5, peak: 0.2, breakdown: 0.3, groove: 1.0 },
      character: 'finding the groove, body starting to move',
    },
    {
      name: 'groove',
      duration: 0.22,
      tensionCeiling: 0.7,
      energyTarget: 0.65,
      sectionWeights: { intro: 0.1, build: 1.0, peak: 0.8, breakdown: 0.3, groove: 2.5 },
      character: 'locked in, riding the rhythm',
    },
    {
      name: 'peak_energy',
      duration: 0.20,
      tensionCeiling: 1.0,
      energyTarget: 0.9,
      sectionWeights: { intro: 0.0, build: 1.5, peak: 3.0, breakdown: 0.2, groove: 1.0 },
      character: 'maximum energy, the drop, hands in the air',
    },
    {
      name: 'respite',
      duration: 0.14,
      tensionCeiling: 0.5,
      energyTarget: 0.4,
      sectionWeights: { intro: 0.1, build: 0.5, peak: 0.2, breakdown: 2.5, groove: 1.0 },
      character: 'catching breath, anticipating the next wave',
    },
    {
      name: 'second_peak',
      duration: 0.18,
      tensionCeiling: 1.0,
      energyTarget: 0.95,
      sectionWeights: { intro: 0.0, build: 1.0, peak: 3.0, breakdown: 0.1, groove: 1.5 },
      character: 'even bigger release, the real climax',
    },
    {
      name: 'cooldown',
      duration: 0.14,
      tensionCeiling: 0.4,
      energyTarget: 0.3,
      sectionWeights: { intro: 0.3, build: 0.2, peak: 0.1, breakdown: 2.0, groove: 1.5 },
      character: 'winding down, afterglow',
    },
  ],
};

const ELEGY: NarrativeArc = {
  type: 'elegy',
  phases: [
    {
      name: 'loss',
      duration: 0.25,
      tensionCeiling: 0.6,
      energyTarget: 0.3,
      sectionWeights: { intro: 2.0, build: 1.0, peak: 0.2, breakdown: 1.5, groove: 0.5 },
      character: 'the weight of absence, sparse and searching',
    },
    {
      name: 'memory',
      duration: 0.25,
      tensionCeiling: 0.7,
      energyTarget: 0.5,
      sectionWeights: { intro: 0.2, build: 1.5, peak: 1.0, breakdown: 0.8, groove: 1.5 },
      character: 'remembering beauty, bittersweet warmth',
    },
    {
      name: 'grief',
      duration: 0.20,
      tensionCeiling: 0.85,
      energyTarget: 0.7,
      sectionWeights: { intro: 0.1, build: 2.0, peak: 2.0, breakdown: 0.5, groove: 0.5 },
      character: 'the full force of feeling, cathartic intensity',
    },
    {
      name: 'acceptance',
      duration: 0.30,
      tensionCeiling: 0.4,
      energyTarget: 0.3,
      sectionWeights: { intro: 0.3, build: 0.3, peak: 0.1, breakdown: 2.0, groove: 1.5 },
      character: 'peace found, gentle resolution, letting go',
    },
  ],
};

const TRIUMPH: NarrativeArc = {
  type: 'triumph',
  phases: [
    {
      name: 'struggle',
      duration: 0.20,
      tensionCeiling: 0.7,
      energyTarget: 0.5,
      sectionWeights: { intro: 1.0, build: 2.5, peak: 0.5, breakdown: 0.5, groove: 0.8 },
      character: 'effort and determination, uphill battle',
    },
    {
      name: 'setback',
      duration: 0.15,
      tensionCeiling: 0.5,
      energyTarget: 0.35,
      sectionWeights: { intro: 0.3, build: 0.5, peak: 0.2, breakdown: 2.5, groove: 1.0 },
      character: 'doubt, the darkest moment before dawn',
    },
    {
      name: 'resolve',
      duration: 0.20,
      tensionCeiling: 0.85,
      energyTarget: 0.7,
      sectionWeights: { intro: 0.1, build: 3.0, peak: 1.0, breakdown: 0.2, groove: 1.0 },
      character: 'renewed determination, gathering strength',
    },
    {
      name: 'victory',
      duration: 0.25,
      tensionCeiling: 1.0,
      energyTarget: 0.95,
      sectionWeights: { intro: 0.0, build: 0.5, peak: 3.0, breakdown: 0.1, groove: 2.0 },
      character: 'glory, the summit, everything paying off',
    },
    {
      name: 'celebration',
      duration: 0.20,
      tensionCeiling: 0.6,
      energyTarget: 0.55,
      sectionWeights: { intro: 0.2, build: 0.3, peak: 0.5, breakdown: 0.8, groove: 2.5 },
      character: 'basking in achievement, joyful resolution',
    },
  ],
};

const ALL_ARCS: Record<ArcType, NarrativeArc> = {
  journey: JOURNEY,
  meditation: MEDITATION,
  dance: DANCE,
  elegy: ELEGY,
  triumph: TRIUMPH,
};

/** Per-mood preferred arc types (weighted random selection) */
const MOOD_ARC_WEIGHTS: Record<Mood, Partial<Record<ArcType, number>>> = {
  ambient:   { meditation: 3.0, journey: 1.5, elegy: 1.0 },
  plantasia: { meditation: 3.0, journey: 1.5, elegy: 1.0 },
  downtempo: { journey: 2.0, elegy: 1.5, meditation: 1.0 },
  lofi:      { journey: 2.0, elegy: 1.5, meditation: 1.0 },
  trance:    { dance: 3.0, triumph: 1.5 },
  avril:     { meditation: 2.0, journey: 2.0, elegy: 1.0 },
  xtal:      { meditation: 2.0, journey: 1.5, elegy: 1.0 },
  syro:      { triumph: 2.0, dance: 1.5, journey: 1.0 },
  blockhead: { dance: 2.0, triumph: 1.5, journey: 1.0 },
  flim:      { journey: 2.0, meditation: 1.5, elegy: 1.0 },
  disco:     { dance: 3.0, triumph: 1.0 },
};

/** Select a narrative arc for the current mood */
export function selectArc(mood: Mood): NarrativeArc {
  const weights = MOOD_ARC_WEIGHTS[mood];
  const entries = Object.entries(weights) as [ArcType, number][];
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * totalWeight;
  for (const [arcType, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return { ...ALL_ARCS[arcType] };
  }
  return { ...ALL_ARCS[entries[0][0]] };
}

/** Get the arc by type */
export function getArc(type: ArcType): NarrativeArc {
  return ALL_ARCS[type];
}

/** Get all arc types */
export function getAllArcTypes(): ArcType[] {
  return Object.keys(ALL_ARCS) as ArcType[];
}

/**
 * Get the current phase based on progress through the piece (0-1).
 * Returns the phase and how far through it we are.
 */
export function getCurrentArcPhase(
  arc: NarrativeArc,
  progress: number,
): { phase: ArcPhase; phaseProgress: number; phaseIndex: number } {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  let accumulated = 0;

  for (let i = 0; i < arc.phases.length; i++) {
    const phase = arc.phases[i];
    if (clampedProgress <= accumulated + phase.duration || i === arc.phases.length - 1) {
      const phaseProgress = Math.min(1, (clampedProgress - accumulated) / phase.duration);
      return { phase, phaseProgress, phaseIndex: i };
    }
    accumulated += phase.duration;
  }

  // Fallback to last phase
  const lastPhase = arc.phases[arc.phases.length - 1];
  return { phase: lastPhase, phaseProgress: 1.0, phaseIndex: arc.phases.length - 1 };
}

/**
 * Get interpolated tension ceiling between current and next phase.
 * Smooth transitions between phases rather than hard steps.
 */
export function arcTensionCeiling(arc: NarrativeArc, progress: number): number {
  const { phase, phaseProgress, phaseIndex } = getCurrentArcPhase(arc, progress);

  if (phaseIndex >= arc.phases.length - 1) return phase.tensionCeiling;

  const nextPhase = arc.phases[phaseIndex + 1];
  // Smooth interpolation in the last 30% of each phase
  if (phaseProgress > 0.7) {
    const blendFactor = (phaseProgress - 0.7) / 0.3;
    return phase.tensionCeiling + (nextPhase.tensionCeiling - phase.tensionCeiling) * blendFactor;
  }
  return phase.tensionCeiling;
}

/**
 * Get section preference weights from the current arc phase.
 * Blends with existing form-trajectory preferences.
 */
export function arcSectionPreference(arc: NarrativeArc, progress: number): Record<Section, number> {
  const { phase } = getCurrentArcPhase(arc, progress);
  return { ...phase.sectionWeights };
}

/**
 * Get energy target from the current arc phase (interpolated).
 */
export function arcEnergyTarget(arc: NarrativeArc, progress: number): number {
  const { phase, phaseProgress, phaseIndex } = getCurrentArcPhase(arc, progress);

  if (phaseIndex >= arc.phases.length - 1) return phase.energyTarget;

  const nextPhase = arc.phases[phaseIndex + 1];
  if (phaseProgress > 0.7) {
    const blendFactor = (phaseProgress - 0.7) / 0.3;
    return phase.energyTarget + (nextPhase.energyTarget - phase.energyTarget) * blendFactor;
  }
  return phase.energyTarget;
}
