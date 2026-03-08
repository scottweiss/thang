import { describe, it, expect } from 'vitest';
import {
  densityWavePhase,
  densityWaveGain,
  waveAmplitude,
} from './harmonic-density-wave';

describe('densityWavePhase', () => {
  it('oscillates through section', () => {
    const start = densityWavePhase(0, 'ambient', 'groove');
    const quarter = densityWavePhase(0.25, 'ambient', 'groove');
    expect(start).not.toBeCloseTo(quarter, 1);
  });

  it('stays in -1 to 1 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const phase = densityWavePhase(p, 'ambient', 'peak');
      expect(phase).toBeGreaterThanOrEqual(-1);
      expect(phase).toBeLessThanOrEqual(1);
    }
  });

  it('low-amplitude mood varies less', () => {
    const ambientRange = Math.abs(densityWavePhase(0.25, 'ambient', 'groove'));
    const syroRange = Math.abs(densityWavePhase(0.25, 'syro', 'groove'));
    expect(ambientRange).toBeGreaterThan(syroRange);
  });
});

describe('densityWaveGain', () => {
  it('stays in 0.88-1.12 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const gain = densityWaveGain(p, 'ambient', 'peak');
      expect(gain).toBeGreaterThanOrEqual(0.88);
      expect(gain).toBeLessThanOrEqual(1.12);
    }
  });
});

describe('waveAmplitude', () => {
  it('ambient is highest', () => {
    expect(waveAmplitude('ambient')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(waveAmplitude('syro')).toBe(0.20);
  });
});
