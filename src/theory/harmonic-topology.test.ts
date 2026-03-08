import { describe, it, expect } from 'vitest';
import {
  chordDistance,
  distanceBias,
  shouldApplyTopology,
  preferredDistance,
} from './harmonic-topology';

describe('chordDistance', () => {
  it('0 for same chord', () => {
    expect(chordDistance(0, 0, 'maj', 'maj')).toBe(0);
  });

  it('low for I→V (functional neighbors)', () => {
    expect(chordDistance(0, 4, 'maj', 'maj')).toBeLessThan(0.3);
  });

  it('high for I→vii° (functionally distant)', () => {
    expect(chordDistance(0, 6, 'maj', 'dim')).toBeGreaterThan(0.5);
  });

  it('quality matters: major→minor adds distance', () => {
    const sameQuality = chordDistance(0, 0, 'maj', 'maj');
    const diffQuality = chordDistance(0, 0, 'maj', 'min');
    expect(diffQuality).toBeGreaterThan(sameQuality);
  });

  it('symmetric for same qualities', () => {
    expect(chordDistance(0, 4, 'maj', 'maj')).toBe(chordDistance(4, 0, 'maj', 'maj'));
  });

  it('always 0-1 range', () => {
    for (let from = 0; from < 7; from++) {
      for (let to = 0; to < 7; to++) {
        const d = chordDistance(from, to, 'maj', 'min');
        expect(d).toBeGreaterThanOrEqual(0);
        expect(d).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('distanceBias', () => {
  it('> 1.0 at preferred distance', () => {
    // Trance prefers 0.25, so a chord at 0.25 distance should be preferred
    expect(distanceBias(0.25, 'trance', 'peak')).toBeGreaterThan(1.0);
  });

  it('< 1.0 at very different distance', () => {
    // Trance prefers 0.25, so a chord at 0.9 distance should be disfavored
    expect(distanceBias(0.9, 'trance', 'peak')).toBeLessThan(1.0);
  });

  it('syro prefers larger distances', () => {
    // At distance 0.6, syro should rate higher than trance
    const syroBias = distanceBias(0.6, 'syro', 'peak');
    const tranceBias = distanceBias(0.6, 'trance', 'peak');
    expect(syroBias).toBeGreaterThan(tranceBias);
  });
});

describe('shouldApplyTopology', () => {
  it('true for all moods (all > 0.15)', () => {
    expect(shouldApplyTopology('trance')).toBe(true);
    expect(shouldApplyTopology('syro')).toBe(true);
  });
});

describe('preferredDistance', () => {
  it('trance prefers close', () => {
    expect(preferredDistance('trance')).toBe(0.25);
  });

  it('syro prefers far', () => {
    expect(preferredDistance('syro')).toBe(0.60);
  });
});
