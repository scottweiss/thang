import { describe, it, expect } from 'vitest';
import {
  articulationContrastDecay,
  articulationContrastStrength,
} from './dynamic-articulation-contrast';

describe('articulationContrastDecay', () => {
  it('drone sustains more when short layers active', () => {
    const decay = articulationContrastDecay('drone', ['drone', 'texture', 'arp'], 'lofi');
    expect(decay).toBeGreaterThan(1.0);
  });

  it('arp gets shorter when sustained layers active', () => {
    const decay = articulationContrastDecay('arp', ['arp', 'drone', 'harmony', 'atmosphere'], 'lofi');
    expect(decay).toBeLessThan(1.0);
  });

  it('1.0 when alone', () => {
    expect(articulationContrastDecay('melody', ['melody'], 'lofi')).toBe(1.0);
  });

  it('stays in 0.7-1.4 range', () => {
    const layers = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];
    for (const l of layers) {
      const d = articulationContrastDecay(l, layers, 'avril');
      expect(d).toBeGreaterThanOrEqual(0.7);
      expect(d).toBeLessThanOrEqual(1.4);
    }
  });

  it('lofi contrasts more than ambient', () => {
    const lofi = articulationContrastDecay('arp', ['arp', 'drone', 'harmony'], 'lofi');
    const ambient = articulationContrastDecay('arp', ['arp', 'drone', 'harmony'], 'ambient');
    expect(Math.abs(lofi - 1.0)).toBeGreaterThan(Math.abs(ambient - 1.0));
  });
});

describe('articulationContrastStrength', () => {
  it('avril is high', () => {
    expect(articulationContrastStrength('avril')).toBe(0.55);
  });

  it('ambient is low', () => {
    expect(articulationContrastStrength('ambient')).toBe(0.20);
  });
});
