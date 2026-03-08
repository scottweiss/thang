import { describe, it, expect } from 'vitest';
import {
  gravitationalPull,
  buildGravityMap,
  gravityScore,
  selectByGravity,
  pitchGravityStrength,
} from './pitch-gravity-well';

describe('gravitationalPull', () => {
  it('zero distance = full weight', () => {
    expect(gravitationalPull(0, 0, 0.5)).toBe(0.5);
  });

  it('decreases with distance', () => {
    const close = gravitationalPull(0, 1, 0.5);
    const far = gravitationalPull(0, 6, 0.5);
    expect(close).toBeGreaterThan(far);
  });

  it('wraps around (enharmonic distance)', () => {
    // C to B = 1 semitone (not 11)
    const pull = gravitationalPull(0, 11, 0.5);
    expect(pull).toBeGreaterThan(0.2); // close
  });

  it('zero weight = zero pull', () => {
    expect(gravitationalPull(0, 0, 0)).toBe(0);
  });
});

describe('buildGravityMap', () => {
  it('returns 12 entries', () => {
    const map = buildGravityMap([0, 4, 7], 0, 'trance', 'peak');
    expect(map).toHaveLength(12);
  });

  it('root has strongest gravity', () => {
    const map = buildGravityMap([0, 4, 7], 0, 'trance', 'peak');
    expect(map[0]).toBe(Math.max(...map));
  });

  it('chord tones have more gravity than non-chord tones', () => {
    const map = buildGravityMap([0, 4, 7], 0, 'trance', 'groove');
    // E (4) and G (7) should have more gravity than F# (6)
    expect(map[4]).toBeGreaterThan(map[6]);
  });

  it('ambient has weak gravity', () => {
    const ambientMap = buildGravityMap([0, 4, 7], 0, 'ambient', 'groove');
    const tranceMap = buildGravityMap([0, 4, 7], 0, 'trance', 'groove');
    expect(tranceMap[0]).toBeGreaterThan(ambientMap[0]);
  });
});

describe('gravityScore', () => {
  it('returns value from map', () => {
    const map = buildGravityMap([0, 4, 7], 0, 'trance', 'peak');
    expect(gravityScore(0, map)).toBe(map[0]);
  });

  it('wraps negative pitch classes', () => {
    const map = buildGravityMap([0], 0, 'trance', 'groove');
    expect(gravityScore(-1, map)).toBe(map[11]);
  });
});

describe('selectByGravity', () => {
  it('selects note nearest to gravity well', () => {
    const map = buildGravityMap([0, 4, 7], 0, 'trance', 'peak');
    // C should win over F# (C is the root)
    const result = selectByGravity(['C4', 'F#4'], map);
    expect(result).toBe('C4');
  });

  it('returns rest for empty candidates', () => {
    const map = buildGravityMap([0], 0, 'trance', 'peak');
    expect(selectByGravity([], map)).toBe('~');
  });

  it('returns single candidate', () => {
    const map = buildGravityMap([0], 0, 'trance', 'peak');
    expect(selectByGravity(['D4'], map)).toBe('D4');
  });
});

describe('pitchGravityStrength', () => {
  it('trance has highest', () => {
    expect(pitchGravityStrength('trance')).toBe(0.55);
  });

  it('ambient has lowest', () => {
    expect(pitchGravityStrength('ambient')).toBe(0.05);
  });
});
