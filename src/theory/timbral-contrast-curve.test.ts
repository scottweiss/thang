import { describe, it, expect } from 'vitest';
import {
  timbralContrastMultiplier,
  contrastRange,
  shouldApplyTimbralContrast,
} from './timbral-contrast-curve';

describe('timbralContrastMultiplier', () => {
  it('higher at peak progress than edges', () => {
    const atPeak = timbralContrastMultiplier(0.5, 'flim', 'groove');
    const atStart = timbralContrastMultiplier(0.0, 'flim', 'groove');
    const atEnd = timbralContrastMultiplier(1.0, 'flim', 'groove');
    expect(atPeak).toBeGreaterThan(atStart);
    expect(atPeak).toBeGreaterThan(atEnd);
  });

  it('build section peaks late', () => {
    const early = timbralContrastMultiplier(0.2, 'flim', 'build');
    const late = timbralContrastMultiplier(0.8, 'flim', 'build');
    expect(late).toBeGreaterThan(early);
  });

  it('stays in 0.7-1.5 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const m = timbralContrastMultiplier(p, 'xtal', 'peak');
      expect(m).toBeGreaterThanOrEqual(0.7);
      expect(m).toBeLessThanOrEqual(1.5);
    }
  });

  it('xtal has wider range than avril', () => {
    const xtalPeak = timbralContrastMultiplier(0.5, 'xtal', 'groove');
    const xtalEdge = timbralContrastMultiplier(0.0, 'xtal', 'groove');
    const avrilPeak = timbralContrastMultiplier(0.5, 'avril', 'groove');
    const avrilEdge = timbralContrastMultiplier(0.0, 'avril', 'groove');
    expect(xtalPeak - xtalEdge).toBeGreaterThan(avrilPeak - avrilEdge);
  });
});

describe('contrastRange', () => {
  it('xtal is highest', () => {
    expect(contrastRange('xtal')).toBe(0.60);
  });

  it('avril is lowest', () => {
    expect(contrastRange('avril')).toBe(0.30);
  });
});

describe('shouldApplyTimbralContrast', () => {
  it('true for all moods', () => {
    expect(shouldApplyTimbralContrast('trance')).toBe(true);
    expect(shouldApplyTimbralContrast('ambient')).toBe(true);
  });
});
