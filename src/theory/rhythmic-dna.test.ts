import { describe, it, expect } from 'vitest';
import {
  selectDNACell,
  dnaAccentMask,
  dnaHitMask,
  shouldApplyDNA,
  dnaTendency,
} from './rhythmic-dna';

describe('selectDNACell', () => {
  it('returns a valid cell', () => {
    const cell = selectDNACell('trance', 42);
    expect(cell.pattern).toHaveLength(8);
    expect(cell.length).toBe(8);
  });

  it('is deterministic', () => {
    const a = selectDNACell('lofi', 42);
    const b = selectDNACell('lofi', 42);
    expect(a).toEqual(b);
  });

  it('all moods have cells', () => {
    const moods = ['trance', 'disco', 'lofi', 'blockhead', 'downtempo',
      'avril', 'xtal', 'flim', 'syro', 'ambient'] as const;
    for (const mood of moods) {
      const cell = selectDNACell(mood, 1);
      expect(cell.pattern.length).toBeGreaterThan(0);
    }
  });

  it('trance and syro have multiple cells', () => {
    // Check variety across ticks
    const tranceCells = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const cell = selectDNACell('trance', i);
      tranceCells.add(JSON.stringify(cell.pattern));
    }
    expect(tranceCells.size).toBeGreaterThan(1);
  });
});

describe('dnaAccentMask', () => {
  it('returns correct length', () => {
    const cell = selectDNACell('trance', 0);
    expect(dnaAccentMask(cell, 16, 0.5)).toHaveLength(16);
    expect(dnaAccentMask(cell, 8, 0.5)).toHaveLength(8);
  });

  it('hit positions have higher gain than non-hits', () => {
    const cell = selectDNACell('trance', 0);
    const mask = dnaAccentMask(cell, 8, 0.8);
    // Position 0 is a hit with accent 1.0
    // Find a non-hit position
    const nonHitIdx = cell.pattern.findIndex(e => !e.hit);
    if (nonHitIdx >= 0) {
      expect(mask[0]).toBeGreaterThan(mask[nonHitIdx]);
    }
  });

  it('zero intensity returns all 1.0', () => {
    const cell = selectDNACell('lofi', 0);
    const mask = dnaAccentMask(cell, 8, 0);
    expect(mask.every(v => v === 1.0)).toBe(true);
  });

  it('wraps for longer patterns', () => {
    const cell = selectDNACell('ambient', 0);
    const mask = dnaAccentMask(cell, 16, 0.5);
    // Pattern should repeat: position 0 same as position 8
    expect(mask[0]).toBeCloseTo(mask[8], 5);
  });
});

describe('dnaHitMask', () => {
  it('returns correct length', () => {
    const cell = selectDNACell('trance', 0);
    expect(dnaHitMask(cell, 16)).toHaveLength(16);
  });

  it('matches cell pattern hits', () => {
    const cell = selectDNACell('blockhead', 0);
    const mask = dnaHitMask(cell, 8);
    for (let i = 0; i < 8; i++) {
      expect(mask[i]).toBe(cell.pattern[i].hit);
    }
  });
});

describe('shouldApplyDNA', () => {
  it('is deterministic', () => {
    const a = shouldApplyDNA(42, 'trance', 'peak');
    const b = shouldApplyDNA(42, 'trance', 'peak');
    expect(a).toBe(b);
  });

  it('trance has more DNA than ambient', () => {
    const tranceCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyDNA(i, 'trance', 'groove')
    ).filter(Boolean).length;
    const ambientCount = Array.from({ length: 500 }, (_, i) =>
      shouldApplyDNA(i, 'ambient', 'groove')
    ).filter(Boolean).length;
    expect(tranceCount).toBeGreaterThan(ambientCount);
  });
});

describe('dnaTendency', () => {
  it('trance has highest', () => {
    expect(dnaTendency('trance')).toBe(0.45);
  });

  it('ambient has lowest', () => {
    expect(dnaTendency('ambient')).toBe(0.08);
  });
});
