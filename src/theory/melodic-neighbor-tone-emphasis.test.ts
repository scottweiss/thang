import { describe, it, expect } from 'vitest';
import {
  isNeighborTone,
  neighborToneEmphasisGain,
  neighborStrengthValue,
} from './melodic-neighbor-tone-emphasis';

describe('isNeighborTone', () => {
  it('upper neighbor: step up then step down', () => {
    expect(isNeighborTone(1, -1)).toBe(true);
  });

  it('lower neighbor: step down then step up', () => {
    expect(isNeighborTone(-2, 2)).toBe(true);
  });

  it('same direction is not neighbor', () => {
    expect(isNeighborTone(1, 1)).toBe(false);
  });

  it('leap is not neighbor', () => {
    expect(isNeighborTone(5, -5)).toBe(false);
  });

  it('unison is not neighbor', () => {
    expect(isNeighborTone(0, 1)).toBe(false);
  });
});

describe('neighborToneEmphasisGain', () => {
  it('neighbor tone gets boost', () => {
    const gain = neighborToneEmphasisGain(1, -1, 'flim', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-neighbor is neutral', () => {
    const gain = neighborToneEmphasisGain(5, -3, 'flim', 'groove');
    expect(gain).toBe(1.0);
  });

  it('chromatic neighbor gets more emphasis', () => {
    const chromatic = neighborToneEmphasisGain(1, -1, 'flim', 'peak');
    const diatonic = neighborToneEmphasisGain(2, -2, 'flim', 'peak');
    expect(chromatic).toBeGreaterThan(diatonic);
  });

  it('flim emphasizes more than trance', () => {
    const fl = neighborToneEmphasisGain(1, -1, 'flim', 'peak');
    const tr = neighborToneEmphasisGain(1, -1, 'trance', 'peak');
    expect(fl).toBeGreaterThan(tr);
  });

  it('stays in 1.0-1.04 range', () => {
    for (let p = -2; p <= 2; p++) {
      for (let c = -2; c <= 2; c++) {
        const gain = neighborToneEmphasisGain(p, c, 'flim', 'peak');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('neighborStrengthValue', () => {
  it('flim is highest', () => {
    expect(neighborStrengthValue('flim')).toBe(0.55);
  });

  it('trance is low', () => {
    expect(neighborStrengthValue('trance')).toBe(0.15);
  });
});
