import { describe, it, expect } from 'vitest';
import {
  qualityDecayMultiplier,
  qualitySustainMultiplier,
  shouldApplySustainShape,
  sustainSensitivity,
} from './chord-sustain-shape';

describe('qualityDecayMultiplier', () => {
  it('major is near 1.0', () => {
    expect(qualityDecayMultiplier('maj', 'lofi')).toBeCloseTo(1.0, 1);
  });

  it('dom7 has shorter decay', () => {
    expect(qualityDecayMultiplier('dom7', 'lofi')).toBeLessThan(1.0);
  });

  it('sus2 has longer decay', () => {
    expect(qualityDecayMultiplier('sus2', 'lofi')).toBeGreaterThan(1.0);
  });

  it('dim has shortest decay', () => {
    const dim = qualityDecayMultiplier('dim', 'lofi');
    const dom7 = qualityDecayMultiplier('dom7', 'lofi');
    expect(dim).toBeLessThan(dom7);
  });

  it('trance has less sensitivity', () => {
    const tranceDom = qualityDecayMultiplier('dom7', 'trance');
    const lofiDom = qualityDecayMultiplier('dom7', 'lofi');
    // Both less than 1.0, but trance should be closer to 1.0
    expect(Math.abs(tranceDom - 1.0)).toBeLessThan(Math.abs(lofiDom - 1.0));
  });
});

describe('qualitySustainMultiplier', () => {
  it('major is neutral', () => {
    expect(qualitySustainMultiplier('maj', 'lofi')).toBeCloseTo(1.0, 1);
  });

  it('less extreme than decay', () => {
    const decay = Math.abs(qualityDecayMultiplier('dom7', 'lofi') - 1.0);
    const sustain = Math.abs(qualitySustainMultiplier('dom7', 'lofi') - 1.0);
    expect(sustain).toBeLessThan(decay);
  });
});

describe('shouldApplySustainShape', () => {
  it('lofi applies', () => {
    expect(shouldApplySustainShape('lofi')).toBe(true);
  });

  it('trance applies', () => {
    // 0.20 > 0.15
    expect(shouldApplySustainShape('trance')).toBe(true);
  });
});

describe('sustainSensitivity', () => {
  it('lofi is highest', () => {
    expect(sustainSensitivity('lofi')).toBe(0.55);
  });

  it('trance and syro are lowest', () => {
    expect(sustainSensitivity('trance')).toBe(0.20);
    expect(sustainSensitivity('syro')).toBe(0.20);
  });
});
