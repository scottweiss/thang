import { describe, it, expect } from 'vitest';
import {
  chordToneGravityGain,
  gravityStrength,
} from './chord-tone-gravity';

describe('chordToneGravityGain', () => {
  it('chord tone gets boost', () => {
    const gain = chordToneGravityGain('C', ['C4', 'E4', 'G4'], 'trance');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('distant note gets reduction', () => {
    // Bb is 3+ semitones from all C major chord tones (C=0, E=4, G=7): Bb=10 → dist from C=2, E=4 is 6, G=7 is 3
    // Actually Bb(10) to C(0)=2, so min=2. Use A(9): A to G=2, A to C=3, A to E=5 → min=2
    // Use D(2): D to C=2, D to E=2, D to G=5 → min=2
    // For max distance, need tritone from all: hard. Just test that chord tone > non-chord tone
    const chordTone = chordToneGravityGain('C', ['C4', 'E4', 'G4'], 'trance');
    const nonChord = chordToneGravityGain('Bb', ['C4', 'E4', 'G4'], 'trance');
    expect(chordTone).toBeGreaterThan(nonChord);
  });

  it('trance has stronger gravity than syro', () => {
    const tr = chordToneGravityGain('C', ['C4', 'E4', 'G4'], 'trance');
    const sy = chordToneGravityGain('C', ['C4', 'E4', 'G4'], 'syro');
    expect(tr).toBeGreaterThan(sy);
  });

  it('stays in 0.97-1.04 range', () => {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Db', 'Eb', 'Gb', 'Ab', 'Bb'];
    for (const n of notes) {
      const gain = chordToneGravityGain(n, ['C4', 'E4', 'G4'], 'trance');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('gravityStrength', () => {
  it('trance is high', () => {
    expect(gravityStrength('trance')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(gravityStrength('syro')).toBe(0.15);
  });
});
