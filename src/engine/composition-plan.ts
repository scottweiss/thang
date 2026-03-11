/**
 * Composition Plan — macro-level musical architecture.
 *
 * Generates a pre-planned structure for an entire piece (5-10 minutes),
 * including section sequence, harmonic regions, motif seeds, and energy arc.
 * Biases existing Markov chains, tension, and key modulation rather than
 * replacing them — every field is advisory.
 */

import type { Mood, Section, NoteName, ScaleType } from '../types';

// ---- Interfaces ----

export interface HarmonicRegion {
  root: NoteName;
  scaleType: ScaleType;
  relationship: 'home' | 'dominant' | 'subdominant' | 'relative' | 'parallel' | 'chromatic';
}

export interface MotifSeed {
  /** Interval pattern in scale degrees */
  intervals: number[];
  density: 'sparse' | 'moderate' | 'dense';
  contour: 'ascending' | 'descending' | 'arch' | 'valley';
  id: string;
}

export interface PlannedSection {
  section: Section;
  /** Approximate duration in ticks (~2s per tick) */
  durationTicks: number;
  harmonicRegion: HarmonicRegion;
  activeMotifs: string[];
  motifTreatment: 'introduce' | 'develop' | 'fragment' | 'recall' | 'augment' | 'none';
  /** Target energy 0-1 */
  energyTarget: number;
  isClimax: boolean;
  isResolution: boolean;
}

export interface CompositionPlan {
  homeKey: { root: NoteName; scaleType: ScaleType };
  sections: PlannedSection[];
  motifSeeds: MotifSeed[];
  currentSectionIndex: number;
  ticksInCurrentSection: number;
  totalDurationTicks: number;
  isComplete: boolean;
}

// ---- Mood-specific section archetypes ----

const COMPOSITION_ARCHETYPES: Record<Mood, Section[]> = {
  trance:    ['intro', 'build', 'build', 'peak', 'breakdown', 'build', 'peak', 'breakdown', 'groove'],
  ambient:   ['intro', 'groove', 'build', 'groove', 'breakdown', 'groove', 'breakdown'],
  lofi:      ['intro', 'build', 'groove', 'build', 'peak', 'breakdown', 'groove', 'build', 'peak', 'breakdown', 'groove'],
  syro:      ['intro', 'peak', 'breakdown', 'build', 'groove', 'peak', 'build', 'breakdown', 'groove'],
  downtempo: ['intro', 'build', 'groove', 'build', 'peak', 'breakdown', 'groove'],
  avril:     ['intro', 'build', 'groove', 'peak', 'breakdown', 'build', 'peak', 'groove'],
  xtal:      ['intro', 'build', 'peak', 'groove', 'breakdown', 'build', 'peak', 'breakdown', 'groove'],
  blockhead: ['intro', 'build', 'peak', 'groove', 'breakdown', 'peak', 'groove'],
  flim:      ['intro', 'build', 'groove', 'build', 'peak', 'breakdown', 'groove'],
  disco:     ['intro', 'build', 'peak', 'groove', 'build', 'peak', 'groove', 'breakdown', 'groove'],
};

// Duration ranges per section type in ticks (~2s each)
const SECTION_DURATION_RANGES: Record<Section, [number, number]> = {
  intro:     [8, 15],
  build:     [12, 25],
  peak:      [15, 30],
  breakdown: [10, 20],
  groove:    [15, 30],
};

// Mood pacing multiplier (slower moods get longer sections)
const MOOD_PACING: Record<Mood, number> = {
  ambient: 1.6, avril: 1.4, xtal: 1.3, flim: 1.2,
  downtempo: 1.1, lofi: 1.0, blockhead: 0.9,
  disco: 0.85, trance: 0.85, syro: 0.75,
};

// Energy targets by section type
const SECTION_ENERGY: Record<Section, number> = {
  intro: 0.2, build: 0.5, peak: 0.9, breakdown: 0.3, groove: 0.65,
};

// ---- Key relationships ----

const NOTE_NAMES_ARRAY: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteIndex(note: NoteName): number {
  const map: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  };
  return map[note] ?? 0;
}

function noteAt(semitones: number): NoteName {
  return NOTE_NAMES_ARRAY[((semitones % 12) + 12) % 12];
}

function getDominantRoot(root: NoteName): NoteName {
  return noteAt(noteIndex(root) + 7);
}

function getSubdominantRoot(root: NoteName): NoteName {
  return noteAt(noteIndex(root) + 5);
}

function getRelativeRoot(root: NoteName, scaleType: ScaleType): NoteName {
  const isMinor = scaleType === 'minor' || scaleType === 'aeolian' || scaleType === 'dorian'
    || scaleType === 'phrygian' || scaleType === 'minor_pentatonic';
  // Relative major is +3 from minor, relative minor is -3 from major
  return noteAt(noteIndex(root) + (isMinor ? 3 : -3));
}

function getParallelScaleType(scaleType: ScaleType): ScaleType {
  const isMinor = scaleType === 'minor' || scaleType === 'aeolian' || scaleType === 'dorian'
    || scaleType === 'phrygian' || scaleType === 'minor_pentatonic';
  return isMinor ? 'major' : 'minor';
}

function isMinorScale(scaleType: ScaleType): boolean {
  return scaleType === 'minor' || scaleType === 'aeolian' || scaleType === 'dorian'
    || scaleType === 'phrygian' || scaleType === 'minor_pentatonic';
}

// ---- Harmonic region assignment ----

function assignHarmonicRegion(
  section: Section,
  sectionIdx: number,
  totalSections: number,
  homeRoot: NoteName,
  homeScaleType: ScaleType,
): HarmonicRegion {
  const progress = sectionIdx / totalSections;
  const home: HarmonicRegion = { root: homeRoot, scaleType: homeScaleType, relationship: 'home' };

  // First and last sections always home
  if (sectionIdx === 0 || sectionIdx >= totalSections - 1) return home;

  switch (section) {
    case 'intro':
      return home;

    case 'build': {
      // Builds move toward dominant area or stay home
      if (progress > 0.3 && progress < 0.7) {
        return {
          root: getDominantRoot(homeRoot),
          scaleType: homeScaleType,
          relationship: 'dominant',
        };
      }
      return home;
    }

    case 'peak': {
      // First peak: subdominant for brightness. Second peak (climax): contrasting key
      if (progress > 0.6) {
        // Climax: parallel key for maximum contrast
        return {
          root: homeRoot,
          scaleType: getParallelScaleType(homeScaleType),
          relationship: 'parallel',
        };
      }
      return {
        root: getSubdominantRoot(homeRoot),
        scaleType: homeScaleType,
        relationship: 'subdominant',
      };
    }

    case 'breakdown': {
      // Breakdowns: relative key for warmth/nostalgia
      const relRoot = getRelativeRoot(homeRoot, homeScaleType);
      const relType = isMinorScale(homeScaleType) ? 'major' : 'minor';
      return {
        root: relRoot,
        scaleType: relType as ScaleType,
        relationship: 'relative',
      };
    }

    case 'groove':
      // Grooves mostly home, occasionally subdominant
      if (progress > 0.4 && progress < 0.6 && Math.random() < 0.3) {
        return {
          root: getSubdominantRoot(homeRoot),
          scaleType: homeScaleType,
          relationship: 'subdominant',
        };
      }
      return home;

    default:
      return home;
  }
}

// ---- Motif seed generation ----

const MOOD_MOTIF_CONFIG: Record<Mood, { density: MotifSeed['density']; contours: MotifSeed['contour'][] }> = {
  ambient:   { density: 'sparse',   contours: ['arch', 'valley'] },
  downtempo: { density: 'moderate', contours: ['arch', 'descending'] },
  lofi:      { density: 'moderate', contours: ['arch', 'descending', 'valley'] },
  trance:    { density: 'dense',    contours: ['ascending', 'arch'] },
  avril:     { density: 'sparse',   contours: ['arch', 'ascending'] },
  xtal:      { density: 'moderate', contours: ['valley', 'arch'] },
  syro:      { density: 'dense',    contours: ['descending', 'ascending', 'valley'] },
  blockhead: { density: 'moderate', contours: ['descending', 'arch'] },
  flim:      { density: 'moderate', contours: ['arch', 'valley'] },
  disco:     { density: 'dense',    contours: ['ascending', 'arch'] },
};

function generateMotifSeeds(mood: Mood): MotifSeed[] {
  const config = MOOD_MOTIF_CONFIG[mood];

  // Generate 2-3 motif seeds
  const count = mood === 'ambient' ? 2 : 3;
  const seeds: MotifSeed[] = [];

  for (let i = 0; i < count; i++) {
    const contour = config.contours[i % config.contours.length];
    const len = config.density === 'sparse' ? 3 : config.density === 'moderate' ? 4 : 5;

    // Generate interval pattern based on contour
    const intervals: number[] = [0];
    for (let j = 1; j < len; j++) {
      const step = Math.floor(Math.random() * 3) + 1; // 1-3 scale steps
      switch (contour) {
        case 'ascending':
          intervals.push(intervals[j - 1] + step);
          break;
        case 'descending':
          intervals.push(intervals[j - 1] - step);
          break;
        case 'arch':
          intervals.push(intervals[j - 1] + (j < len / 2 ? step : -step));
          break;
        case 'valley':
          intervals.push(intervals[j - 1] + (j < len / 2 ? -step : step));
          break;
      }
    }

    seeds.push({
      intervals,
      density: config.density,
      contour,
      id: String.fromCharCode(65 + i), // A, B, C
    });
  }

  return seeds;
}

// ---- Motif treatment assignment ----

function assignMotifTreatment(
  sectionIdx: number,
  totalSections: number,
  section: Section,
): { treatment: PlannedSection['motifTreatment']; activeMotifs: string[] } {
  const progress = sectionIdx / totalSections;

  // First section: no motifs yet
  if (sectionIdx === 0) {
    return { treatment: 'none', activeMotifs: [] };
  }

  // Early sections: introduce motif A
  if (progress < 0.25) {
    return { treatment: 'introduce', activeMotifs: ['A'] };
  }

  // Middle sections: develop A, introduce B
  if (progress < 0.5) {
    if (section === 'peak' || section === 'groove') {
      return { treatment: 'develop', activeMotifs: ['A', 'B'] };
    }
    return { treatment: 'introduce', activeMotifs: ['B'] };
  }

  // Late climax: fragment and recall
  if (progress < 0.8) {
    if (section === 'peak') {
      return { treatment: 'augment', activeMotifs: ['A', 'B'] };
    }
    if (section === 'breakdown') {
      return { treatment: 'fragment', activeMotifs: ['A'] };
    }
    return { treatment: 'develop', activeMotifs: ['A', 'B'] };
  }

  // Final sections: recall for closure
  return { treatment: 'recall', activeMotifs: ['A'] };
}

// ---- Plan generation ----

export function generateCompositionPlan(
  mood: Mood,
  homeRoot: NoteName,
  homeScaleType: ScaleType,
): CompositionPlan {
  const archetype = COMPOSITION_ARCHETYPES[mood];
  const pacing = MOOD_PACING[mood];
  const motifSeeds = generateMotifSeeds(mood);

  // Find the last peak for climax marking
  let lastPeakIdx = -1;
  for (let i = archetype.length - 1; i >= 0; i--) {
    if (archetype[i] === 'peak') { lastPeakIdx = i; break; }
  }

  const sections: PlannedSection[] = archetype.map((section, idx) => {
    const [minTicks, maxTicks] = SECTION_DURATION_RANGES[section];
    const durationTicks = Math.round(
      (minTicks + Math.random() * (maxTicks - minTicks)) * pacing
    );

    const harmonicRegion = assignHarmonicRegion(
      section, idx, archetype.length, homeRoot, homeScaleType
    );

    const { treatment, activeMotifs } = assignMotifTreatment(
      idx, archetype.length, section
    );

    // Energy target: base from section type, modulated by position
    const progress = idx / archetype.length;
    let energyTarget = SECTION_ENERGY[section];
    // Rising energy through the piece
    energyTarget *= 0.8 + progress * 0.4;
    energyTarget = Math.min(1.0, energyTarget);

    const isClimax = idx === lastPeakIdx;
    const isResolution = idx === archetype.length - 1
      || (section === 'groove' && idx > archetype.length * 0.75);

    return {
      section,
      durationTicks,
      harmonicRegion,
      activeMotifs,
      motifTreatment: treatment,
      energyTarget,
      isClimax,
      isResolution,
    };
  });

  const totalDurationTicks = sections.reduce((sum, s) => sum + s.durationTicks, 0);

  return {
    homeKey: { root: homeRoot, scaleType: homeScaleType },
    sections,
    motifSeeds,
    currentSectionIndex: 0,
    ticksInCurrentSection: 0,
    totalDurationTicks,
    isComplete: false,
  };
}

// ---- Accessors ----

export function getCurrentPlannedSection(plan: CompositionPlan): PlannedSection {
  const idx = Math.min(plan.currentSectionIndex, plan.sections.length - 1);
  return plan.sections[idx];
}

/**
 * Advance the plan to the next section. Called when section manager transitions.
 */
export function advancePlanSection(plan: CompositionPlan): void {
  if (plan.currentSectionIndex < plan.sections.length - 1) {
    plan.currentSectionIndex++;
    plan.ticksInCurrentSection = 0;
  } else {
    plan.isComplete = true;
  }
}

/**
 * Section preference weights for biasing the section manager's Markov chain.
 * The planned next section gets a strong boost; others get dampened.
 */
export function planSectionPreference(plan: CompositionPlan): Partial<Record<Section, number>> {
  if (plan.isComplete || plan.currentSectionIndex >= plan.sections.length - 1) {
    return {};
  }

  const nextPlanned = plan.sections[plan.currentSectionIndex + 1];
  const weights: Partial<Record<Section, number>> = {};
  const allSections: Section[] = ['intro', 'build', 'peak', 'breakdown', 'groove'];

  for (const s of allSections) {
    weights[s] = s === nextPlanned.section ? 5.0 : 0.2;
  }

  return weights;
}

/**
 * Harmonic bias for chord selection based on the planned harmonic region.
 * Returns a multiplier for each scale degree.
 */
export function planHarmonicBias(plan: CompositionPlan | undefined, degree: number): number {
  if (!plan || plan.isComplete) return 1.0;

  const current = getCurrentPlannedSection(plan);
  const rel = current.harmonicRegion.relationship;

  // Bias toward chords that fit the planned region
  switch (rel) {
    case 'home':
      // Favor tonic area: I, IV, V
      if (degree === 0) return 1.3;
      if (degree === 3 || degree === 4) return 1.15;
      return 1.0;

    case 'dominant':
      // Favor V and chords leading to V
      if (degree === 4) return 1.4;
      if (degree === 1 || degree === 6) return 1.2; // ii, vii -> V
      return 0.9;

    case 'subdominant':
      // Favor IV and ii
      if (degree === 3) return 1.4;
      if (degree === 1) return 1.2;
      return 0.95;

    case 'relative':
      // Favor vi (relative minor from major) or III (relative major from minor)
      if (degree === 5) return 1.3; // vi
      if (degree === 2) return 1.2; // iii
      return 1.0;

    case 'parallel':
      // More chromatic, favor borrowed chords
      if (degree === 3 || degree === 5) return 1.2; // bVI, bVII in parallel minor
      return 1.0;

    case 'chromatic':
      // No strong bias — let Markov surprise
      return 1.0;

    default:
      return 1.0;
  }
}

/**
 * Tension ceiling from the composition plan.
 * Climax sections allow full tension; early sections cap it.
 */
export function planTensionCeiling(plan: CompositionPlan): number {
  if (plan.isComplete) return 0.7;

  const current = getCurrentPlannedSection(plan);

  if (current.isClimax) return 1.0;

  // Energy target drives tension ceiling — generous to avoid over-constraining
  // The form trajectory already provides its own ceiling, so this is a soft guide
  return Math.max(0.6, current.energyTarget + 0.25);
}

/**
 * Dynamic arc gain multiplier from the plan.
 * Climax sections are loudest; intro/resolution are softer.
 */
export function planGainMultiplier(plan: CompositionPlan): number {
  if (plan.isComplete) return 0.85;

  const current = getCurrentPlannedSection(plan);

  if (current.isClimax) return 1.1;
  if (current.isResolution) return 0.9;

  // Map energy target to gain: 0.85-1.05
  return 0.85 + current.energyTarget * 0.2;
}

/**
 * Get the overall progress through the composition (0-1).
 */
export function planProgress(plan: CompositionPlan): number {
  let elapsed = 0;
  for (let i = 0; i < plan.currentSectionIndex; i++) {
    elapsed += plan.sections[i].durationTicks;
  }
  elapsed += plan.ticksInCurrentSection;
  return Math.min(1.0, elapsed / plan.totalDurationTicks);
}
