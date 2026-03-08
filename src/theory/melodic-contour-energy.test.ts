import { describe, it, expect } from 'vitest';
import {
  contourEnergyGain,
  contourDepth,
} from './melodic-contour-energy';

describe('contourEnergyGain', () => {
  it('ascending gets boost', () => {
    const gain = contourEnergyGain('ascending', 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('descending gets reduction', () => {
    const gain = contourEnergyGain('descending', 'avril');
    expect(gain).toBeLessThan(1.0);
  });

  it('static is neutral', () => {
    const gain = contourEnergyGain('static', 'avril');
    expect(gain).toBe(1.0);
  });

  it('avril is deeper than syro', () => {
    const av = contourEnergyGain('ascending', 'avril');
    const sy = contourEnergyGain('ascending', 'syro');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 0.97-1.04 range', () => {
    for (const dir of ['ascending', 'descending', 'static'] as const) {
      const gain = contourEnergyGain(dir, 'avril');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('contourDepth', () => {
  it('avril is highest', () => {
    expect(contourDepth('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(contourDepth('syro')).toBe(0.20);
  });
});
