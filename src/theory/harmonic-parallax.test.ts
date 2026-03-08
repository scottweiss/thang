import { describe, it, expect } from 'vitest';
import {
  parallaxDelay,
  shouldHoldPreviousChord,
  parallaxDepth,
} from './harmonic-parallax';

describe('parallaxDelay', () => {
  it('melody has 0 delay', () => {
    expect(parallaxDelay('melody', 'ambient', 'breakdown')).toBe(0);
  });

  it('drone has longest delay', () => {
    const drone = parallaxDelay('drone', 'ambient', 'breakdown');
    const melody = parallaxDelay('melody', 'ambient', 'breakdown');
    expect(drone).toBeGreaterThan(melody);
  });

  it('stays in 0-3 range', () => {
    for (const layer of ['drone', 'harmony', 'melody', 'arp', 'texture', 'atmosphere']) {
      const d = parallaxDelay(layer, 'ambient', 'breakdown');
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(3);
    }
  });

  it('trance has less delay than ambient', () => {
    const trance = parallaxDelay('drone', 'trance', 'groove');
    const ambient = parallaxDelay('drone', 'ambient', 'groove');
    expect(trance).toBeLessThanOrEqual(ambient);
  });
});

describe('shouldHoldPreviousChord', () => {
  it('melody never holds', () => {
    expect(shouldHoldPreviousChord('melody', 0, 'ambient', 'breakdown')).toBe(false);
  });

  it('drone holds when recently changed in ambient', () => {
    const delay = parallaxDelay('drone', 'ambient', 'breakdown');
    if (delay > 0) {
      expect(shouldHoldPreviousChord('drone', 0, 'ambient', 'breakdown')).toBe(true);
    }
  });

  it('drone releases after delay', () => {
    expect(shouldHoldPreviousChord('drone', 5, 'ambient', 'breakdown')).toBe(false);
  });
});

describe('parallaxDepth', () => {
  it('ambient is deepest', () => {
    expect(parallaxDepth('ambient')).toBe(0.60);
  });

  it('disco is shallowest', () => {
    expect(parallaxDepth('disco')).toBe(0.10);
  });
});
