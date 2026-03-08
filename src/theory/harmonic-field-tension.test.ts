import { describe, it, expect } from 'vitest';
import {
  fifthsDistance,
  fieldTensionGain,
  fieldTensionBrightness,
  fieldSensitivity,
} from './harmonic-field-tension';

describe('fifthsDistance', () => {
  it('same note is 0', () => {
    expect(fifthsDistance(0, 0)).toBe(0);
  });

  it('perfect fifth is 1', () => {
    expect(fifthsDistance(0, 7)).toBe(1); // C to G
  });

  it('tritone is 6 (maximum)', () => {
    expect(fifthsDistance(0, 6)).toBe(6); // C to F#
  });

  it('is symmetric', () => {
    expect(fifthsDistance(2, 9)).toBe(fifthsDistance(9, 2));
  });

  it('wraps correctly', () => {
    // C(0) to F(5) should be 1 step going backwards on circle
    expect(fifthsDistance(0, 5)).toBe(1);
  });
});

describe('fieldTensionGain', () => {
  it('near tonic returns close to 1.0', () => {
    const gain = fieldTensionGain(0, 0, 'lofi', 'build');
    expect(gain).toBeCloseTo(1.0, 1);
  });

  it('mid-distance gets boost', () => {
    // D(2) is 2 fifths from C(0), which is the boundary — try E(4) which is 4 fifths
    const gain = fieldTensionGain(4, 0, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('stays in 0.85-1.15 range', () => {
    for (let pc = 0; pc < 12; pc++) {
      const g = fieldTensionGain(pc, 0, 'ambient', 'peak');
      expect(g).toBeGreaterThanOrEqual(0.85);
      expect(g).toBeLessThanOrEqual(1.15);
    }
  });

  it('ambient is more sensitive than syro', () => {
    const ambient = fieldTensionGain(6, 0, 'ambient', 'build');
    const syro = fieldTensionGain(6, 0, 'syro', 'build');
    expect(Math.abs(ambient - 1.0)).toBeGreaterThan(Math.abs(syro - 1.0));
  });
});

describe('fieldTensionBrightness', () => {
  it('tonic is near 1.0', () => {
    expect(fieldTensionBrightness(0, 0, 'lofi')).toBeCloseTo(1.0, 1);
  });

  it('remote notes are brighter', () => {
    const near = fieldTensionBrightness(7, 0, 'lofi'); // fifth = 1 step
    const far = fieldTensionBrightness(6, 0, 'lofi');  // tritone = 6 steps
    expect(far).toBeGreaterThan(near);
  });

  it('stays in 0.95-1.15 range', () => {
    for (let pc = 0; pc < 12; pc++) {
      const b = fieldTensionBrightness(pc, 0, 'ambient');
      expect(b).toBeGreaterThanOrEqual(0.95);
      expect(b).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('fieldSensitivity', () => {
  it('ambient is highest', () => {
    expect(fieldSensitivity('ambient')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(fieldSensitivity('disco')).toBe(0.20);
  });
});
