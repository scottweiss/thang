import { describe, it, expect } from 'vitest';
import {
  chordThinningGain,
  thinningSensitivity,
} from './chord-density-thinning';

describe('chordThinningGain', () => {
  it('few voices at peak returns 1.0', () => {
    const gain = chordThinningGain(3, 'lofi', 'peak');
    expect(gain).toBe(1.0);
  });

  it('many voices at intro gets thinning', () => {
    const gain = chordThinningGain(5, 'ambient', 'intro');
    expect(gain).toBeLessThan(1.0);
  });

  it('ambient thins more than syro', () => {
    const amb = chordThinningGain(5, 'ambient', 'intro');
    const syro = chordThinningGain(5, 'syro', 'intro');
    expect(amb).toBeLessThan(syro);
  });

  it('peak tolerates more voices', () => {
    const peak = chordThinningGain(5, 'lofi', 'peak');
    const intro = chordThinningGain(5, 'lofi', 'intro');
    expect(peak).toBeGreaterThanOrEqual(intro);
  });

  it('stays in 0.85-1.0 range', () => {
    for (let v = 1; v <= 6; v++) {
      const gain = chordThinningGain(v, 'ambient', 'breakdown');
      expect(gain).toBeGreaterThanOrEqual(0.85);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('thinningSensitivity', () => {
  it('ambient is highest', () => {
    expect(thinningSensitivity('ambient')).toBe(0.65);
  });

  it('syro is low', () => {
    expect(thinningSensitivity('syro')).toBe(0.25);
  });
});
