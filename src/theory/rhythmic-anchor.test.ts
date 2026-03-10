import { describe, it, expect } from 'vitest';
import {
  generateRhythmCell,
  layerAdherence,
  anchorGainBias,
  sectionAdherenceMultiplier,
} from './rhythmic-anchor';
import type { Mood, Section } from '../types';

const ALL_MOODS: Mood[] = [
  'ambient', 'downtempo', 'lofi', 'trance', 'avril',
  'xtal', 'syro', 'blockhead', 'flim', 'disco',
];

describe('generateRhythmCell', () => {
  it('returns a 16-element boolean array for each mood', () => {
    for (const mood of ALL_MOODS) {
      const cell = generateRhythmCell(mood);
      expect(cell).toHaveLength(16);
      for (const slot of cell) {
        expect(typeof slot).toBe('boolean');
      }
    }
  });

  it('returns a new array (not a reference to template)', () => {
    const a = generateRhythmCell('lofi');
    const b = generateRhythmCell('lofi');
    // Even if same content, should not be same reference
    expect(a).not.toBe(b);
  });

  it('all 10 moods have cell templates (at least one true slot)', () => {
    for (const mood of ALL_MOODS) {
      const cell = generateRhythmCell(mood);
      expect(cell.some(v => v === true)).toBe(true);
    }
  });
});

describe('layerAdherence', () => {
  it('returns a number between 0 and 1 for known layers', () => {
    const layers = ['texture', 'drone', 'arp', 'melody', 'harmony', 'atmosphere'];
    for (const layer of layers) {
      for (const mood of ALL_MOODS) {
        const val = layerAdherence(layer, mood);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    }
  });

  it('returns 0 for unknown layers', () => {
    expect(layerAdherence('nonexistent', 'lofi')).toBe(0);
    expect(layerAdherence('', 'trance')).toBe(0);
  });

  it('texture has higher adherence than atmosphere for groove moods', () => {
    for (const mood of ['trance', 'disco', 'blockhead'] as Mood[]) {
      expect(layerAdherence('texture', mood)).toBeGreaterThan(
        layerAdherence('atmosphere', mood)
      );
    }
  });
});

describe('anchorGainBias', () => {
  const cell = [true, false, false, false, true, false, false, false,
                true, false, false, false, true, false, false, false];

  it('returns 1.0 when adherence is 0', () => {
    expect(anchorGainBias(cell, 0, 0)).toBe(1.0);
    expect(anchorGainBias(cell, 5, 0)).toBe(1.0);
  });

  it('returns 1.0 for empty cell', () => {
    expect(anchorGainBias([], 0, 0.5)).toBe(1.0);
  });

  it('returns 1.0 for null/undefined cell', () => {
    expect(anchorGainBias(null as unknown as boolean[], 0, 0.5)).toBe(1.0);
  });

  it('boosts on anchor hits (> 1.0)', () => {
    const bias = anchorGainBias(cell, 0, 0.8);  // step 0 is true
    expect(bias).toBeGreaterThan(1.0);
  });

  it('dampens on non-anchor beats (< 1.0)', () => {
    const bias = anchorGainBias(cell, 1, 0.8);  // step 1 is false
    expect(bias).toBeLessThan(1.0);
  });

  it('stronger adherence means bigger boost', () => {
    const low = anchorGainBias(cell, 0, 0.3);
    const high = anchorGainBias(cell, 0, 0.9);
    expect(high).toBeGreaterThan(low);
  });

  it('stronger adherence means bigger dampen', () => {
    const low = anchorGainBias(cell, 1, 0.3);
    const high = anchorGainBias(cell, 1, 0.9);
    expect(high).toBeLessThan(low);
  });

  it('wraps step index around cell length', () => {
    // step 16 should wrap to step 0 (which is true)
    const bias16 = anchorGainBias(cell, 16, 0.5);
    const bias0 = anchorGainBias(cell, 0, 0.5);
    expect(bias16).toBe(bias0);
  });
});

describe('sectionAdherenceMultiplier', () => {
  it('peak is higher than breakdown', () => {
    expect(sectionAdherenceMultiplier('peak')).toBeGreaterThan(
      sectionAdherenceMultiplier('breakdown')
    );
  });

  it('build is higher than intro', () => {
    expect(sectionAdherenceMultiplier('build')).toBeGreaterThan(
      sectionAdherenceMultiplier('intro')
    );
  });

  it('groove returns 1.0 (neutral)', () => {
    expect(sectionAdherenceMultiplier('groove')).toBe(1.0);
  });

  it('all sections return positive values', () => {
    const sections: Section[] = ['intro', 'build', 'peak', 'breakdown', 'groove'];
    for (const s of sections) {
      expect(sectionAdherenceMultiplier(s)).toBeGreaterThan(0);
    }
  });
});
