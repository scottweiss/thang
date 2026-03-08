import { describe, it, expect } from 'vitest';
import {
  distanceReverbGain,
  reverbDepthStrength,
} from './harmonic-distance-reverb';

describe('distanceReverbGain', () => {
  it('tonic chord is near neutral or slightly dry', () => {
    const gain = distanceReverbGain('C', 'C', 'ambient');
    expect(gain).toBeLessThanOrEqual(1.0);
  });

  it('distant chord gets more reverb', () => {
    const tonic = distanceReverbGain('C', 'C', 'ambient');
    const distant = distanceReverbGain('Gb', 'C', 'ambient');
    expect(distant).toBeGreaterThan(tonic);
  });

  it('ambient responds more than disco', () => {
    const amb = distanceReverbGain('Gb', 'C', 'ambient');
    const disco = distanceReverbGain('Gb', 'C', 'disco');
    expect(amb).toBeGreaterThan(disco);
  });

  it('fifth is closer than tritone', () => {
    const fifth = distanceReverbGain('G', 'C', 'ambient');
    const tritone = distanceReverbGain('Gb', 'C', 'ambient');
    expect(tritone).toBeGreaterThan(fifth);
  });

  it('stays in 0.95-1.08 range', () => {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Db', 'Eb', 'Gb', 'Ab', 'Bb'];
    for (const r of roots) {
      const gain = distanceReverbGain(r, 'C', 'ambient');
      expect(gain).toBeGreaterThanOrEqual(0.95);
      expect(gain).toBeLessThanOrEqual(1.08);
    }
  });
});

describe('reverbDepthStrength', () => {
  it('ambient is highest', () => {
    expect(reverbDepthStrength('ambient')).toBe(0.60);
  });

  it('disco is lowest', () => {
    expect(reverbDepthStrength('disco')).toBe(0.15);
  });
});
