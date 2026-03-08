import { describe, it, expect } from 'vitest';
import {
  coherenceFmMultiplier,
  coherenceShimmer,
  shouldApplyCoherence,
  coherenceStrength,
} from './spectral-temporal-coherence';

describe('coherenceFmMultiplier', () => {
  it('1.0 when rhythm and spectrum balanced', () => {
    expect(coherenceFmMultiplier(0.5, 0.5, 'trance', 'peak')).toBe(1.0);
  });

  it('> 1.0 when rhythm denser than spectrum (boost FM)', () => {
    expect(coherenceFmMultiplier(0.8, 0.2, 'trance', 'peak')).toBeGreaterThan(1.0);
  });

  it('< 1.0 when spectrum denser than rhythm (reduce FM)', () => {
    expect(coherenceFmMultiplier(0.2, 0.8, 'trance', 'peak')).toBeLessThan(1.0);
  });

  it('clamped to 0.85-1.15 range', () => {
    expect(coherenceFmMultiplier(1.0, 0.0, 'trance', 'peak')).toBeLessThanOrEqual(1.15);
    expect(coherenceFmMultiplier(0.0, 1.0, 'trance', 'peak')).toBeGreaterThanOrEqual(0.85);
  });

  it('trance has stronger coupling than ambient', () => {
    const tranceMult = coherenceFmMultiplier(0.8, 0.2, 'trance', 'peak');
    const ambientMult = coherenceFmMultiplier(0.8, 0.2, 'ambient', 'peak');
    expect(Math.abs(tranceMult - 1.0)).toBeGreaterThan(Math.abs(ambientMult - 1.0));
  });

  it('peak has stronger effect than breakdown', () => {
    const peakMult = coherenceFmMultiplier(0.8, 0.2, 'trance', 'peak');
    const bdMult = coherenceFmMultiplier(0.8, 0.2, 'trance', 'breakdown');
    expect(Math.abs(peakMult - 1.0)).toBeGreaterThan(Math.abs(bdMult - 1.0));
  });
});

describe('coherenceShimmer', () => {
  it('1.0 with no gap', () => {
    expect(coherenceShimmer(0, 'trance')).toBe(1.0);
  });

  it('< 1.0 with large gap and low coherence mood', () => {
    expect(coherenceShimmer(0.8, 'ambient')).toBeLessThan(1.0);
  });

  it('clamped at 0.95', () => {
    expect(coherenceShimmer(1.0, 'ambient')).toBeGreaterThanOrEqual(0.95);
  });
});

describe('shouldApplyCoherence', () => {
  it('true for trance peak', () => {
    expect(shouldApplyCoherence('trance', 'peak')).toBe(true);
  });

  it('false for ambient breakdown (too weak)', () => {
    // ambient=0.15 * breakdown=0.5 = 0.075 < 0.08
    expect(shouldApplyCoherence('ambient', 'breakdown')).toBe(false);
  });
});

describe('coherenceStrength', () => {
  it('trance is strongest', () => {
    expect(coherenceStrength('trance')).toBe(0.50);
  });

  it('ambient is weakest', () => {
    expect(coherenceStrength('ambient')).toBe(0.15);
  });
});
