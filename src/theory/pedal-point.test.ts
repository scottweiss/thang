import { describe, it, expect } from 'vitest';
import {
  shouldUsePedal,
  getPedalNote,
  pedalConflictTension,
  pedalGainCurve,
} from './pedal-point';

describe('shouldUsePedal', () => {
  it('intro has high probability', () => {
    let trueCount = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      if (shouldUsePedal('intro', 0.5, 0)) trueCount++;
    }
    // 60% chance → expect roughly 600/1000, allow generous margin
    expect(trueCount).toBeGreaterThan(400);
    expect(trueCount).toBeLessThan(800);
  });

  it('peak has low probability', () => {
    let trueCount = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      if (shouldUsePedal('peak', 0.5, 0)) trueCount++;
    }
    // 20% chance → expect roughly 200/1000
    expect(trueCount).toBeLessThan(350);
    expect(trueCount).toBeGreaterThan(50);
  });

  it('returns false when ticksSinceChordChange >= 3', () => {
    // Should always be false regardless of section or tension
    for (let i = 0; i < 100; i++) {
      expect(shouldUsePedal('intro', 0.9, 3)).toBe(false);
      expect(shouldUsePedal('build', 0.9, 5)).toBe(false);
      expect(shouldUsePedal('breakdown', 0.9, 10)).toBe(false);
    }
  });
});

describe('getPedalNote', () => {
  it('intro returns tonic', () => {
    expect(getPedalNote('intro', 'C', 'G')).toContain('C');
  });

  it('build returns dominant (5th)', () => {
    expect(getPedalNote('build', 'C', 'G')).toContain('G');
  });

  it('includes octave 2', () => {
    expect(getPedalNote('intro', 'C', 'G')).toBe('C2');
    expect(getPedalNote('build', 'D', 'A')).toBe('A2');
    expect(getPedalNote('breakdown', 'F#', 'C#')).toBe('F#2');
  });
});

describe('pedalConflictTension', () => {
  it('chord tone returns 0', () => {
    // C is in C major chord
    expect(pedalConflictTension('C2', ['C4', 'E4', 'G4'])).toBe(0);
    // E is in C major chord
    expect(pedalConflictTension('E2', ['C4', 'E4', 'G4'])).toBe(0);
  });

  it('half step returns high tension', () => {
    // F is a half step from E (in C major chord)
    expect(pedalConflictTension('F2', ['C4', 'E4', 'G4'])).toBe(0.9);
    // B is a half step from C
    expect(pedalConflictTension('B2', ['C4', 'E4', 'G4'])).toBe(0.9);
  });

  it('whole step returns moderate tension', () => {
    // D is a whole step from C and from E (in C major chord)
    expect(pedalConflictTension('D2', ['C4', 'E4', 'G4'])).toBe(0.5);
    // A is a whole step from G
    expect(pedalConflictTension('A2', ['C4', 'E4', 'G4'])).toBe(0.5);
  });
});

describe('pedalGainCurve', () => {
  it('build increases gain with conflict', () => {
    const lowConflict = pedalGainCurve(0, 'build');
    const highConflict = pedalGainCurve(0.9, 'build');
    expect(highConflict).toBeGreaterThan(lowConflict);
    // Verify formula: 0.7 + conflict * 0.2
    expect(lowConflict).toBeCloseTo(0.7);
    expect(highConflict).toBeCloseTo(0.88);
  });

  it('breakdown decreases gain with conflict', () => {
    const lowConflict = pedalGainCurve(0, 'breakdown');
    const highConflict = pedalGainCurve(0.9, 'breakdown');
    expect(highConflict).toBeLessThan(lowConflict);
    // Verify formula: 0.8 - conflict * 0.2
    expect(lowConflict).toBeCloseTo(0.8);
    expect(highConflict).toBeCloseTo(0.62);
  });
});
