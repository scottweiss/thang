import { describe, it, expect } from 'vitest';
import {
  rhythmWeightGain,
  rhythmWeightStrength,
} from './harmonic-rhythm-weight';

describe('rhythmWeightGain', () => {
  it('downbeat chord change gets boost', () => {
    const gain = rhythmWeightGain(0, true, 'trance');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('off-beat chord change gets reduction', () => {
    const gain = rhythmWeightGain(3, true, 'trance');
    expect(gain).toBeLessThan(1.0);
  });

  it('no chord change is neutral', () => {
    const gain = rhythmWeightGain(0, false, 'trance');
    expect(gain).toBe(1.0);
  });

  it('trance is stronger than ambient', () => {
    const tr = rhythmWeightGain(0, true, 'trance');
    const amb = rhythmWeightGain(0, true, 'ambient');
    expect(tr).toBeGreaterThan(amb);
  });

  it('stays in 0.96-1.05 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = rhythmWeightGain(p, true, 'trance');
      expect(gain).toBeGreaterThanOrEqual(0.96);
      expect(gain).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('rhythmWeightStrength', () => {
  it('trance is high', () => {
    expect(rhythmWeightStrength('trance')).toBe(0.65);
  });

  it('syro is lowest', () => {
    expect(rhythmWeightStrength('syro')).toBe(0.10);
  });
});
