import { describe, it, expect } from 'vitest';
import {
  hemiolaPatternGain,
  hemiolaStrengthValue,
} from './rhythmic-hemiola-pattern';

describe('hemiolaPatternGain', () => {
  it('hemiola position gets boost near cadence', () => {
    // Position 0, progress 0.8 (approaching cadence)
    const gain = hemiolaPatternGain(0, 10, 0.8, 'syro', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-hemiola position is neutral', () => {
    const gain = hemiolaPatternGain(1, 10, 0.8, 'syro', 'peak');
    expect(gain).toBe(1.0);
  });

  it('early in section is neutral', () => {
    const gain = hemiolaPatternGain(0, 10, 0.3, 'syro', 'peak');
    expect(gain).toBe(1.0);
  });

  it('after cadence window is neutral', () => {
    const gain = hemiolaPatternGain(0, 10, 0.98, 'syro', 'peak');
    expect(gain).toBe(1.0);
  });

  it('syro hemiolas more than ambient', () => {
    const sy = hemiolaPatternGain(0, 10, 0.8, 'syro', 'peak');
    const amb = hemiolaPatternGain(0, 10, 0.8, 'ambient', 'peak');
    expect(sy).toBeGreaterThan(amb);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = hemiolaPatternGain(p, 10, 0.8, 'syro', 'peak');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('hemiolaStrengthValue', () => {
  it('syro is highest', () => {
    expect(hemiolaStrengthValue('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(hemiolaStrengthValue('ambient')).toBe(0.05);
  });
});
