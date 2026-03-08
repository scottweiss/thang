import { describe, it, expect } from 'vitest';
import {
  sustainTrackingDecay,
  sustainSensitivity,
} from './dynamic-sustain-tracking';

describe('sustainTrackingDecay', () => {
  it('many layers shortens decay', () => {
    const decay = sustainTrackingDecay(6, 'blockhead');
    expect(decay).toBeLessThan(1.0);
  });

  it('few layers lengthens decay', () => {
    const decay = sustainTrackingDecay(1, 'blockhead');
    expect(decay).toBeGreaterThan(1.0);
  });

  it('3 layers is near neutral', () => {
    const decay = sustainTrackingDecay(3, 'blockhead');
    expect(decay).toBeCloseTo(1.0, 2);
  });

  it('blockhead is more sensitive than ambient', () => {
    const bh = sustainTrackingDecay(6, 'blockhead');
    const amb = sustainTrackingDecay(6, 'ambient');
    expect(bh).toBeLessThan(amb);
  });

  it('stays in 0.90-1.08 range', () => {
    for (let l = 1; l <= 6; l++) {
      const decay = sustainTrackingDecay(l, 'blockhead');
      expect(decay).toBeGreaterThanOrEqual(0.90);
      expect(decay).toBeLessThanOrEqual(1.08);
    }
  });
});

describe('sustainSensitivity', () => {
  it('blockhead is high', () => {
    expect(sustainSensitivity('blockhead')).toBe(0.55);
  });

  it('ambient is low', () => {
    expect(sustainSensitivity('ambient')).toBe(0.25);
  });
});
