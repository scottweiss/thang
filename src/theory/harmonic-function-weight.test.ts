import { describe, it, expect } from 'vitest';
import {
  functionWeightGain,
  functionDepth,
} from './harmonic-function-weight';

describe('functionWeightGain', () => {
  it('tonic gets boost', () => {
    const gain = functionWeightGain(1, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('dominant gets boost', () => {
    const gain = functionWeightGain(5, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('tonic is stronger than dominant', () => {
    const tonic = functionWeightGain(1, 'avril');
    const dom = functionWeightGain(5, 'avril');
    expect(tonic).toBeGreaterThan(dom);
  });

  it('avril is deeper than syro', () => {
    const av = functionWeightGain(1, 'avril');
    const sy = functionWeightGain(1, 'syro');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 0.97-1.04 range', () => {
    for (let d = 1; d <= 7; d++) {
      const gain = functionWeightGain(d, 'avril');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('functionDepth', () => {
  it('avril is highest', () => {
    expect(functionDepth('avril')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(functionDepth('syro')).toBe(0.15);
  });
});
