import { describe, it, expect } from 'vitest';
import {
  clarityGainBoost,
  clarityLpfBoost,
  findDominantLayer,
  shouldApplyClarity,
  clarityStrengthForMood,
} from './clarity-boost';

describe('clarityGainBoost', () => {
  it('dominant layer gets no boost', () => {
    expect(clarityGainBoost('melody', 'melody', 'lofi')).toBe(1.0);
  });

  it('nearby layers get more boost', () => {
    // harmony (800Hz) and arp (1500Hz) are closer than harmony and texture (4000Hz)
    const arpBoost = clarityGainBoost('arp', 'harmony', 'lofi');
    const textureBoost = clarityGainBoost('texture', 'harmony', 'lofi');
    expect(arpBoost).toBeGreaterThan(textureBoost);
  });

  it('capped at 1.15', () => {
    expect(clarityGainBoost('harmony', 'melody', 'ambient')).toBeLessThanOrEqual(1.15);
  });

  it('>= 1.0 for non-dominant layers', () => {
    expect(clarityGainBoost('arp', 'melody', 'lofi')).toBeGreaterThanOrEqual(1.0);
  });
});

describe('clarityLpfBoost', () => {
  it('dominant layer gets no boost', () => {
    expect(clarityLpfBoost('melody', 'melody', 'lofi')).toBe(1.0);
  });

  it('lower layer gets LPF boost when dominant is higher', () => {
    // harmony (800Hz) when melody (2000Hz) dominates
    expect(clarityLpfBoost('harmony', 'melody', 'lofi')).toBeGreaterThan(1.0);
  });

  it('higher layer gets no LPF boost', () => {
    // texture (4000Hz) when harmony (800Hz) dominates — already higher
    expect(clarityLpfBoost('texture', 'harmony', 'lofi')).toBe(1.0);
  });

  it('capped at 1.2', () => {
    expect(clarityLpfBoost('drone', 'melody', 'ambient')).toBeLessThanOrEqual(1.2);
  });
});

describe('findDominantLayer', () => {
  it('returns loudest layer', () => {
    expect(findDominantLayer({ melody: 0.2, harmony: 0.15, arp: 0.1 })).toBe('melody');
  });

  it('handles ties by iteration order', () => {
    const result = findDominantLayer({ melody: 0.2, harmony: 0.2 });
    expect(['melody', 'harmony']).toContain(result);
  });
});

describe('shouldApplyClarity', () => {
  it('true with 3+ layers', () => {
    expect(shouldApplyClarity('lofi', 4)).toBe(true);
  });

  it('false with 2 layers', () => {
    expect(shouldApplyClarity('lofi', 2)).toBe(false);
  });
});

describe('clarityStrengthForMood', () => {
  it('ambient is strongest', () => {
    expect(clarityStrengthForMood('ambient')).toBe(0.60);
  });

  it('disco is moderate', () => {
    expect(clarityStrengthForMood('disco')).toBe(0.35);
  });
});
