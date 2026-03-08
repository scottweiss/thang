import { describe, it, expect } from 'vitest';
import {
  sectionContour,
  contourOffset,
  contourTargetIndex,
  contourPull,
} from './melodic-contour';

describe('sectionContour', () => {
  it('build uses ascending contour', () => {
    expect(sectionContour('build')).toBe('ascending');
  });

  it('peak uses arch contour', () => {
    expect(sectionContour('peak')).toBe('arch');
  });

  it('breakdown uses valley contour', () => {
    expect(sectionContour('breakdown')).toBe('valley');
  });

  it('groove uses plateau contour', () => {
    expect(sectionContour('groove')).toBe('plateau');
  });

  it('intro uses plateau contour', () => {
    expect(sectionContour('intro')).toBe('plateau');
  });
});

describe('contourOffset', () => {
  describe('arch', () => {
    it('starts near zero', () => {
      const start = contourOffset('arch', 0);
      expect(start).toBeGreaterThanOrEqual(0);
      expect(start).toBeLessThan(3);
    });

    it('peaks around 0.4 (golden ratio bias)', () => {
      const peak = contourOffset('arch', 0.4);
      const before = contourOffset('arch', 0.2);
      const after = contourOffset('arch', 0.6);
      expect(peak).toBeGreaterThan(before);
      expect(peak).toBeGreaterThan(after);
    });

    it('returns to low at end', () => {
      const end = contourOffset('arch', 1.0);
      expect(end).toBeLessThan(2);
    });

    it('never goes negative', () => {
      for (let p = 0; p <= 1; p += 0.05) {
        expect(contourOffset('arch', p)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('valley', () => {
    it('reaches nadir around 0.5', () => {
      const nadir = contourOffset('valley', 0.5);
      expect(nadir).toBeLessThan(0);
    });

    it('edges are higher than center', () => {
      const start = contourOffset('valley', 0.0);
      const mid = contourOffset('valley', 0.5);
      const end = contourOffset('valley', 1.0);
      expect(start).toBeGreaterThan(mid);
      expect(end).toBeGreaterThan(mid);
    });

    it('never goes positive', () => {
      for (let p = 0; p <= 1; p += 0.05) {
        expect(contourOffset('valley', p)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('ascending', () => {
    it('rises from start to end', () => {
      const start = contourOffset('ascending', 0);
      const end = contourOffset('ascending', 1);
      expect(end).toBeGreaterThan(start);
    });

    it('end is significantly above start', () => {
      const end = contourOffset('ascending', 1);
      expect(end).toBeGreaterThan(3);
    });
  });

  describe('descending', () => {
    it('falls from start to end', () => {
      const start = contourOffset('descending', 0);
      const end = contourOffset('descending', 1);
      expect(end).toBeLessThan(start);
    });

    it('end is significantly below start', () => {
      const end = contourOffset('descending', 1);
      expect(end).toBeLessThan(-2);
    });
  });

  describe('plateau', () => {
    it('stays near zero throughout', () => {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = contourOffset('plateau', p);
        expect(Math.abs(val)).toBeLessThan(1);
      }
    });
  });

  it('intensity scales the offset', () => {
    const full = contourOffset('ascending', 0.8, 1.0);
    const half = contourOffset('ascending', 0.8, 0.5);
    expect(half).toBeCloseTo(full * 0.5, 2);
  });

  it('zero intensity means no offset', () => {
    expect(contourOffset('arch', 0.5, 0)).toBeCloseTo(0, 4);
  });

  it('clamps progress to 0-1', () => {
    const normal = contourOffset('ascending', 1.0);
    const clamped = contourOffset('ascending', 2.0);
    expect(clamped).toBeCloseTo(normal, 4);
  });
});

describe('contourTargetIndex', () => {
  const ladder = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];

  it('positive offset moves up the ladder', () => {
    expect(contourTargetIndex(ladder, 2, 3)).toBe(5);
  });

  it('negative offset moves down the ladder', () => {
    expect(contourTargetIndex(ladder, 5, -2)).toBe(3);
  });

  it('clamps to valid range (top)', () => {
    expect(contourTargetIndex(ladder, 6, 5)).toBe(7);
  });

  it('clamps to valid range (bottom)', () => {
    expect(contourTargetIndex(ladder, 1, -5)).toBe(0);
  });

  it('zero offset returns base index', () => {
    expect(contourTargetIndex(ladder, 3, 0)).toBe(3);
  });
});

describe('contourPull', () => {
  it('arch has strongest pull near peak', () => {
    const atPeak = contourPull('arch', 0.4);
    const atEdge = contourPull('arch', 0.0);
    expect(atPeak).toBeGreaterThan(atEdge);
  });

  it('valley has strongest pull near nadir', () => {
    const atNadir = contourPull('valley', 0.5);
    const atEdge = contourPull('valley', 0.0);
    expect(atNadir).toBeGreaterThan(atEdge);
  });

  it('ascending increases pull over time', () => {
    const early = contourPull('ascending', 0.1);
    const late = contourPull('ascending', 0.9);
    expect(late).toBeGreaterThan(early);
  });

  it('plateau has consistent moderate pull', () => {
    const any = contourPull('plateau', 0.5);
    expect(any).toBeGreaterThan(0.1);
    expect(any).toBeLessThan(0.6);
  });

  it('all values are between 0 and 1', () => {
    const shapes = ['arch', 'valley', 'ascending', 'descending', 'plateau'] as const;
    for (const shape of shapes) {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = contourPull(shape, p);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    }
  });
});
