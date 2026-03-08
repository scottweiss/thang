import { describe, it, expect } from 'vitest';
import {
  tritonePullGain,
  pullStrengthValue,
} from './harmonic-tritone-pull';

describe('tritonePullGain', () => {
  it('dom7 gets pull boost', () => {
    const gain = tritonePullGain('dom7', 2, 'trance', 'build');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('dim gets pull boost', () => {
    const gain = tritonePullGain('dim', 2, 'trance', 'build');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('maj is neutral', () => {
    const gain = tritonePullGain('maj', 2, 'trance', 'build');
    expect(gain).toBe(1.0);
  });

  it('sus4 is neutral', () => {
    const gain = tritonePullGain('sus4', 2, 'trance', 'build');
    expect(gain).toBe(1.0);
  });

  it('pull intensifies over time', () => {
    const early = tritonePullGain('dom7', 1, 'trance', 'build');
    const late = tritonePullGain('dom7', 3, 'trance', 'build');
    expect(late).toBeGreaterThan(early);
  });

  it('trance pulls more than ambient', () => {
    const tr = tritonePullGain('dom7', 3, 'trance', 'build');
    const amb = tritonePullGain('dom7', 3, 'ambient', 'build');
    expect(tr).toBeGreaterThan(amb);
  });

  it('stays in 1.0-1.04 range', () => {
    const qualities = ['dom7', 'dim', 'maj', 'min', 'sus2', 'sus4'];
    for (const q of qualities) {
      for (let t = 0; t <= 5; t++) {
        const gain = tritonePullGain(q, t, 'trance', 'build');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('pullStrengthValue', () => {
  it('trance is highest', () => {
    expect(pullStrengthValue('trance')).toBe(0.50);
  });

  it('ambient is low', () => {
    expect(pullStrengthValue('ambient')).toBe(0.15);
  });
});
