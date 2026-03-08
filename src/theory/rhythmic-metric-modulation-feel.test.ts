import { describe, it, expect } from 'vitest';
import {
  metricModulationFeelGain,
  modulationStrengthValue,
} from './rhythmic-metric-modulation-feel';

describe('metricModulationFeelGain', () => {
  it('modulation position gets accent in active range', () => {
    // Position 0, progress 0.5 (mid-section)
    const gain = metricModulationFeelGain(0, 0, 0.5, 'syro', 'build');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('outside active range is neutral', () => {
    const gain = metricModulationFeelGain(0, 0, 0.1, 'syro', 'build');
    expect(gain).toBe(1.0);
  });

  it('after active range is neutral', () => {
    const gain = metricModulationFeelGain(0, 0, 0.8, 'syro', 'build');
    expect(gain).toBe(1.0);
  });

  it('modulation ratio evolves with tick', () => {
    const values = new Set<string>();
    for (let t = 0; t < 8; t++) {
      values.add(metricModulationFeelGain(3, t, 0.5, 'syro', 'build').toFixed(4));
    }
    expect(values.size).toBeGreaterThan(1);
  });

  it('syro modulates more than ambient', () => {
    const sy = metricModulationFeelGain(0, 0, 0.5, 'syro', 'groove');
    const amb = metricModulationFeelGain(0, 0, 0.5, 'ambient', 'groove');
    expect(sy).toBeGreaterThanOrEqual(amb);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let p = 0; p < 16; p++) {
      for (let t = 0; t < 10; t++) {
        const gain = metricModulationFeelGain(p, t, 0.5, 'syro', 'groove');
        expect(gain).toBeGreaterThanOrEqual(1.0);
        expect(gain).toBeLessThanOrEqual(1.04);
      }
    }
  });
});

describe('modulationStrengthValue', () => {
  it('syro is highest', () => {
    expect(modulationStrengthValue('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(modulationStrengthValue('ambient')).toBe(0.05);
  });
});
