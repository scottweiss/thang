import { describe, it, expect } from 'vitest';
import { RhythmicMemory, extractRhythm } from './rhythmic-memory';

describe('extractRhythm', () => {
  it('converts notes to true and rests to false', () => {
    expect(extractRhythm(['C4', '~', 'D4', '~'])).toEqual([true, false, true, false]);
  });

  it('handles all notes', () => {
    expect(extractRhythm(['C4', 'D4'])).toEqual([true, true]);
  });

  it('handles all rests', () => {
    expect(extractRhythm(['~', '~'])).toEqual([false, false]);
  });
});

describe('RhythmicMemory', () => {
  it('stores and recalls a rhythm', () => {
    const mem = new RhythmicMemory();
    mem.store(['C4', '~', 'D4', '~', 'E4', '~', 'F4', '~'], 0);
    expect(mem.count).toBe(1);
    const recalled = mem.recall(1);
    expect(recalled).not.toBeNull();
    expect(recalled!.pattern).toEqual([true, false, true, false, true, false, true, false]);
  });

  it('does not store too-sparse patterns', () => {
    const mem = new RhythmicMemory();
    // 1/8 = 0.125 density, below 0.15 threshold
    mem.store(['C4', '~', '~', '~', '~', '~', '~', '~'], 0);
    expect(mem.count).toBe(0);
  });

  it('does not store too-dense patterns', () => {
    const mem = new RhythmicMemory();
    // 7/8 = 0.875 density, above 0.85 threshold
    mem.store(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', '~'], 0);
    expect(mem.count).toBe(0);
  });

  it('does not store duplicates', () => {
    const mem = new RhythmicMemory();
    mem.store(['C4', '~', 'D4', '~', 'E4', '~', 'F4', '~'], 0);
    mem.store(['G4', '~', 'A4', '~', 'B4', '~', 'C5', '~'], 1);
    // Same rhythm even though different pitches
    expect(mem.count).toBe(1);
  });

  it('stores different rhythms', () => {
    const mem = new RhythmicMemory();
    mem.store(['C4', '~', 'D4', '~', 'E4', '~', 'F4', '~'], 0); // 10101010
    mem.store(['C4', 'D4', '~', '~', 'E4', 'F4', '~', '~'], 1); // 11001100
    expect(mem.count).toBe(2);
  });

  it('evicts oldest when over capacity', () => {
    const mem = new RhythmicMemory();
    // Store 5 different rhythms (max is 4)
    mem.store(['C4', '~', 'D4', '~', 'E4', '~', 'F4', '~'], 0);
    mem.store(['C4', 'D4', '~', '~', 'E4', 'F4', '~', '~'], 1);
    mem.store(['C4', '~', '~', 'D4', 'E4', '~', '~', 'F4'], 2);
    mem.store(['~', 'C4', '~', 'D4', '~', 'E4', '~', 'F4'], 3);
    mem.store(['C4', 'D4', 'E4', '~', '~', '~', 'F4', 'G4'], 4);
    expect(mem.count).toBe(4);
  });

  it('filters by target density', () => {
    const mem = new RhythmicMemory();
    mem.store(['C4', '~', 'D4', '~', 'E4', '~', 'F4', '~'], 0); // 0.5 density
    mem.store(['C4', 'D4', 'E4', 'F4', 'G4', '~', '~', '~'], 1); // 0.625 density
    const sparse = mem.recall(2, 0.4); // Should prefer the 0.5 density one
    expect(sparse).not.toBeNull();
  });

  it('clears memory', () => {
    const mem = new RhythmicMemory();
    mem.store(['C4', '~', 'D4', '~', 'E4', '~', 'F4', '~'], 0);
    mem.clear();
    expect(mem.count).toBe(0);
  });

  describe('develop', () => {
    it('returns pattern of target length', () => {
      const mem = new RhythmicMemory();
      mem.store(['C4', '~', 'D4', '~', 'E4', '~', 'F4', '~'], 0);
      const rhythm = mem.recall(1)!;
      const developed = mem.develop(rhythm, 16);
      expect(developed.length).toBe(16);
      expect(developed.every(v => typeof v === 'boolean')).toBe(true);
    });

    it('preserves density approximately', () => {
      const mem = new RhythmicMemory();
      mem.store(['C4', '~', 'D4', '~', 'E4', '~', 'F4', '~'], 0);
      const rhythm = mem.recall(1)!;

      // Run many developments and check density doesn't go extreme
      let totalDensity = 0;
      const trials = 50;
      for (let i = 0; i < trials; i++) {
        const developed = mem.develop(rhythm, 8);
        totalDensity += developed.filter(Boolean).length / developed.length;
      }
      const avgDensity = totalDensity / trials;
      // Should be roughly in the 0.2–0.8 range (original is 0.5)
      expect(avgDensity).toBeGreaterThan(0.2);
      expect(avgDensity).toBeLessThan(0.8);
    });
  });
});
