import { describe, it, expect } from 'vitest';
import {
  grooveConsistencyGain,
  consistencyReward,
} from './rhythmic-groove-consistency';

describe('grooveConsistencyGain', () => {
  it('established groove gets boost', () => {
    const gain = grooveConsistencyGain(8, 'trance', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('fresh section is near neutral', () => {
    const gain = grooveConsistencyGain(0, 'trance', 'groove');
    expect(gain).toBeCloseTo(1.0, 2);
  });

  it('groove section rewards more than breakdown', () => {
    const gr = grooveConsistencyGain(8, 'trance', 'groove');
    const bd = grooveConsistencyGain(8, 'trance', 'breakdown');
    expect(gr).toBeGreaterThan(bd);
  });

  it('trance rewards more than ambient', () => {
    const tr = grooveConsistencyGain(8, 'trance', 'groove');
    const amb = grooveConsistencyGain(8, 'ambient', 'groove');
    expect(tr).toBeGreaterThan(amb);
  });

  it('stays in 1.0-1.04 range', () => {
    for (let t = 0; t <= 10; t++) {
      const gain = grooveConsistencyGain(t, 'trance', 'peak');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('consistencyReward', () => {
  it('trance is high', () => {
    expect(consistencyReward('trance')).toBe(0.60);
  });

  it('ambient is low', () => {
    expect(consistencyReward('ambient')).toBe(0.15);
  });
});
