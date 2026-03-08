import { describe, it, expect } from 'vitest';
import {
  layerPanCenter,
  adjustPanRange,
  shouldApplyStereoPlacement,
} from './stereo-placement';

describe('layerPanCenter', () => {
  it('drone is centered', () => {
    expect(layerPanCenter('drone', 'ambient')).toBeCloseTo(0.5, 2);
  });

  it('harmony is left of center', () => {
    const center = layerPanCenter('harmony', 'ambient');
    expect(center).toBeLessThan(0.5);
  });

  it('arp is right of center', () => {
    const center = layerPanCenter('arp', 'ambient');
    expect(center).toBeGreaterThan(0.5);
  });

  it('melody is slightly right of center', () => {
    const center = layerPanCenter('melody', 'ambient');
    expect(center).toBeGreaterThan(0.5);
    expect(center).toBeLessThan(0.6); // only slightly
  });

  it('trance has less spread than ambient', () => {
    const ambHarmony = layerPanCenter('harmony', 'ambient');
    const tranceHarmony = layerPanCenter('harmony', 'trance');
    // Ambient harmony should be more left than trance harmony
    expect(ambHarmony).toBeLessThan(tranceHarmony);
  });

  it('texture is centered for all moods', () => {
    const moods = ['ambient', 'trance', 'lofi', 'disco'] as const;
    for (const mood of moods) {
      expect(layerPanCenter('texture', mood)).toBeCloseTo(0.5, 2);
    }
  });
});

describe('adjustPanRange', () => {
  it('shifts harmony range to the left', () => {
    const [min, max] = adjustPanRange(0.3, 0.7, 'harmony', 'ambient');
    const center = (min + max) / 2;
    expect(center).toBeLessThan(0.5);
  });

  it('shifts arp range to the right', () => {
    const [min, max] = adjustPanRange(0.3, 0.7, 'arp', 'ambient');
    const center = (min + max) / 2;
    expect(center).toBeGreaterThan(0.5);
  });

  it('preserves range width', () => {
    const originalWidth = 0.7 - 0.3;
    const [min, max] = adjustPanRange(0.3, 0.7, 'melody', 'lofi');
    const newWidth = max - min;
    // Width might be clamped at edges but should be close
    expect(newWidth).toBeCloseTo(originalWidth, 1);
  });

  it('clamps to safe range', () => {
    const [min, max] = adjustPanRange(0.0, 1.0, 'harmony', 'ambient');
    expect(min).toBeGreaterThanOrEqual(0.05);
    expect(max).toBeLessThanOrEqual(0.95);
  });

  it('drone stays centered', () => {
    const [min, max] = adjustPanRange(0.3, 0.7, 'drone', 'ambient');
    expect((min + max) / 2).toBeCloseTo(0.5, 2);
  });
});

describe('shouldApplyStereoPlacement', () => {
  it('true for ambient', () => {
    expect(shouldApplyStereoPlacement('ambient')).toBe(true);
  });

  it('true for trance', () => {
    expect(shouldApplyStereoPlacement('trance')).toBe(true);
  });

  it('true for all moods', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril',
                   'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      expect(shouldApplyStereoPlacement(mood)).toBe(true);
    }
  });
});
