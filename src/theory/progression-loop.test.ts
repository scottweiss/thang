import { describe, it, expect } from 'vitest';
import { generateLoop, deriveLoopForSection, getLoopChordAtBar } from './progression-loop';
import type { Mood, Section, ProgressionLoop } from '../types';

describe('generateLoop', () => {
  it('returns a 4-chord loop', () => {
    const loop = generateLoop('lofi', [0, 1, 2, 3, 4, 5, 6]);
    expect(loop.degrees).toHaveLength(4);
    expect(loop.qualities).toHaveLength(4);
  });

  it('all degrees are valid (0-6)', () => {
    const moods: Mood[] = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'];
    for (const mood of moods) {
      for (let i = 0; i < 20; i++) {
        const loop = generateLoop(mood, [0, 1, 2, 3, 4, 5, 6]);
        for (const deg of loop.degrees) {
          expect(deg).toBeGreaterThanOrEqual(0);
          expect(deg).toBeLessThanOrEqual(6);
        }
      }
    }
  });

  it('lofi loops include ii(1) or V(4) most of the time', () => {
    let hits = 0;
    const runs = 100;
    for (let i = 0; i < runs; i++) {
      const loop = generateLoop('lofi', [0, 1, 2, 3, 4, 5, 6]);
      if (loop.degrees.includes(1) || loop.degrees.includes(4)) hits++;
    }
    expect(hits).toBeGreaterThan(runs * 0.7);
  });

  it('trance loops include I(0) and V(4) most of the time', () => {
    let hits = 0;
    const runs = 100;
    for (let i = 0; i < runs; i++) {
      const loop = generateLoop('trance', [0, 1, 2, 3, 4, 5, 6]);
      if (loop.degrees.includes(0) && loop.degrees.includes(4)) hits++;
    }
    expect(hits).toBeGreaterThan(runs * 0.7);
  });

  it('qualities array matches degrees array length', () => {
    const moods: Mood[] = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'];
    for (const mood of moods) {
      const loop = generateLoop(mood, [0, 1, 2, 3, 4, 5, 6]);
      expect(loop.qualities.length).toBe(loop.degrees.length);
    }
  });

  it('barsPerChord matches mood defaults', () => {
    const loop = generateLoop('ambient', [0, 1, 2, 3, 4, 5, 6]);
    expect(loop.barsPerChord).toBe(4);

    const lofiLoop = generateLoop('lofi', [0, 1, 2, 3, 4, 5, 6]);
    expect(lofiLoop.barsPerChord).toBe(2);

    const syroLoop = generateLoop('syro', [0, 1, 2, 3, 4, 5, 6]);
    expect(syroLoop.barsPerChord).toBe(1);
  });

  it('loopCount defaults to -1 (infinite)', () => {
    const loop = generateLoop('lofi', [0, 1, 2, 3, 4, 5, 6]);
    expect(loop.loopCount).toBe(-1);
  });

  it('filters templates to only use available degrees', () => {
    // Only I, IV, V available - should still produce a valid loop
    const loop = generateLoop('trance', [0, 3, 4]);
    for (const deg of loop.degrees) {
      expect([0, 3, 4]).toContain(deg);
    }
  });
});

describe('deriveLoopForSection', () => {
  const homeLoop: ProgressionLoop = {
    degrees: [0, 4, 5, 3],
    qualities: ['min', 'maj', 'maj', 'maj'],
    barsPerChord: 2,
    loopCount: -1,
  };

  it('groove returns home loop unchanged', () => {
    const derived = deriveLoopForSection(homeLoop, 'groove', 'trance');
    expect(derived.degrees).toEqual(homeLoop.degrees);
    expect(derived.qualities).toEqual(homeLoop.qualities);
    expect(derived.barsPerChord).toBe(homeLoop.barsPerChord);
  });

  it('intro returns single tonic chord', () => {
    const derived = deriveLoopForSection(homeLoop, 'intro', 'trance');
    expect(derived.degrees).toHaveLength(1);
    expect(derived.degrees[0]).toBe(homeLoop.degrees[0]);
  });

  it('intro doubles barsPerChord', () => {
    const derived = deriveLoopForSection(homeLoop, 'intro', 'trance');
    expect(derived.barsPerChord).toBe(homeLoop.barsPerChord * 2);
  });

  it('build rotates home loop by 1-2 positions', () => {
    const derived = deriveLoopForSection(homeLoop, 'build', 'trance');
    // Same chords, different order — all original degrees present
    expect(derived.degrees).toHaveLength(homeLoop.degrees.length);
    const sortedHome = [...homeLoop.degrees].sort();
    const sortedDerived = [...derived.degrees].sort();
    expect(sortedDerived).toEqual(sortedHome);
    // Must be rotated (not same order)
    const isRotated =
      derived.degrees[0] !== homeLoop.degrees[0] ||
      derived.degrees[1] !== homeLoop.degrees[1];
    expect(isRotated).toBe(true);
  });

  it('peak ends on I(0) or V(4) — cadential ending', () => {
    // Test across multiple moods to cover different home loops
    const moods: Mood[] = ['lofi', 'trance', 'ambient', 'downtempo'];
    for (const mood of moods) {
      const home = generateLoop(mood, [0, 1, 2, 3, 4, 5, 6]);
      const derived = deriveLoopForSection(home, 'peak', mood);
      const lastDeg = derived.degrees[derived.degrees.length - 1];
      const secondLastDeg = derived.degrees[derived.degrees.length - 2];
      // Last chord should be I(0) and second-to-last should be V(4) for V-I cadence
      // Or at minimum, the last chord is I(0) or V(4)
      expect([0, 4]).toContain(lastDeg);
    }
  });

  it('breakdown returns at most 2 chords', () => {
    const derived = deriveLoopForSection(homeLoop, 'breakdown', 'trance');
    expect(derived.degrees.length).toBeLessThanOrEqual(2);
  });

  it('breakdown doubles barsPerChord', () => {
    const derived = deriveLoopForSection(homeLoop, 'breakdown', 'trance');
    expect(derived.barsPerChord).toBe(homeLoop.barsPerChord * 2);
  });

  it('breakdown includes the tonic', () => {
    const derived = deriveLoopForSection(homeLoop, 'breakdown', 'trance');
    expect(derived.degrees).toContain(homeLoop.degrees[0]);
  });

  it('all sections preserve valid degrees (0-6)', () => {
    const sections: Section[] = ['intro', 'build', 'peak', 'breakdown', 'groove'];
    for (const section of sections) {
      const derived = deriveLoopForSection(homeLoop, section, 'trance');
      for (const deg of derived.degrees) {
        expect(deg).toBeGreaterThanOrEqual(0);
        expect(deg).toBeLessThanOrEqual(6);
      }
    }
  });
});

describe('getLoopChordAtBar', () => {
  const loop: ProgressionLoop = {
    degrees: [0, 4, 5, 3],
    qualities: ['maj', 'dom7', 'min', 'maj'],
    barsPerChord: 2,
    loopCount: -1,
  };

  it('returns correct chord at bar 0', () => {
    const chord = getLoopChordAtBar(loop, 0);
    expect(chord.degree).toBe(0);
    expect(chord.quality).toBe('maj');
  });

  it('returns correct chord at bar 1 (still first chord with barsPerChord=2)', () => {
    const chord = getLoopChordAtBar(loop, 1);
    expect(chord.degree).toBe(0);
    expect(chord.quality).toBe('maj');
  });

  it('returns second chord at bar 2', () => {
    const chord = getLoopChordAtBar(loop, 2);
    expect(chord.degree).toBe(4);
    expect(chord.quality).toBe('dom7');
  });

  it('returns last chord at bar 6', () => {
    const chord = getLoopChordAtBar(loop, 6);
    expect(chord.degree).toBe(3);
    expect(chord.quality).toBe('maj');
  });

  it('wraps around to first chord after full loop', () => {
    // Loop length = 4 chords * 2 bars = 8 bars total
    const chord = getLoopChordAtBar(loop, 8);
    expect(chord.degree).toBe(0);
    expect(chord.quality).toBe('maj');
  });

  it('wraps correctly at large bar numbers', () => {
    // bar 10 = bar 2 in loop (10 % 8 = 2)
    const chord = getLoopChordAtBar(loop, 10);
    expect(chord.degree).toBe(4);
    expect(chord.quality).toBe('dom7');
  });

  it('handles single-chord loop', () => {
    const single: ProgressionLoop = {
      degrees: [0],
      qualities: ['maj'],
      barsPerChord: 4,
      loopCount: -1,
    };
    expect(getLoopChordAtBar(single, 0).degree).toBe(0);
    expect(getLoopChordAtBar(single, 3).degree).toBe(0);
    expect(getLoopChordAtBar(single, 5).degree).toBe(0);
  });
});
