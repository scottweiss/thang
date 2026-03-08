import { describe, it, expect } from 'vitest';
import {
  harmonicTemperature,
  temperatureLpf,
  temperatureFm,
  temperatureSensitivity,
} from './harmonic-color-temperature';

describe('harmonicTemperature', () => {
  it('major is warm', () => {
    expect(harmonicTemperature('maj')).toBe(0.7);
  });

  it('minor is cool', () => {
    expect(harmonicTemperature('min')).toBe(0.3);
  });

  it('dim is coldest', () => {
    expect(harmonicTemperature('dim')).toBe(0.1);
  });

  it('maj7 is warmest', () => {
    expect(harmonicTemperature('maj7')).toBe(0.8);
  });

  it('unknown returns 0.5', () => {
    expect(harmonicTemperature('weird')).toBe(0.5);
  });
});

describe('temperatureLpf', () => {
  it('warm chords are brighter', () => {
    const warm = temperatureLpf('maj7', 'lofi');
    const cool = temperatureLpf('dim', 'lofi');
    expect(warm).toBeGreaterThan(cool);
  });

  it('stays in 0.85-1.15 range', () => {
    for (const q of ['maj', 'min', 'dim', 'aug', 'maj7']) {
      const lpf = temperatureLpf(q, 'ambient');
      expect(lpf).toBeGreaterThanOrEqual(0.85);
      expect(lpf).toBeLessThanOrEqual(1.15);
    }
  });

  it('ambient is more sensitive than syro', () => {
    const ambientRange = temperatureLpf('maj7', 'ambient') - temperatureLpf('dim', 'ambient');
    const syroRange = temperatureLpf('maj7', 'syro') - temperatureLpf('dim', 'syro');
    expect(ambientRange).toBeGreaterThan(syroRange);
  });
});

describe('temperatureFm', () => {
  it('cool chords get more FM', () => {
    const cool = temperatureFm('dim', 'lofi');
    const warm = temperatureFm('maj7', 'lofi');
    expect(cool).toBeGreaterThan(warm);
  });

  it('stays in 0.8-1.3 range', () => {
    for (const q of ['maj', 'min', 'dim', 'aug']) {
      const fm = temperatureFm(q, 'ambient');
      expect(fm).toBeGreaterThanOrEqual(0.8);
      expect(fm).toBeLessThanOrEqual(1.3);
    }
  });
});

describe('temperatureSensitivity', () => {
  it('ambient is highest', () => {
    expect(temperatureSensitivity('ambient')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(temperatureSensitivity('syro')).toBe(0.20);
  });
});
