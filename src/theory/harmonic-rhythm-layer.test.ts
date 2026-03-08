import { describe, it, expect } from 'vitest';
import {
  voiceHarmonicRates,
  shouldBassHold,
  shouldInnerVoiceMove,
  superpositionDensity,
  superpositionStrength,
} from './harmonic-rhythm-layer';

describe('voiceHarmonicRates', () => {
  it('bass is slowest, melody is fastest', () => {
    const rates = voiceHarmonicRates('lofi', 'groove');
    expect(rates.bass).toBeLessThan(rates.inner);
    expect(rates.inner).toBeLessThan(rates.melody);
  });

  it('trance has voices close together', () => {
    const rates = voiceHarmonicRates('trance', 'groove');
    expect(rates.melody - rates.bass).toBeLessThan(0.5);
  });

  it('lofi has voices far apart', () => {
    const rates = voiceHarmonicRates('lofi', 'peak');
    expect(rates.melody - rates.bass).toBeGreaterThan(0.8);
  });

  it('inner is always 1.0', () => {
    expect(voiceHarmonicRates('ambient', 'intro').inner).toBe(1.0);
    expect(voiceHarmonicRates('syro', 'peak').inner).toBe(1.0);
  });

  it('bass never goes below 0.3', () => {
    expect(voiceHarmonicRates('syro', 'peak').bass).toBeGreaterThanOrEqual(0.3);
  });

  it('melody never exceeds 2.0', () => {
    expect(voiceHarmonicRates('syro', 'peak').melody).toBeLessThanOrEqual(2.0);
  });
});

describe('shouldBassHold', () => {
  it('always holds when recently changed', () => {
    expect(shouldBassHold('lofi', 'groove', 0, 42)).toBe(true);
  });

  it('eventually releases after enough ticks', () => {
    // With enough ticks, bass should sometimes not hold
    let released = false;
    for (let t = 0; t < 100; t++) {
      if (!shouldBassHold('trance', 'groove', 10, t)) {
        released = true;
        break;
      }
    }
    expect(released).toBe(true);
  });
});

describe('shouldInnerVoiceMove', () => {
  it('never moves for trance (low strength)', () => {
    let moved = false;
    for (let t = 0; t < 50; t++) {
      if (shouldInnerVoiceMove('trance', 'groove', t)) {
        moved = true;
        break;
      }
    }
    // trance strength 0.10 * 1.0 = 0.10, below 0.15 threshold
    expect(moved).toBe(false);
  });

  it('sometimes moves for lofi', () => {
    let moved = false;
    for (let t = 0; t < 50; t++) {
      if (shouldInnerVoiceMove('lofi', 'peak', t)) {
        moved = true;
        break;
      }
    }
    expect(moved).toBe(true);
  });
});

describe('superpositionDensity', () => {
  it('lofi peak is high', () => {
    expect(superpositionDensity('lofi', 'peak')).toBeGreaterThan(0.5);
  });

  it('trance intro is low', () => {
    expect(superpositionDensity('trance', 'intro')).toBeLessThan(0.15);
  });
});

describe('superpositionStrength', () => {
  it('syro is highest', () => {
    expect(superpositionStrength('syro')).toBe(0.55);
  });

  it('trance is lowest', () => {
    expect(superpositionStrength('trance')).toBe(0.10);
  });
});
