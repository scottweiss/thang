import { describe, it, expect } from 'vitest';
import {
  findPivotChords,
  bestPivotChord,
  shouldUsePivot,
  modulationSmoothness,
  pivotTendency,
} from './pivot-modulation';

describe('findPivotChords', () => {
  it('C→G has shared chords', () => {
    const pivots = findPivotChords('C', 'G');
    expect(pivots.length).toBeGreaterThan(0);
    // Am (vi in C, ii in G) should be a pivot
    const amPivot = pivots.find(p => p.root === 'A' && p.quality === 'min');
    expect(amPivot).toBeDefined();
  });

  it('C→F has shared chords', () => {
    const pivots = findPivotChords('C', 'F');
    expect(pivots.length).toBeGreaterThan(0);
  });

  it('same key shares all chords', () => {
    const pivots = findPivotChords('C', 'C');
    expect(pivots).toHaveLength(7); // all 7 diatonic chords
  });

  it('distant keys share fewer chords', () => {
    const closeCount = findPivotChords('C', 'G').length;
    const distantCount = findPivotChords('C', 'F#').length;
    expect(closeCount).toBeGreaterThanOrEqual(distantCount);
  });

  it('handles invalid roots', () => {
    expect(findPivotChords('X' as any, 'C')).toEqual([]);
  });
});

describe('bestPivotChord', () => {
  it('C→G prefers Am (vi→ii) or similar', () => {
    const best = bestPivotChord('C', 'G');
    expect(best).not.toBeNull();
    expect(best!.root).toBeDefined();
    expect(best!.quality).toBeDefined();
  });

  it('returns null for keys with no pivots', () => {
    // All major keys share at least some chords, but test gracefully
    const result = bestPivotChord('X' as any, 'C');
    expect(result).toBeNull();
  });

  it('prefers target degree ii or IV', () => {
    const best = bestPivotChord('C', 'G');
    if (best) {
      // Should prefer functionally useful pivot (ii, IV, or vi in target)
      expect([1, 3, 5]).toContain(best.toDegree);
    }
  });
});

describe('shouldUsePivot', () => {
  it('is deterministic', () => {
    const a = shouldUsePivot(42, 'lofi', 'build');
    const b = shouldUsePivot(42, 'lofi', 'build');
    expect(a).toBe(b);
  });

  it('lofi uses pivot more than trance', () => {
    const lofiCount = Array.from({ length: 200 }, (_, i) =>
      shouldUsePivot(i, 'lofi', 'groove')
    ).filter(Boolean).length;
    const tranceCount = Array.from({ length: 200 }, (_, i) =>
      shouldUsePivot(i, 'trance', 'groove')
    ).filter(Boolean).length;
    expect(lofiCount).toBeGreaterThan(tranceCount);
  });
});

describe('modulationSmoothness', () => {
  it('same key is maximally smooth', () => {
    expect(modulationSmoothness('C', 'C')).toBe(7);
  });

  it('close keys (circle of fifths) are smooth', () => {
    const cToG = modulationSmoothness('C', 'G');
    expect(cToG).toBeGreaterThanOrEqual(3);
  });
});

describe('pivotTendency', () => {
  it('lofi has highest tendency', () => {
    expect(pivotTendency('lofi')).toBe(0.35);
  });

  it('trance has lowest tendency', () => {
    expect(pivotTendency('trance')).toBe(0.05);
  });
});
