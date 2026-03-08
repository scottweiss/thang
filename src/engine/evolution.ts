import { GenerativeState, Mood } from '../types';
import { randomWalk } from './random';

// Chord change timing per mood (seconds) — faster harmonic rhythm for energetic moods
const CHORD_TIMING: Record<Mood, [number, number]> = {
  ambient: [25, 80],
  downtempo: [15, 45],
  lofi: [12, 35],
  trance: [8, 24],
  avril: [20, 60],
  xtal: [18, 50],
  syro: [6, 20],
  blockhead: [12, 40],
  flim: [15, 45],
  disco: [10, 30],
};

// Scale modulation timing per mood — trance modulates often, ambient/avril stay put
const SCALE_TIMING: Record<Mood, [number, number]> = {
  ambient: [180, 400],
  downtempo: [120, 280],
  lofi: [100, 240],
  trance: [80, 180],
  avril: [200, 450],
  xtal: [150, 350],
  syro: [70, 160],
  blockhead: [100, 250],
  flim: [120, 300],
  disco: [90, 200],
};

export class EvolutionManager {
  private nextChordChange: number;
  private nextScaleChange: number;

  constructor() {
    const timing = CHORD_TIMING.downtempo;
    this.nextChordChange = this.randomBetween(timing[0], timing[1]);
    const scaleTiming = SCALE_TIMING.downtempo;
    this.nextScaleChange = this.randomBetween(scaleTiming[0], scaleTiming[1]);
  }

  evolve(state: GenerativeState, dt: number): { chordChange: boolean; scaleChange: boolean } {
    state.elapsed += dt;

    // Gentle spaciousness drift only — density and brightness are steered by section manager
    state.params.spaciousness = randomWalk(state.params.spaciousness, 0.01, 0.3, 1.0);

    const timeSinceChord = state.elapsed - state.lastChordChange;
    const timeSinceScale = state.elapsed - state.lastScaleChange;

    let chordChange = false;
    let scaleChange = false;

    if (timeSinceChord >= this.nextChordChange) {
      chordChange = true;
      state.lastChordChange = state.elapsed;
      const timing = CHORD_TIMING[state.mood];
      this.nextChordChange = this.randomBetween(timing[0], timing[1]);
    }

    if (timeSinceScale >= this.nextScaleChange) {
      // Prefer modulating during breakdowns (natural resting point) —
      // defer by up to 30s if we're not in breakdown or build
      if (state.section === 'breakdown' || state.section === 'build' ||
          timeSinceScale >= this.nextScaleChange + 30) {
        scaleChange = true;
        state.lastScaleChange = state.elapsed;
        const scaleTiming = SCALE_TIMING[state.mood];
        this.nextScaleChange = this.randomBetween(scaleTiming[0], scaleTiming[1]);
      }
    }

    return { chordChange, scaleChange };
  }

  resetTimings(mood: Mood): void {
    const timing = CHORD_TIMING[mood];
    this.nextChordChange = this.randomBetween(timing[0], timing[1]);
    const scaleTiming = SCALE_TIMING[mood];
    this.nextScaleChange = this.randomBetween(scaleTiming[0], scaleTiming[1]);
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
