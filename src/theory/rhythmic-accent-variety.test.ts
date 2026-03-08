import { describe, it, expect } from 'vitest';
import {
  accentVarietyGain,
  varietyDrive,
} from './rhythmic-accent-variety';

describe('accentVarietyGain', () => {
  it('underaccented beat gets boost', () => {
    const recent = [0, 0, 4, 4, 8, 8, 12, 12]; // beats 0,4,8,12 overused
    const gain = accentVarietyGain(3, recent, 'syro'); // beat 3 never accented
    expect(gain).toBeGreaterThan(1.0);
  });

  it('overaccented beat gets reduction', () => {
    const recent = [0, 0, 0, 0, 0, 0, 0, 0]; // all on beat 0
    const gain = accentVarietyGain(0, recent, 'syro');
    expect(gain).toBeLessThan(1.0);
  });

  it('too few accents is neutral', () => {
    const gain = accentVarietyGain(0, [0, 4], 'syro');
    expect(gain).toBe(1.0);
  });

  it('syro drives more variety than trance', () => {
    const recent = [0, 0, 0, 0, 0, 0, 0, 0];
    const syro = accentVarietyGain(7, recent, 'syro');
    const trance = accentVarietyGain(7, recent, 'trance');
    expect(syro).toBeGreaterThan(trance);
  });

  it('stays in 0.97-1.04 range', () => {
    const recent = [0, 2, 4, 6, 8, 10, 12, 14];
    for (let b = 0; b < 16; b++) {
      const gain = accentVarietyGain(b, recent, 'syro');
      expect(gain).toBeGreaterThanOrEqual(0.97);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('varietyDrive', () => {
  it('syro is highest', () => {
    expect(varietyDrive('syro')).toBe(0.55);
  });

  it('trance is low', () => {
    expect(varietyDrive('trance')).toBe(0.15);
  });
});
