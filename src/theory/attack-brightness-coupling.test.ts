import { describe, it, expect } from 'vitest';
import {
  attackBrightnessFm,
  couplingStrength,
} from './attack-brightness-coupling';

describe('attackBrightnessFm', () => {
  it('short attack gets FM boost', () => {
    const fm = attackBrightnessFm(0.003, 'blockhead');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('long attack gets FM reduction', () => {
    const fm = attackBrightnessFm(0.08, 'blockhead');
    expect(fm).toBeLessThan(1.0);
  });

  it('reference attack is near neutral', () => {
    const fm = attackBrightnessFm(0.02, 'blockhead');
    expect(fm).toBeCloseTo(1.0, 2);
  });

  it('blockhead couples more than ambient', () => {
    const bh = attackBrightnessFm(0.003, 'blockhead');
    const amb = attackBrightnessFm(0.003, 'ambient');
    expect(bh).toBeGreaterThan(amb);
  });

  it('stays in 0.94-1.06 range', () => {
    const attacks = [0.001, 0.003, 0.01, 0.02, 0.05, 0.1];
    for (const a of attacks) {
      const fm = attackBrightnessFm(a, 'blockhead');
      expect(fm).toBeGreaterThanOrEqual(0.94);
      expect(fm).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('couplingStrength', () => {
  it('blockhead is highest', () => {
    expect(couplingStrength('blockhead')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(couplingStrength('ambient')).toBe(0.20);
  });
});
