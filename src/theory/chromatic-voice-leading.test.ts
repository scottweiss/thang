import { describe, it, expect } from 'vitest';
import {
  countChromaticMotions,
  chromaticLeadingGain,
  chromaticEmphasis,
} from './chromatic-voice-leading';

describe('countChromaticMotions', () => {
  it('0 when no semitone motion', () => {
    // C(0) E(4) → F#(6) A(9) — 0→6=6, 0→9=3, 4→6=2, 4→9=5 — no semitones
    expect(countChromaticMotions([0, 4], [6, 9])).toBe(0);
  });

  it('detects semitone up', () => {
    // E→F is semitone (4→5)
    expect(countChromaticMotions([0, 4, 7], [0, 5, 7])).toBe(1);
  });

  it('detects semitone down', () => {
    // F→E is semitone (5→4)
    expect(countChromaticMotions([0, 5, 9], [0, 4, 9])).toBe(1);
  });

  it('counts multiple chromatic motions', () => {
    // C-E-G → Db-F-Ab (all move by semitone)
    expect(countChromaticMotions([0, 4, 7], [1, 5, 8])).toBe(3);
  });

  it('wraps around (B→C)', () => {
    // B=11, C=0 — semitone
    expect(countChromaticMotions([11], [0])).toBe(1);
  });
});

describe('chromaticLeadingGain', () => {
  it('1.0 when no chromatic motion', () => {
    expect(chromaticLeadingGain(0, 3, 'avril')).toBe(1.0);
  });

  it('> 1.0 when chromatic motion exists', () => {
    expect(chromaticLeadingGain(2, 3, 'avril')).toBeGreaterThan(1.0);
  });

  it('more motion = more boost', () => {
    const one = chromaticLeadingGain(1, 3, 'lofi');
    const two = chromaticLeadingGain(2, 3, 'lofi');
    expect(two).toBeGreaterThan(one);
  });

  it('stays in 1.0-1.12 range', () => {
    const g = chromaticLeadingGain(3, 3, 'avril');
    expect(g).toBeGreaterThanOrEqual(1.0);
    expect(g).toBeLessThanOrEqual(1.12);
  });

  it('lofi emphasizes more than blockhead', () => {
    const lofi = chromaticLeadingGain(2, 3, 'lofi');
    const bh = chromaticLeadingGain(2, 3, 'blockhead');
    expect(lofi).toBeGreaterThan(bh);
  });
});

describe('chromaticEmphasis', () => {
  it('avril is high', () => {
    expect(chromaticEmphasis('avril')).toBe(0.55);
  });

  it('blockhead is low', () => {
    expect(chromaticEmphasis('blockhead')).toBe(0.15);
  });
});
