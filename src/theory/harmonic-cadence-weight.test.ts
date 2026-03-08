import { describe, it, expect } from 'vitest';
import {
  cadenceWeightGain,
  cadenceDepthValue,
} from './harmonic-cadence-weight';

describe('cadenceWeightGain', () => {
  it('V→I gets strongest boost', () => {
    const gain = cadenceWeightGain(1, 5, 'trance', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('IV→I gets plagal boost', () => {
    const gain = cadenceWeightGain(1, 4, 'trance', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('V→I stronger than IV→I', () => {
    const authentic = cadenceWeightGain(1, 5, 'avril', 'build');
    const plagal = cadenceWeightGain(1, 4, 'avril', 'build');
    expect(authentic).toBeGreaterThan(plagal);
  });

  it('ii→V gets approach boost', () => {
    const gain = cadenceWeightGain(5, 2, 'trance', 'build');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-cadential motion is neutral', () => {
    const gain = cadenceWeightGain(3, 6, 'trance', 'build');
    expect(gain).toBe(1.0);
  });

  it('trance cadences more than syro', () => {
    const tr = cadenceWeightGain(1, 5, 'trance', 'peak');
    const sy = cadenceWeightGain(1, 5, 'syro', 'peak');
    expect(tr).toBeGreaterThan(sy);
  });

  it('stays in 1.0-1.04 range', () => {
    const degrees = [1, 2, 3, 4, 5, 6, 7];
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const s of sections) {
      for (const d of degrees) {
        for (const prev of degrees) {
          const gain = cadenceWeightGain(d, prev, 'trance', s);
          expect(gain).toBeGreaterThanOrEqual(1.0);
          expect(gain).toBeLessThanOrEqual(1.04);
        }
      }
    }
  });
});

describe('cadenceDepthValue', () => {
  it('trance is high', () => {
    expect(cadenceDepthValue('trance')).toBe(0.50);
  });

  it('syro is lowest', () => {
    expect(cadenceDepthValue('syro')).toBe(0.20);
  });
});
