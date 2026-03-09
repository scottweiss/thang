import { Section, Mood, GenerativeState } from '../types';
import { layerFadeInRate, layerFadeOutRate } from '../theory/layer-stagger';
import { shouldAdvanceEarly } from '../theory/section-timing';
import { selectNextSection } from '../theory/form-structure';
import { sectionPreference, type TrajectoryState } from '../theory/form-trajectory';

interface SectionConfig {
  activeLayers: string[];
  densityTarget: number;
  brightnessTarget: number;
  spaciousnessTarget: number;
  duration: [number, number]; // min, max seconds
}

const ALL_LAYERS = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];

// Section configurations per mood
const SECTION_CONFIGS: Record<Mood, Record<Section, SectionConfig>> = {
  ambient: {
    intro:     { activeLayers: ['drone', 'atmosphere'], densityTarget: 0.25, brightnessTarget: 0.25, spaciousnessTarget: 0.85, duration: [15, 25] },
    build:     { activeLayers: ['drone', 'harmony', 'atmosphere', 'melody'], densityTarget: 0.4, brightnessTarget: 0.45, spaciousnessTarget: 0.7, duration: [30, 55] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.6, brightnessTarget: 0.65, spaciousnessTarget: 0.75, duration: [40, 75] },
    breakdown: { activeLayers: ['drone', 'harmony', 'atmosphere'], densityTarget: 0.3, brightnessTarget: 0.30, spaciousnessTarget: 0.9, duration: [30, 55] },
    groove:    { activeLayers: ['drone', 'harmony', 'melody', 'arp', 'atmosphere'], densityTarget: 0.5, brightnessTarget: 0.50, spaciousnessTarget: 0.8, duration: [40, 70] },
  },
  downtempo: {
    intro:     { activeLayers: ['drone', 'harmony', 'atmosphere'], densityTarget: 0.3, brightnessTarget: 0.30, spaciousnessTarget: 0.8, duration: [16, 30] },
    build:     { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere', 'arp'], densityTarget: 0.45, brightnessTarget: 0.45, spaciousnessTarget: 0.65, duration: [24, 45] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.65, brightnessTarget: 0.65, spaciousnessTarget: 0.7, duration: [30, 60] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere'], densityTarget: 0.35, brightnessTarget: 0.35, spaciousnessTarget: 0.85, duration: [20, 40] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.6, brightnessTarget: 0.55, spaciousnessTarget: 0.75, duration: [30, 55] },
  },
  lofi: {
    intro:     { activeLayers: ['drone', 'harmony', 'atmosphere'], densityTarget: 0.3, brightnessTarget: 0.25, spaciousnessTarget: 0.7, duration: [12, 24] },
    build:     { activeLayers: ['drone', 'harmony', 'melody', 'texture', 'atmosphere'], densityTarget: 0.5, brightnessTarget: 0.40, spaciousnessTarget: 0.55, duration: [20, 40] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.7, brightnessTarget: 0.60, spaciousnessTarget: 0.6, duration: [30, 55] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere'], densityTarget: 0.35, brightnessTarget: 0.30, spaciousnessTarget: 0.75, duration: [16, 30] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.65, brightnessTarget: 0.50, spaciousnessTarget: 0.65, duration: [25, 50] },
  },
  trance: {
    intro:     { activeLayers: ['drone', 'atmosphere', 'texture'], densityTarget: 0.3, brightnessTarget: 0.30, spaciousnessTarget: 0.7, duration: [10, 20] },
    build:     { activeLayers: ['drone', 'harmony', 'texture', 'arp', 'atmosphere'], densityTarget: 0.55, brightnessTarget: 0.55, spaciousnessTarget: 0.5, duration: [25, 45] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.8, brightnessTarget: 0.80, spaciousnessTarget: 0.55, duration: [25, 50] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere'], densityTarget: 0.35, brightnessTarget: 0.35, spaciousnessTarget: 0.8, duration: [16, 30] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.75, brightnessTarget: 0.70, spaciousnessTarget: 0.6, duration: [25, 45] },
  },
  avril: {
    intro:     { activeLayers: ['drone', 'harmony', 'atmosphere'], densityTarget: 0.2, brightnessTarget: 0.20, spaciousnessTarget: 0.85, duration: [15, 25] },
    build:     { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere'], densityTarget: 0.35, brightnessTarget: 0.35, spaciousnessTarget: 0.75, duration: [40, 70] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.5, brightnessTarget: 0.55, spaciousnessTarget: 0.8, duration: [50, 80] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere'], densityTarget: 0.25, brightnessTarget: 0.25, spaciousnessTarget: 0.9, duration: [35, 60] },
    groove:    { activeLayers: ['drone', 'harmony', 'melody', 'arp', 'atmosphere'], densityTarget: 0.4, brightnessTarget: 0.45, spaciousnessTarget: 0.8, duration: [45, 75] },
  },
  xtal: {
    intro:     { activeLayers: ['drone', 'harmony', 'atmosphere'], densityTarget: 0.2, brightnessTarget: 0.20, spaciousnessTarget: 0.9, duration: [15, 30] },
    build:     { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere', 'texture'], densityTarget: 0.35, brightnessTarget: 0.35, spaciousnessTarget: 0.8, duration: [40, 75] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.55, brightnessTarget: 0.60, spaciousnessTarget: 0.85, duration: [55, 100] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere', 'arp'], densityTarget: 0.25, brightnessTarget: 0.25, spaciousnessTarget: 0.95, duration: [40, 70] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.45, brightnessTarget: 0.45, spaciousnessTarget: 0.85, duration: [50, 90] },
  },
  syro: {
    intro:     { activeLayers: ['drone', 'atmosphere', 'arp'], densityTarget: 0.35, brightnessTarget: 0.35, spaciousnessTarget: 0.55, duration: [10, 20] },
    build:     { activeLayers: ['drone', 'harmony', 'arp', 'texture', 'atmosphere'], densityTarget: 0.6, brightnessTarget: 0.55, spaciousnessTarget: 0.4, duration: [14, 28] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.85, brightnessTarget: 0.80, spaciousnessTarget: 0.45, duration: [22, 45] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere'], densityTarget: 0.4, brightnessTarget: 0.40, spaciousnessTarget: 0.65, duration: [12, 22] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.8, brightnessTarget: 0.70, spaciousnessTarget: 0.5, duration: [20, 40] },
  },
  blockhead: {
    intro:     { activeLayers: ['drone', 'atmosphere', 'texture'], densityTarget: 0.3, brightnessTarget: 0.30, spaciousnessTarget: 0.7, duration: [10, 20] },
    build:     { activeLayers: ['drone', 'harmony', 'texture', 'atmosphere', 'melody'], densityTarget: 0.5, brightnessTarget: 0.45, spaciousnessTarget: 0.55, duration: [25, 50] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.7, brightnessTarget: 0.65, spaciousnessTarget: 0.6, duration: [30, 60] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'texture', 'atmosphere'], densityTarget: 0.35, brightnessTarget: 0.35, spaciousnessTarget: 0.75, duration: [20, 40] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.65, brightnessTarget: 0.55, spaciousnessTarget: 0.65, duration: [30, 55] },
  },
  flim: {
    intro:     { activeLayers: ['drone', 'atmosphere', 'arp'], densityTarget: 0.2, brightnessTarget: 0.20, spaciousnessTarget: 0.85, duration: [12, 22] },
    build:     { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere', 'arp'], densityTarget: 0.35, brightnessTarget: 0.35, spaciousnessTarget: 0.75, duration: [35, 55] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.55, brightnessTarget: 0.60, spaciousnessTarget: 0.8, duration: [40, 65] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere', 'arp'], densityTarget: 0.25, brightnessTarget: 0.25, spaciousnessTarget: 0.9, duration: [30, 50] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.45, brightnessTarget: 0.45, spaciousnessTarget: 0.8, duration: [35, 60] },
  },
  disco: {
    intro:     { activeLayers: ['drone', 'atmosphere', 'texture'], densityTarget: 0.35, brightnessTarget: 0.35, spaciousnessTarget: 0.65, duration: [10, 18] },
    build:     { activeLayers: ['drone', 'harmony', 'texture', 'arp', 'atmosphere'], densityTarget: 0.6, brightnessTarget: 0.55, spaciousnessTarget: 0.5, duration: [18, 35] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.85, brightnessTarget: 0.80, spaciousnessTarget: 0.55, duration: [25, 50] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere'], densityTarget: 0.4, brightnessTarget: 0.40, spaciousnessTarget: 0.75, duration: [14, 25] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.75, brightnessTarget: 0.70, spaciousnessTarget: 0.6, duration: [25, 45] },
  },
};

// Section flow: intro → build → peak → breakdown → groove → build → ...
const SECTION_ORDER: Section[] = ['intro', 'build', 'peak', 'breakdown', 'groove'];
const CYCLE_ORDER: Section[] = ['build', 'peak', 'breakdown', 'groove'];

export class SectionManager {
  private sectionElapsed = 0;
  private sectionDuration: number;
  private currentIndex = 0;
  private pastIntro = false;
  private cycleCount = 0;   // how many full cycles we've completed

  constructor() {
    this.sectionDuration = 20; // will be recalculated on first evolve
  }

  evolve(state: GenerativeState, dt: number, trajectory?: TrajectoryState): void {
    this.sectionElapsed += dt;

    const config = SECTION_CONFIGS[state.mood][state.section];
    const progress = this.sectionElapsed / this.sectionDuration;

    // Determine interpolation rate based on section progress and mood character
    // Faster at start (settle into the feel) and near end (ramp toward next)
    // Dreamy moods drift slowly, energetic moods snap into the feel
    const moodInterpScale: Record<Mood, number> = {
      ambient: 0.6, avril: 0.65, xtal: 0.7, flim: 0.7,
      downtempo: 0.85, lofi: 0.85,
      blockhead: 1.0, trance: 1.2, disco: 1.2, syro: 1.3,
    };
    const moodScale = moodInterpScale[state.mood] ?? 1.0;
    let interpRate: number;
    if (progress < 0.2) {
      interpRate = 0.08 * moodScale; // fast settle at section start
    } else if (progress > 0.85) {
      interpRate = 0.06 * moodScale; // pre-transition ramp
    } else {
      interpRate = 0.04 * moodScale; // gentle mid-section drift
    }

    // Steer density, brightness, and spaciousness toward section targets
    const densityDelta = (config.densityTarget - state.params.density) * interpRate;
    const brightnessDelta = (config.brightnessTarget - state.params.brightness) * interpRate;
    const spaciousnessDelta = (config.spaciousnessTarget - state.params.spaciousness) * interpRate;
    state.params.density = Math.max(0.15, Math.min(1.0, state.params.density + densityDelta));
    state.params.brightness = Math.max(0.1, Math.min(0.9, state.params.brightness + brightnessDelta));
    state.params.spaciousness = Math.max(0.2, Math.min(0.95, state.params.spaciousness + spaciousnessDelta));

    // Interpolate layer gain multipliers toward targets (smooth fade in/out)
    // Per-layer stagger: drums enter first, melody enters last — like a real arrangement
    const activeSet = new Set(config.activeLayers);
    for (const layerName of ALL_LAYERS) {
      const target = activeSet.has(layerName) ? 1.0 : 0.0;
      const current = state.layerGainMultipliers[layerName] ?? 0;
      if (target > current) {
        const fadeIn = layerFadeInRate(layerName);
        state.layerGainMultipliers[layerName] = Math.min(1, current + fadeIn);
      } else if (target < current) {
        const fadeOut = layerFadeOutRate(layerName);
        state.layerGainMultipliers[layerName] = Math.max(0, current - fadeOut);
      }
    }

    // Update active layers (includes layers still fading out)
    state.activeLayers = new Set(config.activeLayers);

    // Check if it's time to transition
    // Tension-responsive: high tension builds resolve sooner, relaxed grooves linger
    const tension = state.tension?.overall ?? 0.5;
    if (this.sectionElapsed >= this.sectionDuration) {
      this.advanceSection(state, trajectory);
    } else if (shouldAdvanceEarly(state.section, progress, tension)) {
      this.advanceSection(state, trajectory);
    }
  }

  private advanceSection(state: GenerativeState, trajectory?: TrajectoryState): void {
    this.sectionElapsed = 0;

    let nextSection: Section;

    if (!this.pastIntro) {
      this.pastIntro = true;
      nextSection = 'build';
    } else {
      // Use mood-aware form structure for transition decisions
      const previousSection = state.section;
      const formPref = trajectory ? sectionPreference(trajectory) : undefined;
      nextSection = selectNextSection(state.mood, previousSection, this.cycleCount, formPref);

      // Track cycle completions (groove→build/peak = new cycle)
      if (previousSection === 'groove' && (nextSection === 'build' || nextSection === 'peak')) {
        this.cycleCount++;
      }
    }

    // Track current index for compatibility
    const idx = CYCLE_ORDER.indexOf(nextSection);
    if (idx >= 0) this.currentIndex = idx;

    state.section = nextSection;
    state.sectionChanged = true;

    const config = SECTION_CONFIGS[state.mood][nextSection];
    this.sectionDuration = this.randomBetween(config.duration[0], config.duration[1]);

    state.activeLayers = new Set(config.activeLayers);
  }

  forceAdvance(state: GenerativeState, trajectory?: TrajectoryState): void {
    this.advanceSection(state, trajectory);
  }

  reset(mood: Mood): void {
    this.pastIntro = false;
    this.currentIndex = 0;
    this.cycleCount = 0;
    this.sectionElapsed = 0;
    const config = SECTION_CONFIGS[mood].intro;
    this.sectionDuration = this.randomBetween(config.duration[0], config.duration[1]);
  }

  getIntroLayers(mood: Mood): string[] {
    return SECTION_CONFIGS[mood].intro.activeLayers;
  }

  /** Returns how far through the current section we are (0-1) */
  getSectionProgress(): number {
    return Math.min(1, this.sectionElapsed / this.sectionDuration);
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
