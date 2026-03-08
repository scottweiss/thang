import { describe, it, expect } from 'vitest';
import {
  isEscapeTone,
  escapeToneColorLpf,
  escapeColorDepthValue,
} from './melodic-escape-tone-color';

describe('isEscapeTone', () => {
  it('step up then leap down is escape', () => {
    expect(isEscapeTone(2, -5)).toBe(true);
  });

  it('step down then leap up is escape', () => {
    expect(isEscapeTone(-1, 4)).toBe(true);
  });

  it('leap arriving is not escape', () => {
    expect(isEscapeTone(5, -3)).toBe(false);
  });

  it('step leaving is not escape', () => {
    expect(isEscapeTone(1, -2)).toBe(false);
  });

  it('same direction is not escape', () => {
    expect(isEscapeTone(1, 5)).toBe(false);
  });
});

describe('escapeToneColorLpf', () => {
  it('escape tone gets brightness', () => {
    const lpf = escapeToneColorLpf(2, -5, 'flim', 'peak');
    expect(lpf).toBeGreaterThan(1.0);
  });

  it('non-escape is neutral', () => {
    const lpf = escapeToneColorLpf(5, -3, 'flim', 'peak');
    expect(lpf).toBe(1.0);
  });

  it('flim colors more than trance', () => {
    const fl = escapeToneColorLpf(1, -4, 'flim', 'peak');
    const tr = escapeToneColorLpf(1, -4, 'trance', 'peak');
    expect(fl).toBeGreaterThan(tr);
  });

  it('stays in 1.0-1.06 range', () => {
    for (let a = -2; a <= 2; a++) {
      for (let d = -7; d <= 7; d++) {
        const lpf = escapeToneColorLpf(a, d, 'flim', 'peak');
        expect(lpf).toBeGreaterThanOrEqual(1.0);
        expect(lpf).toBeLessThanOrEqual(1.06);
      }
    }
  });
});

describe('escapeColorDepthValue', () => {
  it('flim is highest', () => {
    expect(escapeColorDepthValue('flim')).toBe(0.55);
  });

  it('trance is low', () => {
    expect(escapeColorDepthValue('trance')).toBe(0.15);
  });
});
