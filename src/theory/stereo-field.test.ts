import { describe, it, expect } from 'vitest';
import { stereoWidth, panRange, panLfoSpeed } from './stereo-field';

describe('stereoWidth', () => {
  it('returns low width for intro', () => {
    const w = stereoWidth('intro', 0.3);
    expect(w).toBeGreaterThanOrEqual(0.2);
    expect(w).toBeLessThanOrEqual(0.5);
  });

  it('returns high width for peak', () => {
    const w = stereoWidth('peak', 0.8);
    expect(w).toBeGreaterThan(0.8);
    expect(w).toBeLessThanOrEqual(1.0);
  });

  it('peak is wider than breakdown at same tension', () => {
    expect(stereoWidth('peak', 0.5)).toBeGreaterThan(stereoWidth('breakdown', 0.5));
  });

  it('higher tension increases width', () => {
    expect(stereoWidth('build', 0.9)).toBeGreaterThan(stereoWidth('build', 0.1));
  });

  it('clamps to 0-1 range', () => {
    expect(stereoWidth('peak', 1.5)).toBeLessThanOrEqual(1.0);
    expect(stereoWidth('intro', -0.5)).toBeGreaterThanOrEqual(0);
  });

  it('groove is wider than build', () => {
    expect(stereoWidth('groove', 0.5)).toBeGreaterThan(stereoWidth('build', 0.5));
  });
});

describe('panRange', () => {
  it('drone stays near center', () => {
    const { min, max } = panRange('drone', 'peak', 1.0);
    expect(min).toBeGreaterThanOrEqual(0.4);
    expect(max).toBeLessThanOrEqual(0.6);
  });

  it('melody spreads wider at peaks than intros', () => {
    const peak = panRange('melody', 'peak', 0.8);
    const intro = panRange('melody', 'intro', 0.3);
    const peakWidth = peak.max - peak.min;
    const introWidth = intro.max - intro.min;
    expect(peakWidth).toBeGreaterThan(introWidth);
  });

  it('atmosphere has widest spread at peaks', () => {
    const atmo = panRange('atmosphere', 'peak', 1.0);
    const melody = panRange('melody', 'peak', 1.0);
    expect(atmo.max - atmo.min).toBeGreaterThan(melody.max - melody.min);
  });

  it('all ranges stay within 0-1', () => {
    const layers = ['drone', 'harmony', 'melody', 'texture', 'arp', 'atmosphere'];
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const layer of layers) {
      for (const section of sections) {
        const { min, max } = panRange(layer, section, 1.0);
        expect(min).toBeGreaterThanOrEqual(0);
        expect(max).toBeLessThanOrEqual(1);
        expect(max).toBeGreaterThanOrEqual(min);
      }
    }
  });

  it('unknown layer gets default centered range', () => {
    const { min, max } = panRange('unknown', 'peak', 0.5);
    expect(min).toBeGreaterThanOrEqual(0.3);
    expect(max).toBeLessThanOrEqual(0.7);
  });

  it('harmony and melody are on opposite sides', () => {
    const harmony = panRange('harmony', 'groove', 0.5);
    const melody = panRange('melody', 'groove', 0.5);
    const harmonyCenter = (harmony.min + harmony.max) / 2;
    const melodyCenter = (melody.min + melody.max) / 2;
    expect(harmonyCenter).toBeLessThan(0.5);
    expect(melodyCenter).toBeGreaterThan(0.5);
  });
});

describe('panLfoSpeed', () => {
  it('drone is slowest', () => {
    expect(panLfoSpeed('drone')).toBeGreaterThan(panLfoSpeed('melody'));
  });

  it('arp is fastest', () => {
    const layers = ['drone', 'atmosphere', 'harmony', 'melody', 'texture'];
    for (const layer of layers) {
      expect(panLfoSpeed('arp')).toBeLessThan(panLfoSpeed(layer));
    }
  });

  it('unknown layer gets default', () => {
    expect(panLfoSpeed('unknown')).toBe(11);
  });
});
