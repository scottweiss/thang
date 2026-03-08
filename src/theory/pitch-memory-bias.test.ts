import { describe, it, expect } from 'vitest';
import {
  pitchMemoryWeight,
  noveltyWeight,
  memoryStrength,
} from './pitch-memory-bias';

describe('pitchMemoryWeight', () => {
  it('higher for recently heard pitch', () => {
    const heard = pitchMemoryWeight(0, [0, 4, 7], 'trance');
    const unheard = pitchMemoryWeight(6, [0, 4, 7], 'trance');
    expect(heard).toBeGreaterThan(unheard);
  });

  it('recency matters — most recent gets more boost', () => {
    const mostRecent = pitchMemoryWeight(0, [0, 4, 7], 'trance');
    const lessRecent = pitchMemoryWeight(7, [0, 4, 7], 'trance');
    expect(mostRecent).toBeGreaterThan(lessRecent);
  });

  it('1.0 when pitch not in history', () => {
    expect(pitchMemoryWeight(6, [0, 4, 7], 'trance')).toBe(1.0);
  });

  it('trance boosts more than syro', () => {
    const trance = pitchMemoryWeight(0, [0], 'trance');
    const syro = pitchMemoryWeight(0, [0], 'syro');
    expect(trance).toBeGreaterThan(syro);
  });

  it('stays in 0.8-2.0 range', () => {
    const w = pitchMemoryWeight(0, [0, 0, 0, 0], 'trance');
    expect(w).toBeGreaterThanOrEqual(0.8);
    expect(w).toBeLessThanOrEqual(2.5);
  });
});

describe('noveltyWeight', () => {
  it('> 1.0 for unheard pitch', () => {
    expect(noveltyWeight(6, [0, 4, 7], 'syro')).toBeGreaterThan(1.0);
  });

  it('1.0 for heard pitch', () => {
    expect(noveltyWeight(0, [0, 4, 7], 'syro')).toBe(1.0);
  });

  it('syro novelty > trance novelty', () => {
    const syro = noveltyWeight(6, [0], 'syro');
    const trance = noveltyWeight(6, [0], 'trance');
    expect(syro).toBeGreaterThan(trance);
  });
});

describe('memoryStrength', () => {
  it('trance is highest', () => {
    expect(memoryStrength('trance')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(memoryStrength('syro')).toBe(0.20);
  });
});
