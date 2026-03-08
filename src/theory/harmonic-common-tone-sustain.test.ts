import { describe, it, expect } from 'vitest';
import {
  commonToneDecay,
  sustainBonus,
} from './harmonic-common-tone-sustain';

describe('commonToneDecay', () => {
  it('shared tones extend decay', () => {
    // C major (C,E,G) → A minor (A,C,E) shares C and E
    const decay = commonToneDecay(['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], 'ambient');
    expect(decay).toBeGreaterThan(1.0);
  });

  it('no shared tones is neutral', () => {
    // C major (C,E,G) → Db major (Db,F,Ab) shares nothing
    const decay = commonToneDecay(['C4', 'E4', 'G4'], ['Db4', 'F4', 'Ab4'], 'ambient');
    expect(decay).toBeCloseTo(1.0, 2);
  });

  it('more common tones = more extension', () => {
    const two = commonToneDecay(['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], 'ambient');
    const one = commonToneDecay(['C4', 'E4', 'G4'], ['D4', 'F4', 'A4'], 'ambient');
    expect(two).toBeGreaterThan(one);
  });

  it('ambient extends more than syro', () => {
    const amb = commonToneDecay(['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], 'ambient');
    const sy = commonToneDecay(['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], 'syro');
    expect(amb).toBeGreaterThan(sy);
  });

  it('stays in 1.0-1.06 range', () => {
    const chords = [
      ['C4', 'E4', 'G4'],
      ['A3', 'C4', 'E4'],
      ['F4', 'A4', 'C5'],
      ['Db4', 'F4', 'Ab4'],
    ];
    for (let i = 0; i < chords.length - 1; i++) {
      const decay = commonToneDecay(chords[i], chords[i + 1], 'ambient');
      expect(decay).toBeGreaterThanOrEqual(1.0);
      expect(decay).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('sustainBonus', () => {
  it('ambient is highest', () => {
    expect(sustainBonus('ambient')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(sustainBonus('syro')).toBe(0.20);
  });
});
