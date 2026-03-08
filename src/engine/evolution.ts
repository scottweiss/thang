import { GenerativeState, Mood } from '../types';
import { randomWalk } from './random';

// Chord change timing per mood (seconds) — faster harmonic rhythm for energetic moods
const CHORD_TIMING: Record<Mood, [number, number]> = {
  ambient: [25, 80],
  downtempo: [15, 45],
  lofi: [12, 35],
  trance: [8, 24],
};

const SCALE_CHANGE_MIN = 120;
const SCALE_CHANGE_MAX = 300;

export class EvolutionManager {
  private nextChordChange: number;
  private nextScaleChange: number;

  constructor() {
    const timing = CHORD_TIMING.downtempo;
    this.nextChordChange = this.randomBetween(timing[0], timing[1]);
    this.nextScaleChange = this.randomBetween(SCALE_CHANGE_MIN, SCALE_CHANGE_MAX);
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
      scaleChange = true;
      state.lastScaleChange = state.elapsed;
      this.nextScaleChange = this.randomBetween(SCALE_CHANGE_MIN, SCALE_CHANGE_MAX);
    }

    return { chordChange, scaleChange };
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
