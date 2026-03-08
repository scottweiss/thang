import { Section, Mood, GenerativeState } from '../types';

interface SectionConfig {
  activeLayers: string[];
  densityTarget: number;
  brightnessTarget: number;
  duration: [number, number]; // min, max seconds
}

const ALL_LAYERS = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];

// Section configurations per mood
const SECTION_CONFIGS: Record<Mood, Record<Section, SectionConfig>> = {
  ambient: {
    intro:     { activeLayers: ['drone', 'atmosphere'], densityTarget: 0.25, brightnessTarget: 0.3, duration: [15, 25] },
    build:     { activeLayers: ['drone', 'harmony', 'atmosphere', 'melody'], densityTarget: 0.4, brightnessTarget: 0.45, duration: [40, 80] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.6, brightnessTarget: 0.55, duration: [50, 100] },
    breakdown: { activeLayers: ['drone', 'harmony', 'atmosphere'], densityTarget: 0.3, brightnessTarget: 0.35, duration: [40, 70] },
    groove:    { activeLayers: ['drone', 'harmony', 'melody', 'arp', 'atmosphere'], densityTarget: 0.5, brightnessTarget: 0.5, duration: [50, 90] },
  },
  downtempo: {
    intro:     { activeLayers: ['drone', 'atmosphere'], densityTarget: 0.3, brightnessTarget: 0.35, duration: [16, 30] },
    build:     { activeLayers: ['drone', 'harmony', 'atmosphere', 'arp'], densityTarget: 0.45, brightnessTarget: 0.45, duration: [24, 45] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.65, brightnessTarget: 0.55, duration: [30, 60] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere'], densityTarget: 0.35, brightnessTarget: 0.4, duration: [20, 40] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.6, brightnessTarget: 0.5, duration: [30, 55] },
  },
  lofi: {
    intro:     { activeLayers: ['drone', 'atmosphere'], densityTarget: 0.3, brightnessTarget: 0.3, duration: [12, 24] },
    build:     { activeLayers: ['drone', 'harmony', 'texture', 'atmosphere'], densityTarget: 0.5, brightnessTarget: 0.4, duration: [20, 40] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.7, brightnessTarget: 0.5, duration: [30, 55] },
    breakdown: { activeLayers: ['drone', 'harmony', 'arp', 'atmosphere'], densityTarget: 0.35, brightnessTarget: 0.35, duration: [16, 30] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.65, brightnessTarget: 0.45, duration: [25, 50] },
  },
  trance: {
    intro:     { activeLayers: ['drone', 'atmosphere'], densityTarget: 0.3, brightnessTarget: 0.35, duration: [10, 20] },
    build:     { activeLayers: ['drone', 'harmony', 'arp', 'atmosphere'], densityTarget: 0.55, brightnessTarget: 0.55, duration: [16, 30] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.8, brightnessTarget: 0.7, duration: [25, 50] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere'], densityTarget: 0.35, brightnessTarget: 0.4, duration: [12, 24] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.75, brightnessTarget: 0.65, duration: [25, 45] },
  },
  avril: {
    intro:     { activeLayers: ['drone', 'atmosphere'], densityTarget: 0.2, brightnessTarget: 0.25, duration: [15, 25] },
    build:     { activeLayers: ['drone', 'harmony', 'atmosphere'], densityTarget: 0.35, brightnessTarget: 0.35, duration: [40, 70] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.5, brightnessTarget: 0.45, duration: [50, 80] },
    breakdown: { activeLayers: ['drone', 'harmony', 'atmosphere'], densityTarget: 0.25, brightnessTarget: 0.3, duration: [35, 60] },
    groove:    { activeLayers: ['drone', 'harmony', 'melody', 'arp', 'atmosphere'], densityTarget: 0.4, brightnessTarget: 0.4, duration: [45, 75] },
  },
  xtal: {
    intro:     { activeLayers: ['drone', 'atmosphere'], densityTarget: 0.2, brightnessTarget: 0.25, duration: [15, 30] },
    build:     { activeLayers: ['drone', 'harmony', 'atmosphere', 'texture'], densityTarget: 0.35, brightnessTarget: 0.35, duration: [40, 75] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.55, brightnessTarget: 0.5, duration: [55, 100] },
    breakdown: { activeLayers: ['drone', 'harmony', 'atmosphere'], densityTarget: 0.25, brightnessTarget: 0.3, duration: [40, 70] },
    groove:    { activeLayers: ['drone', 'harmony', 'texture', 'arp', 'atmosphere'], densityTarget: 0.45, brightnessTarget: 0.4, duration: [50, 90] },
  },
  syro: {
    intro:     { activeLayers: ['drone', 'atmosphere', 'arp'], densityTarget: 0.35, brightnessTarget: 0.4, duration: [10, 20] },
    build:     { activeLayers: ['drone', 'harmony', 'arp', 'texture', 'atmosphere'], densityTarget: 0.6, brightnessTarget: 0.55, duration: [14, 28] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.85, brightnessTarget: 0.75, duration: [22, 45] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere'], densityTarget: 0.4, brightnessTarget: 0.45, duration: [12, 22] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.8, brightnessTarget: 0.7, duration: [20, 40] },
  },
  blockhead: {
    intro:     { activeLayers: ['drone', 'atmosphere'], densityTarget: 0.3, brightnessTarget: 0.35, duration: [10, 20] },
    build:     { activeLayers: ['drone', 'harmony', 'texture', 'atmosphere', 'melody'], densityTarget: 0.5, brightnessTarget: 0.45, duration: [25, 50] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.7, brightnessTarget: 0.55, duration: [30, 60] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere'], densityTarget: 0.35, brightnessTarget: 0.4, duration: [20, 40] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.65, brightnessTarget: 0.5, duration: [30, 55] },
  },
  flim: {
    intro:     { activeLayers: ['drone', 'atmosphere'], densityTarget: 0.2, brightnessTarget: 0.25, duration: [12, 22] },
    build:     { activeLayers: ['drone', 'harmony', 'atmosphere', 'arp'], densityTarget: 0.35, brightnessTarget: 0.35, duration: [35, 55] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.55, brightnessTarget: 0.5, duration: [40, 65] },
    breakdown: { activeLayers: ['drone', 'harmony', 'atmosphere'], densityTarget: 0.25, brightnessTarget: 0.3, duration: [30, 50] },
    groove:    { activeLayers: ['drone', 'harmony', 'melody', 'arp', 'atmosphere'], densityTarget: 0.45, brightnessTarget: 0.4, duration: [35, 60] },
  },
  disco: {
    intro:     { activeLayers: ['drone', 'atmosphere', 'texture'], densityTarget: 0.35, brightnessTarget: 0.4, duration: [10, 18] },
    build:     { activeLayers: ['drone', 'harmony', 'texture', 'arp', 'atmosphere'], densityTarget: 0.6, brightnessTarget: 0.55, duration: [18, 35] },
    peak:      { activeLayers: ALL_LAYERS, densityTarget: 0.85, brightnessTarget: 0.7, duration: [25, 50] },
    breakdown: { activeLayers: ['drone', 'harmony', 'melody', 'atmosphere'], densityTarget: 0.4, brightnessTarget: 0.45, duration: [14, 25] },
    groove:    { activeLayers: ALL_LAYERS, densityTarget: 0.75, brightnessTarget: 0.65, duration: [25, 45] },
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

  constructor() {
    this.sectionDuration = 20; // will be recalculated on first evolve
  }

  evolve(state: GenerativeState, dt: number): void {
    this.sectionElapsed += dt;

    const config = SECTION_CONFIGS[state.mood][state.section];
    const progress = this.sectionElapsed / this.sectionDuration;

    // Determine interpolation rate based on section progress
    // Faster at start (settle into the feel) and near end (ramp toward next)
    let interpRate: number;
    if (progress < 0.2) {
      interpRate = 0.08; // fast settle at section start
    } else if (progress > 0.85) {
      interpRate = 0.06; // pre-transition ramp
    } else {
      interpRate = 0.04; // gentle mid-section drift
    }

    // Steer density and brightness toward section targets
    const densityDelta = (config.densityTarget - state.params.density) * interpRate;
    const brightnessDelta = (config.brightnessTarget - state.params.brightness) * interpRate;
    state.params.density = Math.max(0.15, Math.min(1.0, state.params.density + densityDelta));
    state.params.brightness = Math.max(0.1, Math.min(0.9, state.params.brightness + brightnessDelta));

    // Interpolate layer gain multipliers toward targets (smooth fade in/out)
    // Linear ramp: fade-in +0.33/tick = ~3 ticks (6s) to reach 1.0
    //              fade-out -0.5/tick = ~2 ticks (4s) to reach 0.0
    const FADE_IN_STEP = 0.33;
    const FADE_OUT_STEP = 0.5;
    const activeSet = new Set(config.activeLayers);
    for (const layerName of ALL_LAYERS) {
      const target = activeSet.has(layerName) ? 1.0 : 0.0;
      const current = state.layerGainMultipliers[layerName] ?? 0;
      if (target > current) {
        state.layerGainMultipliers[layerName] = Math.min(1, current + FADE_IN_STEP);
      } else if (target < current) {
        state.layerGainMultipliers[layerName] = Math.max(0, current - FADE_OUT_STEP);
      }
    }

    // Update active layers (includes layers still fading out)
    state.activeLayers = new Set(config.activeLayers);

    // Check if it's time to transition
    if (this.sectionElapsed >= this.sectionDuration) {
      this.advanceSection(state);
    }
  }

  private advanceSection(state: GenerativeState): void {
    this.sectionElapsed = 0;

    if (!this.pastIntro) {
      this.pastIntro = true;
      this.currentIndex = 0;
    } else {
      // Usually follow the cycle, but occasionally skip breakdown → groove
      // to keep things unpredictable
      const currentSection = CYCLE_ORDER[this.currentIndex];
      if (currentSection === 'peak' && Math.random() < 0.25) {
        // 25% chance to skip breakdown and go straight to groove
        this.currentIndex = (this.currentIndex + 2) % CYCLE_ORDER.length;
      } else if (currentSection === 'groove' && Math.random() < 0.2) {
        // 20% chance to skip build and go straight to peak
        this.currentIndex = (this.currentIndex + 2) % CYCLE_ORDER.length;
      } else {
        this.currentIndex = (this.currentIndex + 1) % CYCLE_ORDER.length;
      }
    }

    const nextSection = this.pastIntro
      ? CYCLE_ORDER[this.currentIndex]
      : SECTION_ORDER[0];

    state.section = nextSection;
    state.sectionChanged = true;

    const config = SECTION_CONFIGS[state.mood][nextSection];
    this.sectionDuration = this.randomBetween(config.duration[0], config.duration[1]);

    state.activeLayers = new Set(config.activeLayers);
  }

  forceAdvance(state: GenerativeState): void {
    this.advanceSection(state);
  }

  reset(mood: Mood): void {
    this.pastIntro = false;
    this.currentIndex = 0;
    this.sectionElapsed = 0;
    const config = SECTION_CONFIGS[mood].intro;
    this.sectionDuration = this.randomBetween(config.duration[0], config.duration[1]);
  }

  getIntroLayers(mood: Mood): string[] {
    return SECTION_CONFIGS[mood].intro.activeLayers;
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
