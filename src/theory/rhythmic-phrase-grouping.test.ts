import { describe, it, expect } from 'vitest';
import {
  groupBoundaryRest,
  phraseGroupSize,
  phraseBoundaryEmphasis,
} from './rhythmic-phrase-grouping';

describe('groupBoundaryRest', () => {
  it('last beat of group has highest rest probability', () => {
    const lastBeat = groupBoundaryRest(3, 'trance'); // beat 3 = last of 4-beat group
    const midBeat = groupBoundaryRest(1, 'trance');
    expect(lastBeat).toBeGreaterThan(midBeat);
  });

  it('non-boundary beats return 0', () => {
    expect(groupBoundaryRest(0, 'trance')).toBe(0);
  });

  it('stays in 0-0.6 range', () => {
    for (let b = 0; b < 8; b++) {
      const r = groupBoundaryRest(b, 'avril');
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(0.6);
    }
  });

  it('blockhead has stronger boundaries than ambient', () => {
    // blockhead group=2, so beat 1 is boundary
    const bh = groupBoundaryRest(1, 'blockhead');
    // ambient group=6, so beat 5 is boundary
    const amb = groupBoundaryRest(5, 'ambient');
    expect(bh).toBeGreaterThan(amb);
  });
});

describe('phraseGroupSize', () => {
  it('trance has 4-beat groups', () => {
    expect(phraseGroupSize('trance')).toBe(4);
  });

  it('syro has 7-beat groups', () => {
    expect(phraseGroupSize('syro')).toBe(7);
  });
});

describe('phraseBoundaryEmphasis', () => {
  it('avril is high', () => {
    expect(phraseBoundaryEmphasis('avril')).toBe(0.55);
  });

  it('ambient is low', () => {
    expect(phraseBoundaryEmphasis('ambient')).toBe(0.25);
  });
});
