import { describe, it, expect } from 'vitest';
import {
  rootMotionFm,
  motionColorSensitivity,
} from './harmonic-root-motion-color';

describe('rootMotionFm', () => {
  it('step motion is warm (slight reduction)', () => {
    const fm = rootMotionFm('C', 'D', 'avril');
    expect(fm).toBeLessThan(1.0);
  });

  it('fifth leap is bright (slight boost)', () => {
    const fm = rootMotionFm('C', 'G', 'avril');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('no motion is neutral', () => {
    const fm = rootMotionFm('C', 'C', 'avril');
    expect(fm).toBe(1.0);
  });

  it('avril is more sensitive than disco', () => {
    const av = rootMotionFm('C', 'G', 'avril');
    const di = rootMotionFm('C', 'G', 'disco');
    expect(av).toBeGreaterThan(di);
  });

  it('stays in 0.94-1.06 range', () => {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Db', 'Eb', 'Gb', 'Ab', 'Bb'];
    for (const r of roots) {
      const fm = rootMotionFm('C', r, 'avril');
      expect(fm).toBeGreaterThanOrEqual(0.94);
      expect(fm).toBeLessThanOrEqual(1.06);
    }
  });
});

describe('motionColorSensitivity', () => {
  it('avril is high', () => {
    expect(motionColorSensitivity('avril')).toBe(0.55);
  });

  it('disco is lowest', () => {
    expect(motionColorSensitivity('disco')).toBe(0.20);
  });
});
