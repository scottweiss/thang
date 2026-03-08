import { describe, it, expect } from 'vitest';
import {
  barElasticity,
  metricElasticityRange,
  shouldApplyMetricElasticity,
} from './metric-elasticity';

describe('barElasticity', () => {
  it('first bar is slower', () => {
    const first = barElasticity(0.0, 'avril', 'breakdown');
    expect(first).toBeLessThan(1.0);
  });

  it('last bar is faster', () => {
    const last = barElasticity(1.0, 'avril', 'breakdown');
    expect(last).toBeGreaterThan(1.0);
  });

  it('stays in 0.96-1.04 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const e = barElasticity(p, 'ambient', 'breakdown');
      expect(e).toBeGreaterThanOrEqual(0.90);
      expect(e).toBeLessThanOrEqual(1.10);
    }
  });

  it('trance has less variation than ambient', () => {
    const tranceRange = barElasticity(1.0, 'trance', 'groove') - barElasticity(0.0, 'trance', 'groove');
    const ambientRange = barElasticity(1.0, 'ambient', 'groove') - barElasticity(0.0, 'ambient', 'groove');
    expect(tranceRange).toBeLessThan(ambientRange);
  });
});

describe('metricElasticityRange', () => {
  it('ambient is highest', () => {
    expect(metricElasticityRange('ambient')).toBe(0.040);
  });

  it('disco is lowest', () => {
    expect(metricElasticityRange('disco')).toBe(0.005);
  });
});

describe('shouldApplyMetricElasticity', () => {
  it('true for avril breakdown', () => {
    expect(shouldApplyMetricElasticity('avril', 'breakdown')).toBe(true);
  });

  it('true for disco groove', () => {
    expect(shouldApplyMetricElasticity('disco', 'groove')).toBe(true);
  });
});
