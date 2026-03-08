import { describe, it, expect } from 'vitest';
import {
  tonicPull,
  tonicGravityWeight,
  tonalGravityStrength,
} from './tonal-center-gravity';

describe('tonicPull', () => {
  it('no pull at phrase start', () => {
    expect(tonicPull(0, 'avril')).toBeCloseTo(0, 1);
  });

  it('maximum pull at phrase end', () => {
    const pull = tonicPull(1.0, 'avril');
    expect(pull).toBeGreaterThan(0.4);
  });

  it('increases through phrase', () => {
    const early = tonicPull(0.3, 'avril');
    const late = tonicPull(0.8, 'avril');
    expect(late).toBeGreaterThan(early);
  });

  it('avril pulls more than syro', () => {
    expect(tonicPull(0.8, 'avril')).toBeGreaterThan(tonicPull(0.8, 'syro'));
  });

  it('stays in 0-1 range', () => {
    expect(tonicPull(1.0, 'avril')).toBeLessThanOrEqual(1.0);
    expect(tonicPull(0, 'syro')).toBeGreaterThanOrEqual(0);
  });
});

describe('tonicGravityWeight', () => {
  it('tonic note gets high weight at phrase end', () => {
    const weight = tonicGravityWeight(0, 0, 0.9, 'avril');
    expect(weight).toBeGreaterThan(1.0);
  });

  it('distant note gets lower weight', () => {
    const tonic = tonicGravityWeight(0, 0, 0.9, 'avril');
    const tritone = tonicGravityWeight(6, 0, 0.9, 'avril');
    expect(tonic).toBeGreaterThan(tritone);
  });

  it('stays in 0.3-1.5 range', () => {
    for (let pc = 0; pc < 12; pc++) {
      const w = tonicGravityWeight(pc, 0, 1.0, 'ambient');
      expect(w).toBeGreaterThanOrEqual(0.3);
      expect(w).toBeLessThanOrEqual(1.5);
    }
  });
});

describe('tonalGravityStrength', () => {
  it('avril is highest', () => {
    expect(tonalGravityStrength('avril')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(tonalGravityStrength('syro')).toBe(0.15);
  });
});
