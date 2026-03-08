import { describe, it, expect } from 'vitest';
import {
  onsetHpfBoost,
  onsetLpfReduction,
  isInOnsetPhase,
  shouldCarveOnset,
  carveIntensity,
} from './spectral-onset-carve';

describe('onsetHpfBoost', () => {
  it('zero when fully faded in', () => {
    expect(onsetHpfBoost(0.8, 'lofi', 3)).toBe(0);
  });

  it('positive during fade-in', () => {
    expect(onsetHpfBoost(0.3, 'lofi', 3)).toBeGreaterThan(0);
  });

  it('stronger at start of fade-in', () => {
    const early = onsetHpfBoost(0.1, 'lofi', 3);
    const mid = onsetHpfBoost(0.5, 'lofi', 3);
    expect(early).toBeGreaterThan(mid);
  });

  it('more layers = more carving', () => {
    const few = onsetHpfBoost(0.3, 'lofi', 2);
    const many = onsetHpfBoost(0.3, 'lofi', 5);
    expect(many).toBeGreaterThan(few);
  });
});

describe('onsetLpfReduction', () => {
  it('1.0 when fully faded in', () => {
    expect(onsetLpfReduction(0.8, 'lofi')).toBe(1.0);
  });

  it('< 1.0 during fade-in', () => {
    expect(onsetLpfReduction(0.3, 'lofi')).toBeLessThan(1.0);
  });

  it('clamped >= 0.7', () => {
    expect(onsetLpfReduction(0.02, 'ambient')).toBeGreaterThanOrEqual(0.7);
  });
});

describe('isInOnsetPhase', () => {
  it('true during fade-in', () => {
    expect(isInOnsetPhase(0.3)).toBe(true);
  });

  it('false when fully faded in', () => {
    expect(isInOnsetPhase(0.8)).toBe(false);
  });

  it('false when at zero', () => {
    expect(isInOnsetPhase(0.005)).toBe(false);
  });
});

describe('shouldCarveOnset', () => {
  it('all moods apply', () => {
    expect(shouldCarveOnset('trance')).toBe(true);
    expect(shouldCarveOnset('ambient')).toBe(true);
  });
});

describe('carveIntensity', () => {
  it('ambient is strongest', () => {
    expect(carveIntensity('ambient')).toBe(0.60);
  });

  it('disco is moderate', () => {
    expect(carveIntensity('disco')).toBe(0.35);
  });
});
