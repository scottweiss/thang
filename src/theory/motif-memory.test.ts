import { describe, it, expect } from 'vitest';
import { MotifMemory } from './motif-memory';

const LADDER = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];

describe('MotifMemory', () => {
  it('starts empty', () => {
    const mem = new MotifMemory();
    expect(mem.count).toBe(0);
    expect(mem.recall(0)).toBeNull();
  });

  it('stores and recalls a motif', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'D4', 'E4'], 0);
    expect(mem.count).toBe(1);
    const recalled = mem.recall(1);
    expect(recalled).not.toBeNull();
    expect(recalled!.notes).toEqual(['C4', 'D4', 'E4']);
  });

  it('does not store very short motifs', () => {
    const mem = new MotifMemory();
    mem.store(['C4'], 0);
    expect(mem.count).toBe(0);
  });

  it('does not store duplicates', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'D4', 'E4'], 0);
    mem.store(['C4', 'D4', 'E4'], 1);
    expect(mem.count).toBe(1);
  });

  it('evicts oldest when over capacity', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'D4'], 0);
    mem.store(['E4', 'F4'], 1);
    mem.store(['G4', 'A4'], 2);
    mem.store(['B4', 'C5'], 3);
    mem.store(['D5', 'E5'], 4); // should evict oldest
    expect(mem.count).toBe(4);
  });

  it('clears all motifs', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'D4', 'E4'], 0);
    mem.store(['F4', 'G4', 'A4'], 1);
    mem.clear();
    expect(mem.count).toBe(0);
  });

  it('increments use count on recall', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'D4', 'E4'], 0);
    const first = mem.recall(1);
    expect(first!.useCount).toBe(1);
    const second = mem.recall(2);
    expect(second!.useCount).toBe(2);
  });

  it('develop returns array of notes or rests', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'D4', 'E4', 'F4'], 0);
    const motif = mem.recall(1)!;
    for (let i = 0; i < 20; i++) {
      const developed = mem.develop(motif, LADDER);
      expect(developed.length).toBeGreaterThan(0);
      developed.forEach(note => {
        expect(note === '~' || LADDER.includes(note)).toBe(true);
      });
    }
  });

  it('exact repetition preserves original notes', () => {
    const mem = new MotifMemory();
    const original = ['C4', 'E4', 'G4'];
    mem.store(original, 0);
    const motif = mem.recall(1)!;
    // Run many times — at least one should be exact
    let foundExact = false;
    for (let i = 0; i < 50; i++) {
      const developed = mem.develop(motif, LADDER);
      if (developed.join(',') === original.join(',')) {
        foundExact = true;
        break;
      }
    }
    expect(foundExact).toBe(true);
  });

  it('fragmentation returns shorter motif', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'D4', 'E4', 'F4'], 0);
    const motif = mem.recall(1)!;
    let foundFragment = false;
    for (let i = 0; i < 50; i++) {
      const developed = mem.develop(motif, LADDER);
      if (developed.length < motif.notes.length) {
        foundFragment = true;
        break;
      }
    }
    expect(foundFragment).toBe(true);
  });

  it('augmentation interleaves rests', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'D4', 'E4'], 0);
    const motif = mem.recall(1)!;
    let foundAugmented = false;
    for (let i = 0; i < 100; i++) {
      const developed = mem.develop(motif, LADDER);
      // Augmented = notes interleaved with rests, so length = 2 * original
      if (developed.length === 6 && developed[1] === '~' && developed[3] === '~') {
        foundAugmented = true;
        expect(developed[0]).toBe('C4');
        expect(developed[2]).toBe('D4');
        expect(developed[4]).toBe('E4');
        break;
      }
    }
    expect(foundAugmented).toBe(true);
  });

  it('diminution compresses motif', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'D4', 'E4', 'F4'], 0);
    const motif = mem.recall(1)!;
    let foundDiminished = false;
    for (let i = 0; i < 100; i++) {
      const developed = mem.develop(motif, LADDER);
      // Diminished = every other note, so length = ceil(original/2)
      if (developed.length === 2 && developed[0] === 'C4' && developed[1] === 'E4') {
        foundDiminished = true;
        break;
      }
    }
    expect(foundDiminished).toBe(true);
  });

  it('develop includes augmented notes from ladder or rests', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'E4', 'G4'], 0);
    const motif = mem.recall(1)!;
    for (let i = 0; i < 50; i++) {
      const developed = mem.develop(motif, LADDER);
      for (const note of developed) {
        // Notes should be from ladder or be rests (from augmentation)
        expect(note === '~' || LADDER.includes(note)).toBe(true);
      }
    }
  });

  it('stores motifs with section tags', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'E4', 'G4'], 0, 'intro');
    mem.store(['D4', 'F4', 'A4'], 10, 'build');
    expect(mem.count).toBe(2);
  });

  it('recallCrossSection prefers complementary section motifs', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'E4', 'G4'], 0, 'intro');
    mem.store(['D4', 'F4', 'A4'], 10, 'build');
    mem.store(['E4', 'G4', 'B4'], 20, 'peak');

    // From breakdown, should prefer intro/build/groove motifs
    let introRecalled = 0;
    for (let i = 0; i < 100; i++) {
      const m = mem.recallCrossSection(30, 'breakdown');
      if (m && m.section === 'intro') introRecalled++;
    }
    // Should recall intro motifs at least sometimes
    expect(introRecalled).toBeGreaterThan(0);
  });

  it('recallCrossSection returns null for empty memory', () => {
    const mem = new MotifMemory();
    expect(mem.recallCrossSection(0, 'breakdown')).toBeNull();
  });

  it('recallCrossSection falls back to regular recall for intro', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'E4'], 0, 'intro');
    // Intro has no complementary targets, falls back to regular recall
    const m = mem.recallCrossSection(5, 'intro');
    expect(m).not.toBeNull();
  });
});
