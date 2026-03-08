import { weightedChoice } from './random';

export class MarkovChain<T> {
  private states: T[];
  private matrix: number[][];

  constructor(states: T[], matrix: number[][]) {
    this.states = states;
    this.matrix = matrix;
  }

  next(current: T): T {
    const idx = this.states.indexOf(current);
    if (idx === -1) {
      // Unknown state, pick random
      return this.states[Math.floor(Math.random() * this.states.length)];
    }
    const weights = this.matrix[idx];
    return weightedChoice(this.states, weights);
  }

  nextByIndex(currentIndex: number): { state: T; index: number } {
    const weights = this.matrix[currentIndex % this.matrix.length];
    const nextIdx = weightedChoiceIndex(weights);
    return { state: this.states[nextIdx], index: nextIdx };
  }

  setMatrix(matrix: number[][]): void {
    this.matrix = matrix;
  }

  getStates(): T[] {
    return this.states;
  }
}

function weightedChoiceIndex(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}
