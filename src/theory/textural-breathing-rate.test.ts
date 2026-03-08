import { describe, it, expect } from 'vitest';
import {
  texturalBreathingGain,
  breathingDepth,
} from './textural-breathing-rate';

describe('texturalBreathingGain', () => {
  it('varies across section progress', () => {
    const start = texturalBreathingGain(0.0, 'ambient', 'intro');
    const mid = texturalBreathingGain(0.25, 'ambient', 'intro');
    expect(start).not.toEqual(mid);
  });

  it('ambient breathes more than syro', () => {
    expect(breathingDepth('ambient')).toBeGreaterThan(breathingDepth('syro'));
  });

  it('stays in 0.88-1.08 range', () => {
    for (let t = 0; t <= 1.0; t += 0.1) {
      const gain = texturalBreathingGain(t, 'ambient', 'peak');
      expect(gain).toBeGreaterThanOrEqual(0.88);
      expect(gain).toBeLessThanOrEqual(1.08);
    }
  });
});

describe('breathingDepth', () => {
  it('ambient is deepest', () => {
    expect(breathingDepth('ambient')).toBe(0.60);
  });

  it('disco is shallow', () => {
    expect(breathingDepth('disco')).toBe(0.20);
  });
});
