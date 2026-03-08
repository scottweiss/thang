import { Mood, ChordState, ScaleState } from '../types';
import { MarkovChain } from '../engine/markov';
import { chordsInScale } from './chords';
import { getBorrowedChords } from './modal-interchange';

// Probability of substituting a borrowed chord, per mood
const BORROW_PROBABILITY: Record<Mood, number> = {
  ambient: 0.05,
  downtempo: 0.1,
  lofi: 0.12,
  trance: 0.03,
  avril: 0.08,
  xtal: 0.06,
  syro: 0.15,
  blockhead: 0.1,
  flim: 0.05,
  disco: 0.08,
};

// Transition matrices: rows = current degree (0-6), columns = next degree
const MOOD_MATRICES: Record<Mood, number[][]> = {
  ambient: [
    // Very slow, stays close — I, IV, vi dominant
    [3, 0, 0, 3, 2, 2, 0],
    [3, 1, 1, 1, 2, 1, 0],
    [2, 1, 1, 2, 1, 2, 0],
    [3, 0, 0, 2, 3, 1, 0],
    [4, 0, 0, 2, 1, 2, 0],
    [2, 0, 1, 2, 2, 2, 0],
    [3, 0, 0, 2, 2, 1, 0],
  ],
  downtempo: [
    // Smooth movement — favors IV, V, vi, ii
    [1, 2, 1, 3, 2, 3, 0],
    [2, 1, 2, 1, 2, 2, 0],
    [2, 2, 0, 2, 1, 2, 0],
    [2, 1, 1, 1, 3, 2, 0],
    [3, 1, 0, 2, 1, 2, 0],
    [2, 1, 2, 2, 2, 1, 0],
    [3, 1, 0, 2, 2, 1, 0],
  ],
  lofi: [
    // Jazz-influenced — ii-V-I, vi, iii movement
    [0, 3, 2, 2, 1, 3, 0],
    [1, 1, 2, 1, 3, 2, 0],
    [1, 2, 1, 2, 1, 3, 0],
    [1, 2, 1, 1, 2, 3, 0],
    [2, 2, 1, 2, 0, 2, 0],
    [2, 2, 2, 2, 1, 1, 0],
    [2, 2, 1, 2, 1, 2, 0],
  ],
  trance: [
    // Energetic — strong I-V-vi-IV progressions
    [1, 0, 0, 3, 3, 3, 0],
    [2, 1, 1, 2, 2, 2, 0],
    [2, 1, 1, 2, 2, 2, 0],
    [2, 0, 0, 1, 4, 2, 0],
    [3, 0, 0, 2, 1, 3, 0],
    [3, 0, 0, 3, 2, 1, 0],
    [3, 0, 0, 2, 2, 2, 0],
  ],
  avril: [
    // Gentle, intimate — favor I(0), IV(3), vi(5), ii(1) movement
    // Avoid strong V→I resolution, more ii-V movement
    [2, 2, 0, 3, 1, 3, 0],
    [3, 1, 1, 2, 2, 2, 0],
    [2, 2, 1, 2, 1, 2, 0],
    [3, 2, 0, 1, 1, 3, 0],
    [2, 2, 0, 2, 1, 3, 0],
    [3, 1, 1, 3, 1, 1, 0],
    [3, 2, 0, 2, 1, 2, 0],
  ],
  xtal: [
    // Very slow, circular — favors I, iv, vi, dreamy loops
    [4, 0, 0, 3, 1, 3, 0],
    [3, 1, 0, 2, 1, 2, 0],
    [3, 0, 1, 2, 1, 2, 0],
    [3, 0, 0, 2, 2, 3, 0],
    [4, 0, 0, 2, 1, 2, 0],
    [3, 0, 1, 3, 1, 2, 0],
    [4, 0, 0, 2, 1, 2, 0],
  ],
  syro: [
    // More chromatic, uses all degrees, unpredictable
    [1, 2, 2, 2, 2, 2, 1],
    [2, 1, 2, 2, 2, 1, 2],
    [2, 2, 1, 2, 2, 2, 1],
    [2, 1, 2, 1, 2, 2, 2],
    [2, 2, 1, 2, 1, 2, 2],
    [1, 2, 2, 2, 2, 1, 2],
    [2, 2, 2, 1, 2, 2, 1],
  ],
  blockhead: [
    // Jazzy ii-V-I movement — favors ii(1), V(4), I(0), vi(5)
    [1, 3, 1, 2, 2, 2, 0],
    [2, 1, 1, 1, 3, 2, 0],
    [2, 2, 1, 2, 1, 2, 0],
    [2, 2, 1, 1, 3, 2, 0],
    [3, 1, 0, 2, 1, 2, 0],
    [2, 2, 1, 2, 2, 1, 0],
    [3, 2, 0, 2, 2, 1, 0],
  ],
  flim: [
    // Gentle, circular — favors I(0), IV(3), ii(1), vi(5)
    [3, 2, 0, 3, 1, 3, 0],
    [3, 1, 1, 2, 1, 2, 0],
    [3, 1, 1, 2, 1, 2, 0],
    [3, 1, 0, 2, 1, 3, 0],
    [3, 1, 0, 2, 1, 2, 0],
    [3, 1, 1, 3, 1, 1, 0],
    [3, 1, 0, 2, 1, 2, 0],
  ],
  disco: [
    // Funky — strong I-IV-V-vi, classic disco progressions
    [1, 2, 0, 3, 3, 2, 0],
    [2, 1, 1, 2, 3, 2, 0],
    [2, 2, 1, 2, 2, 2, 0],
    [2, 1, 0, 1, 4, 2, 0],
    [3, 1, 0, 2, 1, 3, 0],
    [3, 1, 0, 3, 2, 1, 0],
    [3, 1, 0, 2, 3, 1, 0],
  ],
};

export class ProgressionGenerator {
  private chain: MarkovChain<number>;
  private scale: ScaleState;
  private chords: ChordState[];
  private currentDegree: number;
  private mood: Mood;

  constructor(scale: ScaleState, mood: Mood, startDegree: number = 0) {
    const degrees = [0, 1, 2, 3, 4, 5, 6];
    this.chain = new MarkovChain(degrees, MOOD_MATRICES[mood]);
    this.scale = scale;
    this.mood = mood;
    this.chords = chordsInScale(scale, mood);
    this.currentDegree = startDegree;
  }

  next(): ChordState {
    const result = this.chain.nextByIndex(this.currentDegree);
    this.currentDegree = result.index;

    // Occasionally substitute a borrowed chord for harmonic color
    if (Math.random() < (BORROW_PROBABILITY[this.mood] ?? 0.05)) {
      const borrows = getBorrowedChords(this.scale.type);
      if (borrows.length > 0) {
        const borrowed = borrows[Math.floor(Math.random() * borrows.length)];
        // Use the borrowed chord's degree but override its quality
        const baseChord = this.chords[borrowed.degree % this.chords.length];
        return { ...baseChord, quality: borrowed.quality, degree: borrowed.degree };
      }
    }

    const chordIdx = this.currentDegree % this.chords.length;
    return this.chords[chordIdx];
  }

  current(): ChordState {
    return this.chords[this.currentDegree % this.chords.length];
  }

  setMood(mood: Mood): void {
    this.mood = mood;
    this.chain.setMatrix(MOOD_MATRICES[mood]);
    // Rebuild chords with new mood qualities
    this.chords = chordsInScale(this.scale, mood);
  }

  setScale(scale: ScaleState): void {
    this.scale = scale;
    this.chords = chordsInScale(scale, this.mood);
    this.currentDegree = this.currentDegree % this.chords.length;
  }

  getCurrentDegree(): number {
    return this.currentDegree;
  }
}
