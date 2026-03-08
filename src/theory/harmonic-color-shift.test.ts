import { describe, it, expect } from 'vitest';
import {
  colorShiftLpf,
  colorSensitivity,
} from './harmonic-color-shift';

describe('colorShiftLpf', () => {
  it('major chord is brighter', () => {
    const lpf = colorShiftLpf('maj7', 'lofi');
    expect(lpf).toBeGreaterThan(1.0);
  });

  it('minor chord is darker', () => {
    const lpf = colorShiftLpf('min', 'lofi');
    expect(lpf).toBeLessThan(1.0);
  });

  it('dim chord is darkest', () => {
    const dim = colorShiftLpf('dim', 'lofi');
    const min = colorShiftLpf('min', 'lofi');
    expect(dim).toBeLessThan(min);
  });

  it('lofi has more color than syro', () => {
    const lofiMin = colorShiftLpf('min', 'lofi');
    const syroMin = colorShiftLpf('min', 'syro');
    expect(lofiMin).toBeLessThan(syroMin); // lofi darkens more
  });

  it('stays in 0.85-1.12 range', () => {
    const qualities = ['maj', 'min', 'maj7', 'min7', 'dom7', 'dim', 'aug'] as const;
    for (const q of qualities) {
      const lpf = colorShiftLpf(q, 'lofi');
      expect(lpf).toBeGreaterThanOrEqual(0.85);
      expect(lpf).toBeLessThanOrEqual(1.12);
    }
  });
});

describe('colorSensitivity', () => {
  it('lofi is highest', () => {
    expect(colorSensitivity('lofi')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(colorSensitivity('syro')).toBe(0.25);
  });
});
