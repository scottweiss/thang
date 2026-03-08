import { describe, it, expect } from 'vitest';
import { evolveDrumPattern, varyDrumPattern, sectionProgress } from './drum-evolution';

describe('evolveDrumPattern', () => {
  it('build direction adds elements over time', () => {
    const base = 'bd ~ ~ ~ sd ~ ~ ~';
    let addedCount = 0;
    for (let i = 0; i < 100; i++) {
      const evolved = evolveDrumPattern(base, 0.9, 'build', 0.8);
      const baseRests = base.split(' ').filter(s => s === '~').length;
      const evolvedRests = evolved.split(' ').filter(s => s === '~').length;
      if (evolvedRests < baseRests) addedCount++;
    }
    expect(addedCount).toBeGreaterThan(30);
  });

  it('thin direction removes elements', () => {
    const base = 'bd hh sd hh bd hh sd hh';
    let thinned = 0;
    for (let i = 0; i < 100; i++) {
      const evolved = evolveDrumPattern(base, 0.9, 'thin', 0.8);
      const baseNotes = base.split(' ').filter(s => s !== '~').length;
      const evolvedNotes = evolved.split(' ').filter(s => s !== '~').length;
      if (evolvedNotes < baseNotes) thinned++;
    }
    expect(thinned).toBeGreaterThan(30);
  });

  it('preserves kicks when thinning', () => {
    const base = 'bd hh sd hh bd hh sd hh';
    for (let i = 0; i < 50; i++) {
      const evolved = evolveDrumPattern(base, 1.0, 'thin', 1.0);
      const kicks = evolved.split(' ').filter(s => s === 'bd').length;
      expect(kicks).toBe(2); // kicks always preserved
    }
  });

  it('at progress 0, pattern is mostly unchanged', () => {
    const base = 'bd ~ hh ~ sd ~ hh ~';
    let unchangedCount = 0;
    for (let i = 0; i < 50; i++) {
      const evolved = evolveDrumPattern(base, 0.0, 'build', 0.5);
      if (evolved === base) unchangedCount++;
    }
    expect(unchangedCount).toBe(50); // should never change at progress 0
  });
});

describe('varyDrumPattern', () => {
  it('with 0 variation, pattern is unchanged', () => {
    const base = 'bd ~ hh ~ sd ~ hh ~';
    const varied = varyDrumPattern(base, 0);
    expect(varied).toBe(base);
  });

  it('preserves pattern length', () => {
    const base = 'bd ~ hh ~ sd ~ hh ~ bd ~ hh ~ sd ~ hh ~';
    const varied = varyDrumPattern(base, 0.8);
    expect(varied.split(' ')).toHaveLength(base.split(' ').length);
  });
});

describe('sectionProgress', () => {
  it('returns 0 at start', () => {
    expect(sectionProgress(0, 20)).toBe(0);
  });

  it('returns 1 at end', () => {
    expect(sectionProgress(20, 20)).toBe(1);
  });

  it('clamps to 1', () => {
    expect(sectionProgress(30, 20)).toBe(1);
  });

  it('returns 0 for zero duration', () => {
    expect(sectionProgress(5, 0)).toBe(0);
  });
});
