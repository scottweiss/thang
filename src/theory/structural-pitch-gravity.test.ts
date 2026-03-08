import { describe, it, expect } from 'vitest';
import {
  structuralDistance,
  structuralGravityGain,
  gravityStrength,
} from './structural-pitch-gravity';

describe('structuralDistance', () => {
  it('chord tone is distance 0', () => {
    expect(structuralDistance(0, [0, 4, 7])).toBe(0);
  });

  it('semitone away is distance 1', () => {
    expect(structuralDistance(1, [0, 4, 7])).toBe(1);
  });

  it('tritone is max distance (6)', () => {
    expect(structuralDistance(6, [0])).toBe(6);
  });

  it('wraps around octave', () => {
    expect(structuralDistance(11, [0])).toBe(1); // B is 1 from C
  });
});

describe('structuralGravityGain', () => {
  it('chord tone gets boost', () => {
    const gain = structuralGravityGain(0, [0, 4, 7], 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('distant note gets reduction', () => {
    const chordTone = structuralGravityGain(0, [0, 4, 7], 'trance');
    const distant = structuralGravityGain(6, [0, 4, 7], 'trance');
    expect(chordTone).toBeGreaterThan(distant);
  });

  it('stays in 0.90-1.08 range', () => {
    for (let pc = 0; pc < 12; pc++) {
      const gain = structuralGravityGain(pc, [0, 4, 7], 'avril');
      expect(gain).toBeGreaterThanOrEqual(0.90);
      expect(gain).toBeLessThanOrEqual(1.08);
    }
  });

  it('weak mood has less effect', () => {
    const avril = structuralGravityGain(0, [0, 4, 7], 'avril');
    const syro = structuralGravityGain(0, [0, 4, 7], 'syro');
    expect(Math.abs(avril - 1.0)).toBeGreaterThan(Math.abs(syro - 1.0));
  });
});

describe('gravityStrength', () => {
  it('avril is high', () => {
    expect(gravityStrength('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(gravityStrength('syro')).toBe(0.15);
  });
});
