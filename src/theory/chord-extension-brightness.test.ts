import { describe, it, expect } from 'vitest';
import {
  extensionBrightnessFm,
  extensionSensitivity,
} from './chord-extension-brightness';

describe('extensionBrightnessFm', () => {
  it('triad is neutral (1.0)', () => {
    const fm = extensionBrightnessFm('maj', 'lofi');
    expect(fm).toBe(1.0);
  });

  it('min9 gets boost', () => {
    const fm = extensionBrightnessFm('min9', 'lofi');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('dom7 gets moderate boost', () => {
    const fm7 = extensionBrightnessFm('dom7', 'lofi');
    const fm9 = extensionBrightnessFm('min9', 'lofi');
    expect(fm7).toBeGreaterThan(1.0);
    expect(fm9).toBeGreaterThan(fm7);
  });

  it('lofi is more sensitive than trance', () => {
    const lofi = extensionBrightnessFm('min9', 'lofi');
    const trance = extensionBrightnessFm('min9', 'trance');
    expect(lofi).toBeGreaterThan(trance);
  });

  it('stays in 1.0-1.06 range', () => {
    const quals = ['maj', 'min', 'dom7', 'maj7', 'min7', 'add9', 'min9', 'sus2', 'sus4', 'dim', 'aug'] as const;
    for (const q of quals) {
      const fm = extensionBrightnessFm(q, 'lofi');
      expect(fm).toBeGreaterThanOrEqual(1.0);
      expect(fm).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('extensionSensitivity', () => {
  it('lofi is high', () => {
    expect(extensionSensitivity('lofi')).toBe(0.55);
  });

  it('trance is low', () => {
    expect(extensionSensitivity('trance')).toBe(0.20);
  });
});
