import { GenerativeState } from '../types';
import { randomWalk } from './random';

// Time constants (in seconds)
const CHORD_CHANGE_MIN = 15;
const CHORD_CHANGE_MAX = 60;
const SCALE_CHANGE_MIN = 120;
const SCALE_CHANGE_MAX = 300;

export class EvolutionManager {
  private nextChordChange: number;
  private nextScaleChange: number;

  constructor() {
    this.nextChordChange = this.randomBetween(CHORD_CHANGE_MIN, CHORD_CHANGE_MAX);
    this.nextScaleChange = this.randomBetween(SCALE_CHANGE_MIN, SCALE_CHANGE_MAX);
  }

  evolve(state: GenerativeState, dt: number): { chordChange: boolean; scaleChange: boolean } {
    state.elapsed += dt;

    // Drift parameters
    state.params.density = randomWalk(state.params.density, 0.02, 0.2, 1.0);
    state.params.brightness = randomWalk(state.params.brightness, 0.015, 0.1, 0.9);
    state.params.spaciousness = randomWalk(state.params.spaciousness, 0.01, 0.3, 1.0);

    const timeSinceChord = state.elapsed - state.lastChordChange;
    const timeSinceScale = state.elapsed - state.lastScaleChange;

    let chordChange = false;
    let scaleChange = false;

    if (timeSinceChord >= this.nextChordChange) {
      chordChange = true;
      state.lastChordChange = state.elapsed;
      this.nextChordChange = this.randomBetween(CHORD_CHANGE_MIN, CHORD_CHANGE_MAX);
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
