import { describe, it, expect } from 'vitest';
import {
  availableRange,
  semitoneRange,
  registralExpansion,
} from './registral-envelope';

describe('availableRange', () => {
  it('phrase start has limited range', () => {
    const start = availableRange(0, 'avril');
    expect(start).toBeLessThan(1.0);
  });

  it('mid-phrase has wider range', () => {
    const mid = availableRange(0.6, 'avril');
    const start = availableRange(0, 'avril');
    expect(mid).toBeGreaterThan(start);
  });

  it('phrase end contracts', () => {
    const end = availableRange(1.0, 'avril');
    const mid = availableRange(0.6, 'avril');
    expect(end).toBeLessThan(mid);
  });

  it('stays in 0.3-1.0 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const r = availableRange(p, 'ambient');
      expect(r).toBeGreaterThanOrEqual(0.3);
      expect(r).toBeLessThanOrEqual(1.0);
    }
  });

  it('syro expands more than blockhead', () => {
    const syro = availableRange(0.6, 'syro');
    const bh = availableRange(0.6, 'blockhead');
    expect(syro).toBeGreaterThan(bh);
  });
});

describe('semitoneRange', () => {
  it('returns integer semitones', () => {
    const range = semitoneRange(0.5, 'lofi', 24);
    expect(Number.isInteger(range)).toBe(true);
  });

  it('scales with max range', () => {
    const small = semitoneRange(0.6, 'avril', 12);
    const large = semitoneRange(0.6, 'avril', 24);
    expect(large).toBeGreaterThan(small);
  });
});

describe('registralExpansion', () => {
  it('syro is high', () => {
    expect(registralExpansion('syro')).toBe(0.65);
  });

  it('blockhead is low', () => {
    expect(registralExpansion('blockhead')).toBe(0.25);
  });
});
