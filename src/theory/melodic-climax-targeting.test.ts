import { describe, it, expect } from 'vitest';
import {
  climaxTargetingGain,
  climaxIntensityValue,
} from './melodic-climax-targeting';

describe('climaxTargetingGain', () => {
  it('at peak gets boost', () => {
    const gain = climaxTargetingGain(72, 72, 12, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('far from peak is neutral', () => {
    const gain = climaxTargetingGain(60, 72, 12, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('closer to peak = more boost', () => {
    const near = climaxTargetingGain(70, 72, 12, 'avril', 'peak');
    const at = climaxTargetingGain(72, 72, 12, 'avril', 'peak');
    expect(at).toBeGreaterThan(near);
  });

  it('zero range is neutral', () => {
    const gain = climaxTargetingGain(60, 60, 0, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('avril boosts more than ambient', () => {
    const av = climaxTargetingGain(72, 72, 12, 'avril', 'peak');
    const amb = climaxTargetingGain(72, 72, 12, 'ambient', 'peak');
    expect(av).toBeGreaterThan(amb);
  });

  it('stays in 1.0-1.04 range', () => {
    for (let p = 60; p <= 72; p++) {
      const gain = climaxTargetingGain(p, 72, 12, 'avril', 'peak');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('climaxIntensityValue', () => {
  it('avril is highest', () => {
    expect(climaxIntensityValue('avril')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(climaxIntensityValue('ambient')).toBe(0.15);
  });
});
