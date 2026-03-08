import { describe, it, expect } from 'vitest';
import {
  voicingSpan,
  spectralWidthLpf,
  widthSensitivity,
} from './spectral-width';

describe('voicingSpan', () => {
  it('single note has 0 span', () => {
    expect(voicingSpan([0])).toBe(0);
  });

  it('empty has 0 span', () => {
    expect(voicingSpan([])).toBe(0);
  });

  it('C major triad has span', () => {
    const span = voicingSpan([0, 4, 7]); // C E G
    expect(span).toBe(7);
  });

  it('minor third has span 3', () => {
    expect(voicingSpan([0, 3])).toBe(3);
  });

  it('tritone has span 6', () => {
    expect(voicingSpan([0, 6])).toBe(6);
  });

  it('wide voicing has larger span', () => {
    const tight = voicingSpan([0, 1, 2]); // cluster
    const wide = voicingSpan([0, 4, 7, 11]); // C E G B
    expect(wide).toBeGreaterThan(tight);
  });
});

describe('spectralWidthLpf', () => {
  it('wide voicing gets higher LPF', () => {
    const wide = spectralWidthLpf([0, 4, 7, 11], 'lofi');
    const tight = spectralWidthLpf([0, 1, 2], 'lofi');
    expect(wide).toBeGreaterThan(tight);
  });

  it('stays in 0.9-1.2 range', () => {
    const lpf = spectralWidthLpf([0, 6], 'ambient');
    expect(lpf).toBeGreaterThanOrEqual(0.9);
    expect(lpf).toBeLessThanOrEqual(1.2);
  });

  it('xtal is more sensitive than disco', () => {
    const pcs = [0, 4, 7, 11];
    const xtal = spectralWidthLpf(pcs, 'xtal');
    const disco = spectralWidthLpf(pcs, 'disco');
    expect(xtal).toBeGreaterThan(disco);
  });
});

describe('widthSensitivity', () => {
  it('xtal is highest', () => {
    expect(widthSensitivity('xtal')).toBe(0.55);
  });

  it('disco is low', () => {
    expect(widthSensitivity('disco')).toBe(0.20);
  });
});
