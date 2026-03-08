import { describe, it, expect } from 'vitest';
import {
  groundingScore,
  groundingGainMultiplier,
  groundingPreference,
} from './voicing-weight-distribution';

describe('groundingScore', () => {
  it('bottom-heavy voicing scores high', () => {
    const score = groundingScore([36, 40, 43, 72]); // three low notes, one high
    expect(score).toBeGreaterThan(0.5);
  });

  it('evenly distributed scores 0.5', () => {
    const score = groundingScore([48, 60, 72]); // evenly spaced
    expect(score).toBeCloseTo(0.5, 1);
  });

  it('single note returns 0.5', () => {
    expect(groundingScore([60])).toBe(0.5);
  });

  it('stays in 0-1 range', () => {
    const score = groundingScore([36, 84, 85, 86]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('groundingGainMultiplier', () => {
  it('stays in 0.92-1.08 range', () => {
    const mul = groundingGainMultiplier([36, 48, 60, 72], 'blockhead');
    expect(mul).toBeGreaterThanOrEqual(0.92);
    expect(mul).toBeLessThanOrEqual(1.08);
  });

  it('grounding-focused mood responds more', () => {
    const notes = [36, 43, 60, 72]; // grounded voicing
    const blockhead = groundingGainMultiplier(notes, 'blockhead');
    const syro = groundingGainMultiplier(notes, 'syro');
    expect(Math.abs(blockhead - 1.0)).toBeGreaterThanOrEqual(Math.abs(syro - 1.0));
  });
});

describe('groundingPreference', () => {
  it('blockhead is strongest', () => {
    expect(groundingPreference('blockhead')).toBe(0.60);
  });

  it('syro is weakest', () => {
    expect(groundingPreference('syro')).toBe(0.15);
  });
});
