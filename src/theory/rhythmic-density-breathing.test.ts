import { describe, it, expect } from 'vitest';
import {
  densityBreathingGain,
  breathingAmplitude,
} from './rhythmic-density-breathing';

describe('densityBreathingGain', () => {
  it('produces variation over time', () => {
    const values = new Set<string>();
    for (let t = 0; t < 20; t++) {
      values.add(densityBreathingGain(t, 0, 'ambient', 'groove').toFixed(4));
    }
    expect(values.size).toBeGreaterThan(3);
  });

  it('different layers have different phases', () => {
    const a = densityBreathingGain(5, 0, 'ambient', 'groove');
    const b = densityBreathingGain(5, 3, 'ambient', 'groove');
    expect(a).not.toBeCloseTo(b, 3);
  });

  it('ambient breathes more than trance', () => {
    // Over many ticks, ambient should have wider range
    let ambRange = 0, trRange = 0;
    let ambMin = 2, ambMax = 0, trMin = 2, trMax = 0;
    for (let t = 0; t < 100; t++) {
      const a = densityBreathingGain(t, 0, 'ambient', 'groove');
      const tr = densityBreathingGain(t, 0, 'trance', 'groove');
      ambMin = Math.min(ambMin, a); ambMax = Math.max(ambMax, a);
      trMin = Math.min(trMin, tr); trMax = Math.max(trMax, tr);
    }
    ambRange = ambMax - ambMin;
    trRange = trMax - trMin;
    expect(ambRange).toBeGreaterThan(trRange);
  });

  it('stays in 0.96-1.04 range', () => {
    for (let t = 0; t < 100; t++) {
      for (let l = 0; l < 6; l++) {
        const gain = densityBreathingGain(t, l, 'ambient', 'breakdown');
        expect(gain).toBeGreaterThanOrEqual(0.96);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('breathingAmplitude', () => {
  it('ambient is highest', () => {
    expect(breathingAmplitude('ambient')).toBe(0.55);
  });

  it('trance is lowest', () => {
    expect(breathingAmplitude('trance')).toBe(0.15);
  });
});
