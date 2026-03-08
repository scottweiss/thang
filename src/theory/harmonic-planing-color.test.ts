import { describe, it, expect } from 'vitest';
import {
  isPlaningMotion,
  planingColorLpf,
  planingDepthValue,
} from './harmonic-planing-color';

describe('isPlaningMotion', () => {
  it('same quality is planing', () => {
    expect(isPlaningMotion('maj', 'maj')).toBe(true);
  });

  it('different quality is not planing', () => {
    expect(isPlaningMotion('maj', 'min')).toBe(false);
  });

  it('empty quality is not planing', () => {
    expect(isPlaningMotion('', '')).toBe(false);
  });
});

describe('planingColorLpf', () => {
  it('planing gets softened', () => {
    const lpf = planingColorLpf('maj', 'maj', 'ambient', 'breakdown');
    expect(lpf).toBeLessThan(1.0);
  });

  it('non-planing is neutral', () => {
    const lpf = planingColorLpf('maj', 'min', 'ambient', 'breakdown');
    expect(lpf).toBe(1.0);
  });

  it('ambient softens more than blockhead', () => {
    const amb = planingColorLpf('min', 'min', 'ambient', 'breakdown');
    const bh = planingColorLpf('min', 'min', 'blockhead', 'breakdown');
    expect(amb).toBeLessThan(bh);
  });

  it('stays in 0.92-1.0 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const s of sections) {
      const lpf = planingColorLpf('maj', 'maj', 'ambient', s);
      expect(lpf).toBeGreaterThanOrEqual(0.92);
      expect(lpf).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('planingDepthValue', () => {
  it('ambient is highest', () => {
    expect(planingDepthValue('ambient')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(planingDepthValue('blockhead')).toBe(0.10);
  });
});
