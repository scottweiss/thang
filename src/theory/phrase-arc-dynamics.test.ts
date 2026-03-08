import { describe, it, expect } from 'vitest';
import {
  phraseArcGain,
  arcDepth,
} from './phrase-arc-dynamics';

describe('phraseArcGain', () => {
  it('peak of phrase gets boost', () => {
    const gain = phraseArcGain(0.65, 'avril', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('start of phrase is lower than peak', () => {
    const start = phraseArcGain(0.05, 'avril', 'groove');
    const peak = phraseArcGain(0.65, 'avril', 'groove');
    expect(peak).toBeGreaterThan(start);
  });

  it('avril is deeper than syro', () => {
    const av = phraseArcGain(0.65, 'avril', 'groove');
    const sy = phraseArcGain(0.65, 'syro', 'groove');
    expect(av).toBeGreaterThan(sy);
  });

  it('peak section amplifies arc', () => {
    const pk = phraseArcGain(0.65, 'avril', 'peak');
    const bd = phraseArcGain(0.65, 'avril', 'breakdown');
    expect(pk).toBeGreaterThan(bd);
  });

  it('stays in 0.96-1.05 range', () => {
    for (let p = 0; p <= 1.0; p += 0.05) {
      const gain = phraseArcGain(p, 'avril', 'peak');
      expect(gain).toBeGreaterThanOrEqual(0.96);
      expect(gain).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('arcDepth', () => {
  it('avril is deepest', () => {
    expect(arcDepth('avril')).toBe(0.60);
  });

  it('syro is shallowest', () => {
    expect(arcDepth('syro')).toBe(0.20);
  });
});
