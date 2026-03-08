import { describe, it, expect } from 'vitest';
import {
  interchangeBrightness,
  interchangeFm,
  interchangeSensitivity,
} from './modal-interchange-brightness';

describe('interchangeBrightness', () => {
  it('lydian is brightest', () => {
    const lydian = interchangeBrightness('lydian', 'lofi');
    const phrygian = interchangeBrightness('phrygian', 'lofi');
    expect(lydian).toBeGreaterThan(phrygian);
  });

  it('neutral mode returns near 1.0', () => {
    const mix = interchangeBrightness('mixolydian', 'lofi');
    expect(mix).toBeCloseTo(1.0, 1);
  });

  it('stays in 0.85-1.2 range', () => {
    for (const mode of ['lydian', 'ionian', 'dorian', 'aeolian', 'locrian']) {
      const b = interchangeBrightness(mode, 'ambient');
      expect(b).toBeGreaterThanOrEqual(0.85);
      expect(b).toBeLessThanOrEqual(1.2);
    }
  });

  it('ambient is more sensitive than disco', () => {
    const ambRange = interchangeBrightness('lydian', 'ambient') - interchangeBrightness('locrian', 'ambient');
    const discoRange = interchangeBrightness('lydian', 'disco') - interchangeBrightness('locrian', 'disco');
    expect(ambRange).toBeGreaterThan(discoRange);
  });
});

describe('interchangeFm', () => {
  it('dark modes get more FM', () => {
    const dark = interchangeFm('locrian', 'lofi');
    const bright = interchangeFm('lydian', 'lofi');
    expect(dark).toBeGreaterThan(bright);
  });

  it('stays in 0.8-1.25 range', () => {
    for (const mode of ['lydian', 'locrian', 'dorian']) {
      const fm = interchangeFm(mode, 'ambient');
      expect(fm).toBeGreaterThanOrEqual(0.8);
      expect(fm).toBeLessThanOrEqual(1.25);
    }
  });
});

describe('interchangeSensitivity', () => {
  it('ambient is highest', () => {
    expect(interchangeSensitivity('ambient')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(interchangeSensitivity('disco')).toBe(0.20);
  });
});
