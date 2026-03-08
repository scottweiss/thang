import { describe, it, expect } from 'vitest';
import {
  breathSpacingGain,
  breathDepth,
} from './melodic-breath-spacing';

describe('breathSpacingGain', () => {
  it('mid-phrase is neutral', () => {
    const gain = breathSpacingGain(0.5, 'ambient', 'groove');
    expect(gain).toBe(1.0);
  });

  it('phrase end gets reduction', () => {
    const gain = breathSpacingGain(0.98, 'ambient', 'groove');
    expect(gain).toBeLessThan(1.0);
  });

  it('ambient breathes more than trance', () => {
    const amb = breathSpacingGain(0.98, 'ambient', 'groove');
    const tr = breathSpacingGain(0.98, 'trance', 'groove');
    expect(amb).toBeLessThan(tr);
  });

  it('breakdown breathes more than peak', () => {
    const bd = breathSpacingGain(0.98, 'lofi', 'breakdown');
    const pk = breathSpacingGain(0.98, 'lofi', 'peak');
    expect(bd).toBeLessThan(pk);
  });

  it('stays in 0.92-1.0 range', () => {
    for (let p = 0; p <= 1.0; p += 0.05) {
      const gain = breathSpacingGain(p, 'ambient', 'breakdown');
      expect(gain).toBeGreaterThanOrEqual(0.92);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('breathDepth', () => {
  it('ambient is deepest', () => {
    expect(breathDepth('ambient')).toBe(0.60);
  });

  it('trance is shallowest', () => {
    expect(breathDepth('trance')).toBe(0.20);
  });
});
