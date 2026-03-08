import { describe, it, expect } from 'vitest';
import {
  tensionReleaseGain,
  tensionReleaseFm,
  surgeDepth,
} from './harmonic-tension-release-timing';

describe('tensionReleaseGain', () => {
  it('significant drop gets surge', () => {
    const gain = tensionReleaseGain(0.3, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('small drop is neutral', () => {
    const gain = tensionReleaseGain(0.02, 'avril');
    expect(gain).toBe(1.0);
  });

  it('avril surges more than syro', () => {
    const av = tensionReleaseGain(0.3, 'avril');
    const sy = tensionReleaseGain(0.3, 'syro');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 1.0-1.05 range', () => {
    for (let d = 0; d <= 0.8; d += 0.1) {
      const gain = tensionReleaseGain(d, 'avril');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('tensionReleaseFm', () => {
  it('significant drop gets FM flash', () => {
    const fm = tensionReleaseFm(0.3, 'avril');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('small drop is neutral', () => {
    const fm = tensionReleaseFm(0.02, 'avril');
    expect(fm).toBe(1.0);
  });
});

describe('surgeDepth', () => {
  it('avril is highest', () => {
    expect(surgeDepth('avril')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(surgeDepth('syro')).toBe(0.20);
  });
});
