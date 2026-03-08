import { describe, it, expect } from 'vitest';
import {
  getAnchorTones,
  anchorBias,
  isAnchorTone,
  anchorUsageScore,
  melodicAnchorStrength,
} from './melodic-anchor';

const C_MAJOR = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

describe('getAnchorTones', () => {
  it('returns root and P5 for ambient', () => {
    const anchors = getAnchorTones(C_MAJOR, 'ambient');
    expect(anchors).toContain('C');
    expect(anchors).toContain('G');
  });

  it('returns guide tones for lofi', () => {
    const anchors = getAnchorTones(C_MAJOR, 'lofi');
    expect(anchors).toContain('E');  // 3rd
    expect(anchors).toContain('B');  // 7th
  });

  it('returns only root for trance', () => {
    const anchors = getAnchorTones(C_MAJOR, 'trance');
    expect(anchors).toEqual(['C']);
  });

  it('returns non-obvious anchors for syro', () => {
    const anchors = getAnchorTones(C_MAJOR, 'syro');
    expect(anchors).toContain('D');  // 2nd
    expect(anchors).toContain('A');  // 6th
  });

  it('handles different scales', () => {
    const dMinor = ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'];
    const anchors = getAnchorTones(dMinor, 'ambient');
    expect(anchors).toContain('D');  // root
    expect(anchors).toContain('A');  // 5th
  });
});

describe('anchorBias', () => {
  it('returns > 1.0 for anchor tones', () => {
    expect(anchorBias('C', C_MAJOR, 'ambient', false)).toBeGreaterThan(1.0);
  });

  it('returns 1.0 for non-anchor tones', () => {
    expect(anchorBias('F', C_MAJOR, 'ambient', false)).toBe(1.0);
  });

  it('stronger at phrase boundaries', () => {
    const atBound = anchorBias('C', C_MAJOR, 'trance', true);
    const notBound = anchorBias('C', C_MAJOR, 'trance', false);
    expect(atBound).toBeGreaterThan(notBound);
  });

  it('strips octave from candidate', () => {
    expect(anchorBias('C4', C_MAJOR, 'ambient', false)).toBeGreaterThan(1.0);
  });

  it('scales by mood strength', () => {
    const trance = anchorBias('C', C_MAJOR, 'trance', false);
    const ambient = anchorBias('C', C_MAJOR, 'ambient', false);
    expect(trance).toBeGreaterThan(ambient);
  });
});

describe('isAnchorTone', () => {
  it('identifies anchor tones', () => {
    expect(isAnchorTone('C', C_MAJOR, 'ambient')).toBe(true);
    expect(isAnchorTone('G', C_MAJOR, 'ambient')).toBe(true);
  });

  it('rejects non-anchor tones', () => {
    expect(isAnchorTone('F', C_MAJOR, 'ambient')).toBe(false);
  });

  it('works with octave numbers', () => {
    expect(isAnchorTone('C4', C_MAJOR, 'ambient')).toBe(true);
  });
});

describe('anchorUsageScore', () => {
  it('scores well for balanced anchor usage', () => {
    // trance wants ~50% root anchor usage
    const notes = ['C4', 'D4', 'C4', 'E4'];
    const score = anchorUsageScore(notes, C_MAJOR, 'trance');
    expect(score).toBeGreaterThan(0.5);
  });

  it('returns 0 for empty melody', () => {
    expect(anchorUsageScore([], C_MAJOR, 'lofi')).toBe(0);
  });

  it('penalizes too few anchors', () => {
    const noAnchors = ['D4', 'F4', 'A4', 'D4'];
    const score = anchorUsageScore(noAnchors, C_MAJOR, 'trance');
    expect(score).toBeLessThan(0.5);
  });
});

describe('melodicAnchorStrength', () => {
  it('trance has strongest anchoring', () => {
    expect(melodicAnchorStrength('trance')).toBe(0.50);
  });

  it('ambient has weakest anchoring', () => {
    expect(melodicAnchorStrength('ambient')).toBe(0.15);
  });
});
