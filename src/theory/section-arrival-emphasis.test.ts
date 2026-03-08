import { describe, it, expect } from 'vitest';
import {
  arrivalEmphasisGain,
  arrivalEmph,
} from './section-arrival-emphasis';

describe('arrivalEmphasisGain', () => {
  it('section start gets boost', () => {
    const gain = arrivalEmphasisGain(0.01, 'trance');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('mid-section returns 1.0', () => {
    expect(arrivalEmphasisGain(0.5, 'trance')).toBe(1.0);
  });

  it('trance has more emphasis than ambient', () => {
    const trance = arrivalEmphasisGain(0.01, 'trance');
    const amb = arrivalEmphasisGain(0.01, 'ambient');
    expect(trance).toBeGreaterThan(amb);
  });

  it('stays in 1.0-1.10 range', () => {
    for (let t = 0; t <= 1.0; t += 0.05) {
      const gain = arrivalEmphasisGain(t, 'trance');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.10);
    }
  });
});

describe('arrivalEmph', () => {
  it('trance is highest', () => {
    expect(arrivalEmph('trance')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(arrivalEmph('ambient')).toBe(0.15);
  });
});
