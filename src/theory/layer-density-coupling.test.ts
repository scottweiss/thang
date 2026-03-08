import { describe, it, expect } from 'vitest';
import {
  densityCouplingGain,
  couplingStrength,
} from './layer-density-coupling';

describe('densityCouplingGain', () => {
  it('3 layers is neutral', () => {
    const gain = densityCouplingGain(3, 'ambient');
    expect(gain).toBeCloseTo(1.0, 2);
  });

  it('6 layers gets thinning', () => {
    const gain = densityCouplingGain(6, 'ambient');
    expect(gain).toBeLessThan(1.0);
  });

  it('1 layer gets boost', () => {
    const gain = densityCouplingGain(1, 'ambient');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('ambient thins more than syro', () => {
    const amb = densityCouplingGain(6, 'ambient');
    const syro = densityCouplingGain(6, 'syro');
    expect(amb).toBeLessThan(syro);
  });

  it('stays in 0.85-1.10 range', () => {
    for (let c = 1; c <= 6; c++) {
      const gain = densityCouplingGain(c, 'ambient');
      expect(gain).toBeGreaterThanOrEqual(0.85);
      expect(gain).toBeLessThanOrEqual(1.10);
    }
  });
});

describe('couplingStrength', () => {
  it('ambient is highest', () => {
    expect(couplingStrength('ambient')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(couplingStrength('syro')).toBe(0.30);
  });
});
