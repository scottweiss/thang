import { describe, it, expect } from 'vitest';
import {
  resolutionWeightGain,
  resolutionStrength,
} from './melodic-resolution-weight';

describe('resolutionWeightGain', () => {
  it('chord tone gets boost', () => {
    const gain = resolutionWeightGain('C', ['C4', 'E4', 'G4'], 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-chord tone gets reduction', () => {
    const gain = resolutionWeightGain('D', ['C4', 'E4', 'G4'], 'avril');
    expect(gain).toBeLessThan(1.0);
  });

  it('avril is more weighted than syro', () => {
    const av = resolutionWeightGain('C', ['C4', 'E4', 'G4'], 'avril');
    const sy = resolutionWeightGain('C', ['C4', 'E4', 'G4'], 'syro');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 0.97-1.04 range', () => {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    for (const n of notes) {
      const gain = resolutionWeightGain(n, ['C4', 'E4', 'G4'], 'avril');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('resolutionStrength', () => {
  it('avril is highest', () => {
    expect(resolutionStrength('avril')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(resolutionStrength('syro')).toBe(0.15);
  });
});
