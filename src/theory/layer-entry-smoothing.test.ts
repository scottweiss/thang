import { describe, it, expect } from 'vitest';
import {
  entryAttackMultiplier,
  smoothingDepth,
} from './layer-entry-smoothing';

describe('entryAttackMultiplier', () => {
  it('entering layer gets longer attack', () => {
    const mult = entryAttackMultiplier(0.2, 'ambient');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('established layer is neutral', () => {
    const mult = entryAttackMultiplier(1.0, 'ambient');
    expect(mult).toBe(1.0);
  });

  it('lower gain = more smoothing', () => {
    const low = entryAttackMultiplier(0.1, 'ambient');
    const mid = entryAttackMultiplier(0.5, 'ambient');
    expect(low).toBeGreaterThan(mid);
  });

  it('ambient smooths more than blockhead', () => {
    const amb = entryAttackMultiplier(0.2, 'ambient');
    const bh = entryAttackMultiplier(0.2, 'blockhead');
    expect(amb).toBeGreaterThan(bh);
  });

  it('stays in 1.0-1.15 range', () => {
    for (let g = 0; g <= 1.0; g += 0.1) {
      const mult = entryAttackMultiplier(g, 'ambient');
      expect(mult).toBeGreaterThanOrEqual(1.0);
      expect(mult).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('smoothingDepth', () => {
  it('ambient is deepest', () => {
    expect(smoothingDepth('ambient')).toBe(0.60);
  });

  it('blockhead is shallowest', () => {
    expect(smoothingDepth('blockhead')).toBe(0.20);
  });
});
