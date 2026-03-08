import { describe, it, expect } from 'vitest';
import {
  plagalEnrichmentFm,
  plagalDepthValue,
} from './harmonic-plagal-enrichment';

describe('plagalEnrichmentFm', () => {
  it('IV→I gets enrichment', () => {
    const fm = plagalEnrichmentFm(4, 1, 'ambient', 'breakdown');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('non-tonic resolution is neutral', () => {
    const fm = plagalEnrichmentFm(4, 5, 'ambient', 'peak');
    expect(fm).toBe(1.0);
  });

  it('IV→I stronger than ii→I', () => {
    const plagal = plagalEnrichmentFm(4, 1, 'ambient', 'peak');
    const ii = plagalEnrichmentFm(2, 1, 'ambient', 'peak');
    expect(plagal).toBeGreaterThan(ii);
  });

  it('bVII→I gets moderate enrichment', () => {
    const fm = plagalEnrichmentFm(7, 1, 'ambient', 'peak');
    expect(fm).toBeGreaterThan(1.0);
    const plagal = plagalEnrichmentFm(4, 1, 'ambient', 'peak');
    expect(plagal).toBeGreaterThan(fm);
  });

  it('ambient enriches more than syro', () => {
    const amb = plagalEnrichmentFm(4, 1, 'ambient', 'peak');
    const sy = plagalEnrichmentFm(4, 1, 'syro', 'peak');
    expect(amb).toBeGreaterThan(sy);
  });

  it('stays in 1.0-1.05 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const s of sections) {
      for (let d = 1; d <= 7; d++) {
        const fm = plagalEnrichmentFm(d, 1, 'ambient', s);
        expect(fm).toBeGreaterThanOrEqual(1.0);
        expect(fm).toBeLessThanOrEqual(1.05);
      }
    }
  });
});

describe('plagalDepthValue', () => {
  it('ambient is highest', () => {
    expect(plagalDepthValue('ambient')).toBe(0.50);
  });

  it('syro is lowest', () => {
    expect(plagalDepthValue('syro')).toBe(0.15);
  });
});
