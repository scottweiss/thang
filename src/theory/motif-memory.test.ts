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

  it('develop returns array of notes', () => {
    const mem = new MotifMemory();
    mem.store(['C4', 'D4', 'E4', 'F4'], 0);
    const motif = mem.recall(1)!;
    for (let i = 0; i < 20; i++) {
      const developed = mem.develop(motif, LADDER);
      expect(developed.length).toBeGreaterThan(0);
      developed.forEach(note => {
        expect(LADDER).toContain(note);
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
});
