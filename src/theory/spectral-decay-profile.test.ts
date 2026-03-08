import { describe, it, expect } from 'vitest';
import {
  spectralDecayLpf,
  spectralDecayRate,
  shouldApplySpectralDecay,
} from './spectral-decay-profile';

describe('spectralDecayLpf', () => {
  it('1.0 at note attack', () => {
    expect(spectralDecayLpf(0, 'lofi', 'groove')).toBeCloseTo(1.0, 2);
  });

  it('decreases over time', () => {
    const t0 = spectralDecayLpf(0, 'lofi', 'groove');
    const t3 = spectralDecayLpf(3, 'lofi', 'groove');
    expect(t3).toBeLessThan(t0);
  });

  it('floors at 0.7', () => {
    const deep = spectralDecayLpf(20, 'ambient', 'breakdown');
    expect(deep).toBeGreaterThanOrEqual(0.7);
  });

  it('ambient decays faster than trance', () => {
    const ambient = spectralDecayLpf(3, 'ambient', 'groove');
    const trance = spectralDecayLpf(3, 'trance', 'groove');
    expect(ambient).toBeLessThan(trance);
  });

  it('breakdown decays more than peak', () => {
    const bd = spectralDecayLpf(3, 'lofi', 'breakdown');
    const pk = spectralDecayLpf(3, 'lofi', 'peak');
    expect(bd).toBeLessThan(pk);
  });
});

describe('spectralDecayRate', () => {
  it('ambient is highest', () => {
    expect(spectralDecayRate('ambient')).toBe(0.50);
  });

  it('trance is lowest', () => {
    expect(spectralDecayRate('trance')).toBe(0.15);
  });
});

describe('shouldApplySpectralDecay', () => {
  it('true for all mood/section combos', () => {
    expect(shouldApplySpectralDecay('trance', 'groove')).toBe(true);
    expect(shouldApplySpectralDecay('ambient', 'breakdown')).toBe(true);
  });
});
