import { describe, it, expect } from 'vitest';
import {
  selectOmission,
  shouldApplyEllipsis,
  applyEllipsis,
  ellipsisStrength,
} from './harmonic-ellipsis';

describe('selectOmission', () => {
  it('returns index 0, 1, or 2', () => {
    const seen = new Set<number>();
    for (let t = 0; t < 100; t++) {
      const idx = selectOmission('maj', t, 'lofi');
      if (idx !== null) seen.add(idx);
    }
    expect(seen.has(0)).toBe(true);  // root
    expect(seen.has(2)).toBe(true);  // 5th
  });

  it('returns null for diminished', () => {
    expect(selectOmission('dim', 0, 'lofi')).toBeNull();
  });

  it('returns null for augmented', () => {
    expect(selectOmission('aug', 42, 'ambient')).toBeNull();
  });

  it('5th is most common omission', () => {
    let fifthCount = 0;
    for (let t = 0; t < 200; t++) {
      if (selectOmission('maj', t, 'lofi') === 2) fifthCount++;
    }
    expect(fifthCount).toBeGreaterThan(50); // >25% of non-null results
  });
});

describe('shouldApplyEllipsis', () => {
  it('false for triads (3 notes)', () => {
    expect(shouldApplyEllipsis(0, 'lofi', 'groove', 3)).toBe(false);
  });

  it('can apply for 4+ note chords', () => {
    let hasTrue = false;
    for (let t = 0; t < 50; t++) {
      if (shouldApplyEllipsis(t, 'ambient', 'breakdown', 5)) hasTrue = true;
    }
    expect(hasTrue).toBe(true);
  });

  it('breakdowns have more ellipsis than peaks', () => {
    let bdCount = 0, pkCount = 0;
    for (let t = 0; t < 500; t++) {
      if (shouldApplyEllipsis(t, 'lofi', 'breakdown', 4)) bdCount++;
      if (shouldApplyEllipsis(t, 'lofi', 'peak', 4)) pkCount++;
    }
    expect(bdCount).toBeGreaterThan(pkCount);
  });
});

describe('applyEllipsis', () => {
  it('removes the specified index', () => {
    const notes = ['C4', 'E4', 'G4', 'B4'];
    expect(applyEllipsis(notes, 2)).toEqual(['C4', 'E4', 'B4']);
  });

  it('removes root', () => {
    expect(applyEllipsis(['C4', 'E4', 'G4'], 0)).toEqual(['E4', 'G4']);
  });

  it('out of bounds returns unchanged', () => {
    const notes = ['C4', 'E4'];
    expect(applyEllipsis(notes, 5)).toEqual(['C4', 'E4']);
  });
});

describe('ellipsisStrength', () => {
  it('ambient is strongest', () => {
    expect(ellipsisStrength('ambient')).toBe(0.50);
  });

  it('trance is weakest', () => {
    expect(ellipsisStrength('trance')).toBe(0.10);
  });
});
