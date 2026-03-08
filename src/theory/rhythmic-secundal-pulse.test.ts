import { describe, it, expect } from 'vitest';
import {
  secundalPulseGain,
  pulseStrengthValue,
} from './rhythmic-secundal-pulse';

describe('secundalPulseGain', () => {
  it('pulse position gets accent', () => {
    const gain = secundalPulseGain(0, 0, 'disco', 'groove');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-pulse is neutral', () => {
    // tick=0 → period=5, position 1 not divisible by 5
    const gain = secundalPulseGain(1, 0, 'disco', 'groove');
    expect(gain).toBe(1.0);
  });

  it('pulse period evolves with tick', () => {
    const values = new Set<string>();
    for (let t = 0; t < 15; t++) {
      values.add(secundalPulseGain(5, t, 'disco', 'groove').toFixed(4));
    }
    expect(values.size).toBeGreaterThan(1);
  });

  it('disco pulses more than ambient', () => {
    let discoSum = 0;
    let ambSum = 0;
    for (let p = 0; p < 16; p++) {
      discoSum += secundalPulseGain(p, 0, 'disco', 'groove');
      ambSum += secundalPulseGain(p, 0, 'ambient', 'groove');
    }
    expect(discoSum).toBeGreaterThan(ambSum);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let t = 0; t < 20; t++) {
      for (let p = 0; p < 16; p++) {
        const gain = secundalPulseGain(p, t, 'disco', 'groove');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('pulseStrengthValue', () => {
  it('disco is highest', () => {
    expect(pulseStrengthValue('disco')).toBe(0.55);
  });

  it('ambient is moderate', () => {
    expect(pulseStrengthValue('ambient')).toBe(0.20);
  });
});
