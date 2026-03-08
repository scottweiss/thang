import { describe, it, expect } from 'vitest';
import {
  cadenceTimingGain,
  cadenceStrictness,
} from './phrase-cadence-timing';

describe('cadenceTimingGain', () => {
  it('downbeat gets highest boost', () => {
    const downbeat = cadenceTimingGain(0, 'trance');
    const offbeat = cadenceTimingGain(1, 'trance');
    expect(downbeat).toBeGreaterThan(offbeat);
  });

  it('beat 3 is strong', () => {
    const beat3 = cadenceTimingGain(8, 'avril');
    expect(beat3).toBeGreaterThan(1.0);
  });

  it('sixteenth note position is weak', () => {
    const sixteenth = cadenceTimingGain(1, 'trance');
    expect(sixteenth).toBeLessThan(1.0);
  });

  it('trance is stricter than ambient', () => {
    const tranceDown = cadenceTimingGain(0, 'trance');
    const ambientDown = cadenceTimingGain(0, 'ambient');
    expect(tranceDown).toBeGreaterThan(ambientDown);
  });

  it('stays in 0.92-1.10 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = cadenceTimingGain(p, 'trance');
      expect(gain).toBeGreaterThanOrEqual(0.92);
      expect(gain).toBeLessThanOrEqual(1.10);
    }
  });
});

describe('cadenceStrictness', () => {
  it('trance is highest', () => {
    expect(cadenceStrictness('trance')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(cadenceStrictness('syro')).toBe(0.15);
  });
});
