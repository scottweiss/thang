import { describe, it, expect } from 'vitest';
import {
  functionDecayMultiplier,
  shapingSensitivity,
  getHarmonicFunction,
} from './harmonic-envelope-shaping';

describe('getHarmonicFunction', () => {
  it('degree 1 is tonic', () => {
    expect(getHarmonicFunction(1)).toBe('tonic');
  });

  it('degree 5 is dominant', () => {
    expect(getHarmonicFunction(5)).toBe('dominant');
  });

  it('degree 4 is subdominant', () => {
    expect(getHarmonicFunction(4)).toBe('subdominant');
  });

  it('degree 7 is dominant', () => {
    expect(getHarmonicFunction(7)).toBe('dominant');
  });
});

describe('functionDecayMultiplier', () => {
  it('tonic > 1.0 (longer sustain)', () => {
    expect(functionDecayMultiplier(1, 'avril')).toBeGreaterThan(1.0);
  });

  it('dominant < 1.0 (shorter sustain)', () => {
    expect(functionDecayMultiplier(5, 'avril')).toBeLessThan(1.0);
  });

  it('subdominant ≈ 1.0', () => {
    expect(functionDecayMultiplier(4, 'avril')).toBeCloseTo(1.0, 1);
  });

  it('low sensitivity mood stays near 1.0', () => {
    const tonic = functionDecayMultiplier(1, 'syro');
    expect(tonic).toBeGreaterThan(1.0);
    expect(tonic).toBeLessThan(1.1); // barely shaped
  });

  it('tonic always >= dominant for same mood', () => {
    const moods = ['trance', 'avril', 'lofi', 'ambient', 'syro'] as const;
    for (const mood of moods) {
      expect(functionDecayMultiplier(1, mood)).toBeGreaterThan(
        functionDecayMultiplier(5, mood)
      );
    }
  });
});

describe('shapingSensitivity', () => {
  it('avril is high', () => {
    expect(shapingSensitivity('avril')).toBe(0.65);
  });

  it('syro is low', () => {
    expect(shapingSensitivity('syro')).toBe(0.20);
  });
});
