import { describe, it, expect } from 'vitest';
import {
  voicingSpreadScore,
  spreadWeight,
  voicingSpreadPreference,
} from './voicing-register-distribution';

describe('voicingSpreadScore', () => {
  it('well-spread voicing scores high', () => {
    const score = voicingSpreadScore([48, 55, 64, 72]); // C3 G3 E4 C5
    expect(score).toBeGreaterThan(0.5);
  });

  it('cluster scores lower', () => {
    const cluster = voicingSpreadScore([60, 61, 62]);
    const spread = voicingSpreadScore([48, 60, 72]);
    expect(spread).toBeGreaterThan(cluster);
  });

  it('single note returns 0.5', () => {
    expect(voicingSpreadScore([60])).toBe(0.5);
  });

  it('stays in 0-1 range', () => {
    const score = voicingSpreadScore([36, 48, 60, 72, 84]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('spreadWeight', () => {
  it('ambient prefers wide voicings', () => {
    const wide = spreadWeight([48, 60, 72], 'ambient');
    const tight = spreadWeight([60, 61, 62], 'ambient');
    expect(wide).toBeGreaterThan(tight);
  });

  it('stays in 0.4-1.4 range', () => {
    const w = spreadWeight([60, 64, 67], 'lofi');
    expect(w).toBeGreaterThanOrEqual(0.4);
    expect(w).toBeLessThanOrEqual(1.4);
  });
});

describe('voicingSpreadPreference', () => {
  it('ambient is highest', () => {
    expect(voicingSpreadPreference('ambient')).toBe(0.65);
  });

  it('blockhead is low', () => {
    expect(voicingSpreadPreference('blockhead')).toBe(0.25);
  });
});
