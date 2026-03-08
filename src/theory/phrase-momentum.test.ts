import { describe, it, expect } from 'vitest';
import {
  momentumGain,
  momentumBrightness,
  momentumIntensity,
} from './phrase-momentum';

describe('momentumGain', () => {
  it('builds through phrase', () => {
    const early = momentumGain(0.2, 'avril', 'build');
    const mid = momentumGain(0.6, 'avril', 'build');
    expect(mid).toBeGreaterThan(early);
  });

  it('releases at phrase end', () => {
    const peak = momentumGain(0.8, 'avril', 'build');
    const end = momentumGain(1.0, 'avril', 'build');
    expect(end).toBeLessThan(peak);
  });

  it('stays in 0.9-1.15 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const g = momentumGain(p, 'trance', 'peak');
      expect(g).toBeGreaterThanOrEqual(0.9);
      expect(g).toBeLessThanOrEqual(1.15);
    }
  });

  it('ambient has less momentum than trance', () => {
    const trance = momentumGain(0.7, 'trance', 'groove');
    const ambient = momentumGain(0.7, 'ambient', 'groove');
    expect(Math.abs(trance - 1.0)).toBeGreaterThan(Math.abs(ambient - 1.0));
  });
});

describe('momentumBrightness', () => {
  it('gets brighter through phrase', () => {
    const early = momentumBrightness(0.1, 'avril', 'build');
    const late = momentumBrightness(0.8, 'avril', 'build');
    expect(late).toBeGreaterThan(early);
  });

  it('stays in 0.95-1.1 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const b = momentumBrightness(p, 'trance', 'peak');
      expect(b).toBeGreaterThanOrEqual(0.95);
      expect(b).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('momentumIntensity', () => {
  it('avril is high', () => {
    expect(momentumIntensity('avril')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(momentumIntensity('ambient')).toBe(0.15);
  });
});
