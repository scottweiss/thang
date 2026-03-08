import { describe, it, expect } from 'vitest';
import { narmourNext, buildNarmourPhrase } from './narmour';

describe('narmourNext', () => {
  it('small interval implies process (same direction tendency)', () => {
    // Going up by 1 step, next should tend to continue up
    const results = Array.from({ length: 200 }, () => narmourNext(10, 3, 4));
    const upCount = results.filter(r => r > 4).length;
    expect(upCount).toBeGreaterThan(80); // >40% continue up
  });

  it('large interval implies reversal (opposite direction tendency)', () => {
    // Leap up by 5 steps, next should tend to come back down
    const results = Array.from({ length: 200 }, () => narmourNext(10, 1, 6));
    const downCount = results.filter(r => r < 6).length;
    expect(downCount).toBeGreaterThan(80); // >40% reverse
  });

  it('result is always clamped to valid range', () => {
    for (let i = 0; i < 100; i++) {
      const result = narmourNext(10, 0, 0);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(10);
    }
  });

  it('handles edge at bottom of range', () => {
    for (let i = 0; i < 50; i++) {
      const result = narmourNext(10, 1, 0);
      expect(result).toBeGreaterThanOrEqual(0);
    }
  });

  it('handles edge at top of range', () => {
    for (let i = 0; i < 50; i++) {
      const result = narmourNext(10, 8, 9);
      expect(result).toBeLessThan(10);
    }
  });
});

describe('buildNarmourPhrase', () => {
  it('produces requested number of notes', () => {
    const phrase = buildNarmourPhrase(10, 5, 4);
    expect(phrase).toHaveLength(4);
  });

  it('handles single note request', () => {
    const phrase = buildNarmourPhrase(10, 5, 1);
    expect(phrase).toHaveLength(1);
  });

  it('handles empty request', () => {
    const phrase = buildNarmourPhrase(10, 5, 0);
    expect(phrase).toHaveLength(0);
  });

  it('all indices are within range', () => {
    for (let trial = 0; trial < 20; trial++) {
      const phrase = buildNarmourPhrase(10, 3, 8);
      phrase.forEach(idx => {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(10);
      });
    }
  });

  it('starts at or near the anchor index', () => {
    const phrase = buildNarmourPhrase(10, 5, 4);
    expect(phrase[0]).toBe(5); // first note IS the anchor
  });

  it('clamps out-of-range anchor', () => {
    const phrase = buildNarmourPhrase(10, 15, 3);
    expect(phrase[0]).toBe(9); // clamped to max
  });
});
