import { describe, it, expect } from 'vitest';
import {
  selectVariedContour,
  contourVarietyAppetite,
  sectionContourCandidates,
} from './contour-variety';
import type { ContourShape } from './melodic-contour';

describe('sectionContourCandidates', () => {
  it('peak has arch as primary', () => {
    expect(sectionContourCandidates('peak')[0]).toBe('arch');
  });

  it('build has ascending as primary', () => {
    expect(sectionContourCandidates('build')[0]).toBe('ascending');
  });

  it('breakdown has valley as primary', () => {
    expect(sectionContourCandidates('breakdown')[0]).toBe('valley');
  });

  it('groove has multiple options', () => {
    expect(sectionContourCandidates('groove').length).toBeGreaterThan(2);
  });
});

describe('selectVariedContour', () => {
  it('returns primary shape with no history', () => {
    expect(selectVariedContour('peak', 'lofi', [])).toBe('arch');
  });

  it('returns primary shape with short history (1 repeat)', () => {
    // With only 1 repeat, change urgency is moderate
    const shape = selectVariedContour('peak', 'lofi', ['arch']);
    // Should still be a valid peak contour
    expect(sectionContourCandidates('peak')).toContain(shape);
  });

  it('avoids repeated shapes after many consecutive repeats', () => {
    // 4 consecutive arches with high-variety mood should trigger change
    const history: ContourShape[] = ['arch', 'arch', 'arch', 'arch'];
    // Run multiple times — at least some should be non-arch
    const results = new Set<ContourShape>();
    for (let i = 0; i < 50; i++) {
      results.add(selectVariedContour('peak', 'syro', history));
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it('trance (low variety) repeats primary more often', () => {
    const history: ContourShape[] = ['arch', 'arch'];
    let archCount = 0;
    for (let i = 0; i < 100; i++) {
      if (selectVariedContour('peak', 'trance', history) === 'arch') {
        archCount++;
      }
    }
    // Trance should have >50% arch even after 2 repeats
    expect(archCount).toBeGreaterThan(50);
  });

  it('lofi (high variety) switches more readily', () => {
    const history: ContourShape[] = ['arch', 'arch', 'arch'];
    let nonArchCount = 0;
    for (let i = 0; i < 100; i++) {
      if (selectVariedContour('peak', 'lofi', history) !== 'arch') {
        nonArchCount++;
      }
    }
    // Lofi should produce more non-arch shapes
    expect(nonArchCount).toBeGreaterThan(20);
  });

  it('only returns shapes valid for the section', () => {
    const candidates = sectionContourCandidates('breakdown');
    const history: ContourShape[] = ['valley', 'valley', 'valley', 'valley'];
    for (let i = 0; i < 30; i++) {
      const shape = selectVariedContour('breakdown', 'flim', history);
      expect(candidates).toContain(shape);
    }
  });
});

describe('contourVarietyAppetite', () => {
  it('syro is highest (IDM variety)', () => {
    expect(contourVarietyAppetite('syro')).toBe(0.60);
  });

  it('trance is low (repetition as feature)', () => {
    expect(contourVarietyAppetite('trance')).toBe(0.20);
  });

  it('all moods have defined appetites', () => {
    const moods = ['trance', 'disco', 'syro', 'blockhead', 'downtempo', 'lofi', 'flim', 'xtal', 'avril', 'ambient'] as const;
    for (const mood of moods) {
      expect(contourVarietyAppetite(mood)).toBeGreaterThan(0);
      expect(contourVarietyAppetite(mood)).toBeLessThanOrEqual(1);
    }
  });
});
