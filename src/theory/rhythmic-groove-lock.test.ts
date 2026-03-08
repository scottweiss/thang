import { describe, it, expect } from 'vitest';
import {
  grooveLockGain,
  grooveLockStrength,
  lockTightness,
} from './rhythmic-groove-lock';

describe('grooveLockGain', () => {
  it('downbeat in trance gets boost', () => {
    const gain = grooveLockGain(0, 'trance');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('trance is tighter than ambient', () => {
    const trance = grooveLockGain(0, 'trance');
    const amb = grooveLockGain(0, 'ambient');
    expect(trance).toBeGreaterThan(amb);
  });

  it('stays in 0.96-1.05 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = grooveLockGain(p, 'trance');
      expect(gain).toBeGreaterThanOrEqual(0.96);
      expect(gain).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('grooveLockStrength', () => {
  it('downbeat is strongest', () => {
    const down = grooveLockStrength(0, 'trance');
    const off = grooveLockStrength(3, 'trance');
    expect(down).toBeGreaterThan(off);
  });
});

describe('lockTightness', () => {
  it('trance is tightest', () => {
    expect(lockTightness('trance')).toBe(0.70);
  });

  it('ambient is loosest', () => {
    expect(lockTightness('ambient')).toBe(0.10);
  });
});
