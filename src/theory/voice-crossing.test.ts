import { describe, it, expect } from 'vitest';
import {
  countCrossings,
  voicingSpread,
  crossingTension,
  spreadTension,
  shouldRespace,
  eliminateCrossings,
  voicingQuality,
  crossingTolerance,
} from './voice-crossing';

describe('countCrossings', () => {
  it('no crossings in sorted descending', () => {
    expect(countCrossings([72, 67, 60, 48])).toBe(0);
  });

  it('one crossing', () => {
    expect(countCrossings([72, 67, 70, 48])).toBe(1);
  });

  it('all crossed (ascending)', () => {
    expect(countCrossings([48, 60, 67, 72])).toBe(3);
  });

  it('single note = no crossings', () => {
    expect(countCrossings([60])).toBe(0);
  });

  it('empty = no crossings', () => {
    expect(countCrossings([])).toBe(0);
  });
});

describe('voicingSpread', () => {
  it('calculates range correctly', () => {
    expect(voicingSpread([48, 60, 67, 72])).toBe(24);
  });

  it('single note = 0 spread', () => {
    expect(voicingSpread([60])).toBe(0);
  });

  it('unison = 0 spread', () => {
    expect(voicingSpread([60, 60])).toBe(0);
  });
});

describe('crossingTension', () => {
  it('no crossings = no tension', () => {
    expect(crossingTension([72, 67, 60, 48], 'trance')).toBe(0);
  });

  it('all crossings = high tension for trance', () => {
    const t = crossingTension([48, 60, 67, 72], 'trance');
    expect(t).toBeGreaterThan(0.5);
  });

  it('syro tolerates more crossings', () => {
    const pitches = [72, 60, 67, 48]; // 1 crossing
    const trance = crossingTension(pitches, 'trance');
    const syro = crossingTension(pitches, 'syro');
    expect(trance).toBeGreaterThanOrEqual(syro);
  });

  it('single note = no tension', () => {
    expect(crossingTension([60], 'trance')).toBe(0);
  });
});

describe('spreadTension', () => {
  it('ideal spread = low tension', () => {
    // ambient target = 30 * 1.0 (groove) = 30
    const t = spreadTension([36, 66], 'ambient', 'groove');
    expect(t).toBeLessThan(0.1);
  });

  it('too narrow = tension', () => {
    // ambient target 30, spread is 5
    const t = spreadTension([60, 65], 'ambient', 'groove');
    expect(t).toBeGreaterThan(0.5);
  });

  it('too wide = tension', () => {
    // blockhead target 14, spread is 40
    const t = spreadTension([30, 70], 'blockhead', 'groove');
    expect(t).toBeGreaterThan(0.5);
  });
});

describe('shouldRespace', () => {
  it('clean voicing does not need respacing', () => {
    expect(shouldRespace([72, 67, 60, 48], 'trance')).toBe(false);
  });

  it('tangled voicing needs respacing for trance', () => {
    expect(shouldRespace([48, 60, 67, 72], 'trance')).toBe(true);
  });
});

describe('eliminateCrossings', () => {
  it('sorts descending', () => {
    expect(eliminateCrossings([48, 60, 67, 72])).toEqual([72, 67, 60, 48]);
  });

  it('already sorted stays same', () => {
    expect(eliminateCrossings([72, 67, 60])).toEqual([72, 67, 60]);
  });
});

describe('voicingQuality', () => {
  it('clean, well-spread voicing has high quality', () => {
    // lofi target spread ~22, crossings OK
    const q = voicingQuality([72, 67, 60, 50], 'lofi', 'groove');
    expect(q).toBeGreaterThan(0.6);
  });

  it('tangled, narrow voicing has low quality for trance', () => {
    const q = voicingQuality([60, 62, 61, 63], 'trance', 'groove');
    expect(q).toBeLessThan(0.5);
  });
});

describe('crossingTolerance', () => {
  it('syro has highest tolerance', () => {
    expect(crossingTolerance('syro')).toBe(0.55);
  });

  it('trance has lowest tolerance', () => {
    expect(crossingTolerance('trance')).toBe(0.10);
  });
});
