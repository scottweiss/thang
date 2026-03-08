import { describe, it, expect } from 'vitest';
import {
  generateComplementaryRhythm,
  hocketize,
  counterpointDensity,
} from './rhythmic-counterpoint';

describe('generateComplementaryRhythm', () => {
  it('tends to place notes where primary rests', () => {
    const primary = ['C3', '~', '~', '~', 'E3', '~', '~', '~'];
    let hitsOnRests = 0;
    let restPositions = 0;
    const trials = 200;

    for (let t = 0; t < trials; t++) {
      const mask = generateComplementaryRhythm(primary, primary.length, 0.8);
      for (let i = 0; i < primary.length; i++) {
        if (primary[i] === '~') {
          restPositions++;
          if (mask[i]) hitsOnRests++;
        }
      }
    }

    // With density 0.8, complement should fill rest gaps frequently
    expect(hitsOnRests / restPositions).toBeGreaterThan(0.4);
  });

  it('tends to rest where primary plays', () => {
    const primary = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];
    let hitsOnNotes = 0;
    let notePositions = 0;
    const trials = 200;

    for (let t = 0; t < trials; t++) {
      const mask = generateComplementaryRhythm(primary, primary.length, 0.5);
      for (let i = 0; i < primary.length; i++) {
        if (primary[i] !== '~') {
          notePositions++;
          if (mask[i]) hitsOnNotes++;
        }
      }
    }

    // Should mostly rest where primary is active
    expect(hitsOnNotes / notePositions).toBeLessThan(0.3);
  });

  it('always has at least one active position', () => {
    const primary = ['C3', 'D3', 'E3', 'F3'];
    for (let t = 0; t < 100; t++) {
      const mask = generateComplementaryRhythm(primary, primary.length, 0);
      expect(mask.some((v) => v)).toBe(true);
    }
  });

  it('density 0 produces minimal activity', () => {
    const primary = ['C3', '~', 'E3', '~', 'G3', '~', '~', '~'];
    let totalActive = 0;
    const trials = 200;

    for (let t = 0; t < trials; t++) {
      const mask = generateComplementaryRhythm(primary, primary.length, 0);
      totalActive += mask.filter((v) => v).length;
    }

    // With density 0, almost nothing should trigger (except the guarantee)
    const avgActive = totalActive / trials;
    expect(avgActive).toBeLessThanOrEqual(1.5);
  });

  it('density 1 produces high activity', () => {
    const primary = ['~', '~', '~', '~', '~', '~', '~', '~'];
    let totalActive = 0;
    const trials = 200;

    for (let t = 0; t < trials; t++) {
      const mask = generateComplementaryRhythm(primary, primary.length, 1);
      totalActive += mask.filter((v) => v).length;
    }

    const avgActive = totalActive / trials;
    // All rest in primary + density 1 should yield most positions active
    expect(avgActive).toBeGreaterThan(5);
  });
});

describe('hocketize', () => {
  it('resolves collisions (both playing at same step)', () => {
    const a = ['C3', 'D3', 'E3', 'F3'];
    const b = ['G3', 'A3', 'B3', 'C4'];

    // Run many times to check the invariant
    for (let t = 0; t < 50; t++) {
      const [outA, outB] = hocketize(a, b);
      for (let i = 0; i < a.length; i++) {
        // At most one should be active at each position
        const aPlays = outA[i] !== '~';
        const bPlays = outB[i] !== '~';
        expect(aPlays && bPlays).toBe(false);
      }
    }
  });

  it('preserves non-colliding positions', () => {
    const a = ['C3', '~', 'E3', '~'];
    const b = ['~', 'D3', '~', 'F3'];

    const [outA, outB] = hocketize(a, b);
    expect(outA[0]).toBe('C3');
    expect(outA[1]).toBe('~');
    expect(outA[2]).toBe('E3');
    expect(outA[3]).toBe('~');
    expect(outB[0]).toBe('~');
    expect(outB[1]).toBe('D3');
    expect(outB[2]).toBe('~');
    expect(outB[3]).toBe('F3');
  });

  it('handles empty arrays', () => {
    const [outA, outB] = hocketize([], []);
    expect(outA).toEqual([]);
    expect(outB).toEqual([]);
  });
});

describe('counterpointDensity', () => {
  it('breakdown has highest strictness', () => {
    const sections = ['intro', 'build', 'peak', 'groove', 'breakdown'] as const;
    const values = sections.map((s) => counterpointDensity(s, 0));
    const breakdownVal = counterpointDensity('breakdown', 0);
    expect(breakdownVal).toBe(Math.max(...values));
  });

  it('peak has lowest strictness', () => {
    const sections = ['intro', 'build', 'peak', 'groove', 'breakdown'] as const;
    const values = sections.map((s) => counterpointDensity(s, 0));
    const peakVal = counterpointDensity('peak', 0);
    expect(peakVal).toBe(Math.min(...values));
  });

  it('high tension reduces strictness', () => {
    const sections = ['intro', 'build', 'peak', 'groove', 'breakdown'] as const;
    for (const section of sections) {
      const low = counterpointDensity(section, 0);
      const high = counterpointDensity(section, 1);
      expect(high).toBeLessThan(low);
    }
  });
});
