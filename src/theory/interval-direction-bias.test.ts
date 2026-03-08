import { describe, it, expect } from 'vitest';
import {
  directionBiasGain,
  moodDirection,
} from './interval-direction-bias';

describe('directionBiasGain', () => {
  it('ascending in build gets boost', () => {
    const gain = directionBiasGain(1, 'avril', 'build');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('descending in breakdown gets boost', () => {
    const gain = directionBiasGain(-1, 'ambient', 'breakdown');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('ascending in breakdown gets reduction', () => {
    const gain = directionBiasGain(1, 'ambient', 'breakdown');
    expect(gain).toBeLessThan(1.0);
  });

  it('unison is neutral', () => {
    const gain = directionBiasGain(0, 'avril', 'build');
    expect(gain).toBe(1.0);
  });

  it('stays in 0.93-1.07 range', () => {
    for (const dir of [-1, 0, 1]) {
      const gain = directionBiasGain(dir, 'syro', 'peak');
      expect(gain).toBeGreaterThanOrEqual(0.93);
      expect(gain).toBeLessThanOrEqual(1.07);
    }
  });
});

describe('moodDirection', () => {
  it('avril is most ascending', () => {
    expect(moodDirection('avril')).toBe(0.35);
  });

  it('ambient is most descending', () => {
    expect(moodDirection('ambient')).toBe(-0.25);
  });
});
