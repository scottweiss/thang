import { describe, it, expect } from 'vitest';
import {
  phraseBoundaryGain,
  boundaryDepth,
} from './rhythmic-phrase-boundary';

describe('phraseBoundaryGain', () => {
  it('mid-phrase is neutral', () => {
    const gain = phraseBoundaryGain(0.5, 'ambient', 'groove');
    expect(gain).toBe(1.0);
  });

  it('near boundary gets reduction', () => {
    const gain = phraseBoundaryGain(0.02, 'ambient', 'groove');
    expect(gain).toBeLessThan(1.0);
  });

  it('phrase end also gets reduction', () => {
    const gain = phraseBoundaryGain(0.98, 'ambient', 'groove');
    expect(gain).toBeLessThan(1.0);
  });

  it('ambient has deeper boundary than trance', () => {
    const amb = phraseBoundaryGain(0.01, 'ambient', 'groove');
    const tr = phraseBoundaryGain(0.01, 'trance', 'groove');
    expect(amb).toBeLessThan(tr);
  });

  it('breakdown has deeper boundary than peak', () => {
    const bd = phraseBoundaryGain(0.01, 'lofi', 'breakdown');
    const pk = phraseBoundaryGain(0.01, 'lofi', 'peak');
    expect(bd).toBeLessThan(pk);
  });

  it('stays in 0.95-1.0 range', () => {
    for (let p = 0; p <= 1.0; p += 0.05) {
      const gain = phraseBoundaryGain(p, 'ambient', 'breakdown');
      expect(gain).toBeGreaterThanOrEqual(0.95);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('boundaryDepth', () => {
  it('ambient is deepest', () => {
    expect(boundaryDepth('ambient')).toBe(0.55);
  });

  it('trance is shallowest', () => {
    expect(boundaryDepth('trance')).toBe(0.20);
  });
});
