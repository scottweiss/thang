import { Mood, ChordState, ScaleState } from '../types';
import { MarkovChain } from '../engine/markov';
import { chordsInScale, getChordNotesWithOctave, getChordSymbol } from './chords';
import { getScaleNotes } from './scales';
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

/**
 * Second-order transition biases for context-aware progressions.
 * Format: SECOND_ORDER[prev][current] = weight adjustments for next state.
 * Only defines the "interesting" transitions — undefined entries fall back to first-order.
 * These encode common harmonic patterns: ii→V→I, I→IV→V, vi→IV→V, etc.
 */
function buildSecondOrderMatrix(): number[][][] {
  // Start with zeros — undefined entries use first-order fallback
  const m: number[][][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 7 }, () => [0, 0, 0, 0, 0, 0, 0])
  );

  // ii(1) → V(4) → strongly I(0): the classic ii-V-I
  m[1][4] = [8, 0, 0, 1, 0, 1, 0];

  // I(0) → IV(3) → prefer V(4) or vi(5): classic I-IV-V or I-IV-vi
  m[0][3] = [1, 0, 0, 0, 4, 3, 0];

  // vi(5) → IV(3) → prefer V(4) or I(0): vi-IV-V-I
  m[5][3] = [2, 0, 0, 0, 5, 0, 0];

  // IV(3) → V(4) → strongly I(0) or vi(5): IV-V-I cadence
  m[3][4] = [6, 0, 0, 0, 0, 3, 0];

  // I(0) → V(4) → prefer vi(5) or I(0): I-V-vi (deceptive) or I-V-I
  m[0][4] = [3, 0, 0, 0, 0, 5, 0];

  // V(4) → vi(5) → prefer IV(3) or ii(1): vi-IV or vi-ii continuation
  m[4][5] = [0, 3, 0, 5, 0, 0, 0];

  // I(0) → vi(5) → prefer IV(3) or ii(1): I-vi-IV or I-vi-ii
  m[0][5] = [0, 3, 0, 5, 0, 0, 0];

  return m;
}

const SECOND_ORDER = buildSecondOrderMatrix();

export class ProgressionGenerator {
  private chain: MarkovChain<number>;
  private scale: ScaleState;
  private chords: ChordState[];
  private currentDegree: number;
  private previousDegree: number;
  private mood: Mood;

  constructor(scale: ScaleState, mood: Mood, startDegree: number = 0) {
    const degrees = [0, 1, 2, 3, 4, 5, 6];
    this.chain = new MarkovChain(degrees, MOOD_MATRICES[mood]);
    this.chain.setSecondOrderMatrix(SECOND_ORDER);
    this.scale = scale;
    this.mood = mood;
    this.chords = chordsInScale(scale, mood);
    this.currentDegree = startDegree;
    this.previousDegree = startDegree;
  }

  next(externalBias?: number[]): ChordState {
    // Use second-order Markov when available (considers previous→current→next)
    const result = this.chain.nextWithHistory(this.previousDegree, this.currentDegree, undefined, externalBias);
    this.previousDegree = this.currentDegree;
    this.currentDegree = result.index;

    // Occasionally substitute a borrowed chord for harmonic color
    if (Math.random() < (BORROW_PROBABILITY[this.mood] ?? 0.05)) {
      const borrows = getBorrowedChords(this.scale.type);
      if (borrows.length > 0) {
        const borrowed = borrows[Math.floor(Math.random() * borrows.length)];
        // Build proper notes for the borrowed chord quality
        const scaleNotes = getScaleNotes(this.scale.root, this.scale.type);
        const chordRoot = scaleNotes[borrowed.degree % scaleNotes.length];
        return {
          symbol: getChordSymbol(chordRoot, borrowed.quality),
          root: chordRoot,
          quality: borrowed.quality,
          notes: getChordNotesWithOctave(chordRoot, borrowed.quality, 3),
          degree: borrowed.degree,
        };
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

  /** Peek at the most likely next chord without advancing state. */
  peekNext(): ChordState {
    const result = this.chain.nextWithHistory(this.previousDegree, this.currentDegree);
    const chordIdx = result.index % this.chords.length;
    return this.chords[chordIdx];
  }

  /** Force progression to a specific degree (for cadential steering) */
  forceToDegree(degree: number): ChordState {
    this.currentDegree = degree % this.chords.length;
    return this.chords[this.currentDegree];
  }
}
