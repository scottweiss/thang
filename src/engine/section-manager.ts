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
    intro:     { activeLayers: ['drone', 'atmosphere'], densityTarget: 0.25, brightnessTarget: 0.3, duration: [30, 50] },
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

    // Gently steer density and brightness toward section targets
    const densityDelta = (config.densityTarget - state.params.density) * 0.03;
    const brightnessDelta = (config.brightnessTarget - state.params.brightness) * 0.03;
    state.params.density = Math.max(0.15, Math.min(1.0, state.params.density + densityDelta));
    state.params.brightness = Math.max(0.1, Math.min(0.9, state.params.brightness + brightnessDelta));

    // Update active layers
    state.activeLayers = new Set(config.activeLayers);

    // Check if it's time to transition
    if (this.sectionElapsed >= this.sectionDuration) {
      this.advanceSection(state);
    }
  }

  private advanceSection(state: GenerativeState): void {
    this.sectionElapsed = 0;

    if (!this.pastIntro) {
      // Move from intro to build
      this.pastIntro = true;
      this.currentIndex = 0; // index into CYCLE_ORDER
    } else {
      this.currentIndex = (this.currentIndex + 1) % CYCLE_ORDER.length;
    }

    const nextSection = this.pastIntro
      ? CYCLE_ORDER[this.currentIndex]
      : SECTION_ORDER[0];

    state.section = nextSection;
    state.sectionChanged = true;

    // Set duration for the new section
    const config = SECTION_CONFIGS[state.mood][nextSection];
    this.sectionDuration = this.randomBetween(config.duration[0], config.duration[1]);

    // Update active layers immediately
    state.activeLayers = new Set(config.activeLayers);
  }

  reset(mood: Mood): void {
    // On mood change, restart from intro
    this.pastIntro = false;
    this.currentIndex = 0;
    this.sectionElapsed = 0;
    const config = SECTION_CONFIGS[mood].intro;
    this.sectionDuration = this.randomBetween(config.duration[0], config.duration[1]);
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
