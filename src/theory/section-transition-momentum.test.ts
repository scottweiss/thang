import { describe, it, expect } from 'vitest';
import {
  transitionMomentumGain,
  transitionMomentumStrength,
} from './section-transition-momentum';

describe('transitionMomentumGain', () => {
  it('mid-section is neutral', () => {
    const gain = transitionMomentumGain(0.5, 'trance', 'build');
    expect(gain).toBe(1.0);
  });

  it('end of build gets boost', () => {
    const gain = transitionMomentumGain(0.95, 'trance', 'build');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('end of breakdown gets reduction', () => {
    const gain = transitionMomentumGain(0.95, 'trance', 'breakdown');
    expect(gain).toBeLessThan(1.0);
  });

  it('trance has more momentum than ambient', () => {
    const tr = transitionMomentumGain(0.95, 'trance', 'build');
    const amb = transitionMomentumGain(0.95, 'ambient', 'build');
    expect(tr).toBeGreaterThan(amb);
  });

  it('stays in 0.96-1.05 range', () => {
    for (let p = 0; p <= 1.0; p += 0.05) {
      const gain = transitionMomentumGain(p, 'trance', 'build');
      expect(gain).toBeGreaterThanOrEqual(0.96);
      expect(gain).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('transitionMomentumStrength', () => {
  it('trance is highest', () => {
    expect(transitionMomentumStrength('trance')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(transitionMomentumStrength('syro')).toBe(0.20);
  });
});
