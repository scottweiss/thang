import { describe, it, expect } from 'vitest';
import {
  strettoEntry,
  transposeForStretto,
  strettoOffset,
  strettoInterval,
  shouldApplyStretto,
  strettoTendency,
} from './stretto';

describe('strettoEntry', () => {
  it('creates delayed copy with leading rests', () => {
    const motif = ['C4', 'D4', 'E4'];
    const entry = strettoEntry(motif, 2, 6);
    expect(entry[0]).toBe('~');
    expect(entry[1]).toBe('~');
    expect(entry[2]).toBe('C4');
    expect(entry[3]).toBe('D4');
    expect(entry[4]).toBe('E4');
    expect(entry[5]).toBe('~');
  });

  it('truncates if motif exceeds length', () => {
    const entry = strettoEntry(['A4', 'B4', 'C5'], 1, 3);
    expect(entry).toHaveLength(3);
    expect(entry[0]).toBe('~');
    expect(entry[1]).toBe('A4');
    expect(entry[2]).toBe('B4');
  });

  it('handles empty motif', () => {
    const entry = strettoEntry([], 2, 4);
    expect(entry).toEqual(['~', '~', '~', '~']);
  });
});

describe('transposeForStretto', () => {
  it('transposes up a fifth (7 semitones)', () => {
    const result = transposeForStretto(['C4', 'D4'], 7, []);
    expect(result[0]).toBe('G4');
    expect(result[1]).toBe('A4');
  });

  it('preserves rests', () => {
    expect(transposeForStretto(['~'], 7, [])).toEqual(['~']);
  });

  it('handles octave boundary', () => {
    const result = transposeForStretto(['A4'], 5, []);
    expect(result[0]).toBe('D5');
  });
});

describe('strettoOffset', () => {
  it('high tension gives tight offset', () => {
    const offset = strettoOffset(8, 0.9, 'trance');
    expect(offset).toBeLessThanOrEqual(3);
  });

  it('low tension gives wider offset', () => {
    const offset = strettoOffset(8, 0.1, 'trance');
    expect(offset).toBeGreaterThanOrEqual(3);
  });

  it('always returns at least 1', () => {
    expect(strettoOffset(4, 1.0, 'syro')).toBeGreaterThanOrEqual(1);
  });

  it('handles short motif', () => {
    expect(strettoOffset(1, 0.5, 'lofi')).toBe(1);
  });
});

describe('strettoInterval', () => {
  it('returns a valid interval', () => {
    for (let i = 0; i < 20; i++) {
      const interval = strettoInterval('trance', i);
      expect(typeof interval).toBe('number');
      expect(interval).toBeGreaterThanOrEqual(0);
      expect(interval).toBeLessThanOrEqual(12);
    }
  });

  it('is deterministic', () => {
    expect(strettoInterval('lofi', 42)).toBe(strettoInterval('lofi', 42));
  });
});

describe('shouldApplyStretto', () => {
  it('is deterministic', () => {
    const a = shouldApplyStretto(42, 'trance', 'build');
    const b = shouldApplyStretto(42, 'trance', 'build');
    expect(a).toBe(b);
  });

  it('build has more stretto than intro', () => {
    const buildCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyStretto(i, 'trance', 'build')
    ).filter(Boolean).length;
    const introCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyStretto(i, 'trance', 'intro')
    ).filter(Boolean).length;
    expect(buildCount).toBeGreaterThan(introCount);
  });
});

describe('strettoTendency', () => {
  it('trance has highest', () => {
    expect(strettoTendency('trance')).toBe(0.35);
  });

  it('ambient has lowest', () => {
    expect(strettoTendency('ambient')).toBe(0.05);
  });
});
