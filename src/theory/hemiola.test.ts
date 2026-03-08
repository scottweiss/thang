import { describe, it, expect } from 'vitest';
import {
  hemiolaAccentMask,
  claveAccentMask,
  hemiolaProbability,
  hemiolaType,
  applyHemiolaToGain,
} from './hemiola';

describe('hemiolaAccentMask', () => {
  it('accents every 3rd position', () => {
    const mask = hemiolaAccentMask(8, 3);
    expect(mask[0]).toBeGreaterThan(1.0); // position 0
    expect(mask[3]).toBeGreaterThan(1.0); // position 3
    expect(mask[6]).toBeGreaterThan(1.0); // position 6
    expect(mask[1]).toBe(1.0);            // non-accent
    expect(mask[2]).toBe(1.0);            // non-accent
  });

  it('returns correct length', () => {
    expect(hemiolaAccentMask(16, 3)).toHaveLength(16);
    expect(hemiolaAccentMask(8, 3)).toHaveLength(8);
  });

  it('handles zero length', () => {
    expect(hemiolaAccentMask(0, 3)).toEqual([]);
  });

  it('handles grouping of 4 (standard beat)', () => {
    const mask = hemiolaAccentMask(8, 4);
    expect(mask[0]).toBeGreaterThan(1.0);
    expect(mask[4]).toBeGreaterThan(1.0);
    expect(mask[2]).toBe(1.0);
  });
});

describe('claveAccentMask', () => {
  it('follows 3+3+2 pattern', () => {
    const mask = claveAccentMask(8);
    // Accents at 0, 3, 6
    expect(mask[0]).toBeGreaterThan(1.0);
    expect(mask[3]).toBeGreaterThan(1.0);
    expect(mask[6]).toBeGreaterThan(1.0);
    // Non-accents
    expect(mask[1]).toBe(1.0);
    expect(mask[4]).toBe(1.0);
    expect(mask[7]).toBe(1.0);
  });

  it('tiles for longer patterns', () => {
    const mask = claveAccentMask(16);
    expect(mask).toHaveLength(16);
    // Second cycle
    expect(mask[8]).toBeGreaterThan(1.0);  // 0+8
    expect(mask[11]).toBeGreaterThan(1.0); // 3+8
    expect(mask[14]).toBeGreaterThan(1.0); // 6+8
  });
});

describe('hemiolaProbability', () => {
  it('blockhead has highest base probability', () => {
    const bh = hemiolaProbability('blockhead', 'groove', 0.5);
    const amb = hemiolaProbability('ambient', 'groove', 0.5);
    expect(bh).toBeGreaterThan(amb);
  });

  it('ambient never has hemiola', () => {
    expect(hemiolaProbability('ambient', 'groove', 1.0)).toBe(0);
  });

  it('breakdown section increases probability', () => {
    const breakdown = hemiolaProbability('blockhead', 'breakdown', 0.5);
    const intro = hemiolaProbability('blockhead', 'intro', 0.5);
    expect(breakdown).toBeGreaterThan(intro);
  });

  it('early section progress reduces probability', () => {
    const early = hemiolaProbability('disco', 'groove', 0.1);
    const late = hemiolaProbability('disco', 'groove', 0.8);
    expect(late).toBeGreaterThan(early);
  });

  it('never exceeds 0.5', () => {
    const prob = hemiolaProbability('blockhead', 'breakdown', 1.0);
    expect(prob).toBeLessThanOrEqual(0.5);
  });
});

describe('hemiolaType', () => {
  it('disco uses clave', () => {
    expect(hemiolaType('disco')).toBe('clave');
  });

  it('ambient uses triplet', () => {
    expect(hemiolaType('ambient')).toBe('triplet');
  });

  it('blockhead uses clave', () => {
    expect(hemiolaType('blockhead')).toBe('clave');
  });
});

describe('applyHemiolaToGain', () => {
  it('boosts gain at accent positions', () => {
    const gains = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
    const result = applyHemiolaToGain(gains, 'trance');
    // Triplet type: accents at 0, 3, 6
    expect(result[0]).toBeGreaterThan(0.5);
    expect(result[3]).toBeGreaterThan(0.5);
    expect(result[1]).toBe(0.5);
  });

  it('preserves array length', () => {
    const gains = new Array(16).fill(0.3);
    expect(applyHemiolaToGain(gains, 'disco')).toHaveLength(16);
  });
});
