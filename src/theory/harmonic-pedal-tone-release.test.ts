import { describe, it, expect } from 'vitest';
import {
  pedalReleaseIntensity,
  pedalReleaseGain,
  releaseStrengthValue,
} from './harmonic-pedal-tone-release';

describe('pedalReleaseIntensity', () => {
  it('no change = 0', () => {
    expect(pedalReleaseIntensity(10, false)).toBe(0);
  });

  it('short hold + change = 0', () => {
    expect(pedalReleaseIntensity(2, true)).toBe(0);
  });

  it('long hold + change = positive', () => {
    expect(pedalReleaseIntensity(8, true)).toBeGreaterThan(0);
  });

  it('longer hold = higher intensity', () => {
    expect(pedalReleaseIntensity(12, true)).toBeGreaterThan(
      pedalReleaseIntensity(6, true)
    );
  });

  it('caps at 1.0', () => {
    expect(pedalReleaseIntensity(100, true)).toBe(1.0);
  });
});

describe('pedalReleaseGain', () => {
  it('pedal release gets boost', () => {
    const gain = pedalReleaseGain(8, true, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('no release is neutral', () => {
    const gain = pedalReleaseGain(8, false, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('avril boosts more than syro', () => {
    const av = pedalReleaseGain(8, true, 'avril', 'peak');
    const sy = pedalReleaseGain(8, true, 'syro', 'peak');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 1.0-1.04 range', () => {
    for (let t = 0; t <= 20; t++) {
      const gain = pedalReleaseGain(t, true, 'avril', 'peak');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('releaseStrengthValue', () => {
  it('avril is highest', () => {
    expect(releaseStrengthValue('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(releaseStrengthValue('syro')).toBe(0.20);
  });
});
