import { describe, it, expect } from 'vitest';
import {
  contourArcShapingGain,
  arcStrengthValue,
} from './melodic-contour-arc-shaping';

describe('contourArcShapingGain', () => {
  it('ascending before peak gets boost', () => {
    const gain = contourArcShapingGain(0.3, 1, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('descending after peak gets boost', () => {
    const gain = contourArcShapingGain(0.8, -1, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('descending before peak gets penalty', () => {
    const gain = contourArcShapingGain(0.3, -1, 'avril', 'peak');
    expect(gain).toBeLessThan(1.0);
  });

  it('static motion is neutral', () => {
    const gain = contourArcShapingGain(0.3, 0, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('avril shapes more than ambient', () => {
    const av = contourArcShapingGain(0.3, 1, 'avril', 'peak');
    const amb = contourArcShapingGain(0.3, 1, 'ambient', 'peak');
    expect(av).toBeGreaterThan(amb);
  });

  it('stays in 0.98-1.03 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      for (const dir of [-1, 0, 1]) {
        const gain = contourArcShapingGain(p, dir, 'avril', 'peak');
        expect(gain).toBeGreaterThanOrEqual(0.98);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('arcStrengthValue', () => {
  it('avril is highest', () => {
    expect(arcStrengthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(arcStrengthValue('blockhead')).toBe(0.15);
  });
});
