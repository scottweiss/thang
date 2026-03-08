import { describe, it, expect } from 'vitest';
import {
  shouldChainSuspension,
  suspensionSustainMul,
  suspensionInterval,
  suspensionChainTendency,
} from './harmonic-suspension-flow';

describe('shouldChainSuspension', () => {
  it('ambient triggers more than trance', () => {
    let ambientCount = 0, tranceCount = 0;
    for (let t = 0; t < 100; t++) {
      if (shouldChainSuspension(t, 'ambient', 'breakdown')) ambientCount++;
      if (shouldChainSuspension(t, 'trance', 'breakdown')) tranceCount++;
    }
    expect(ambientCount).toBeGreaterThan(tranceCount);
  });

  it('breakdown triggers more than peak', () => {
    let breakCount = 0, peakCount = 0;
    for (let t = 0; t < 100; t++) {
      if (shouldChainSuspension(t, 'avril', 'breakdown')) breakCount++;
      if (shouldChainSuspension(t, 'avril', 'peak')) peakCount++;
    }
    expect(breakCount).toBeGreaterThan(peakCount);
  });
});

describe('suspensionSustainMul', () => {
  it('ambient breakdown gives longest sustain', () => {
    const mul = suspensionSustainMul('ambient', 'breakdown');
    expect(mul).toBeGreaterThan(1.5);
  });

  it('disco peak gives shortest sustain', () => {
    const mul = suspensionSustainMul('disco', 'peak');
    expect(mul).toBeCloseTo(1.0, 0);
  });

  it('stays in 1.0-1.8 range', () => {
    const mul = suspensionSustainMul('ambient', 'breakdown');
    expect(mul).toBeGreaterThanOrEqual(1.0);
    expect(mul).toBeLessThanOrEqual(1.8);
  });
});

describe('suspensionInterval', () => {
  it('returns 1 or 2', () => {
    for (let t = 0; t < 20; t++) {
      const interval = suspensionInterval(t);
      expect([1, 2]).toContain(interval);
    }
  });
});

describe('suspensionChainTendency', () => {
  it('ambient is highest', () => {
    expect(suspensionChainTendency('ambient')).toBe(0.60);
  });

  it('disco is low', () => {
    expect(suspensionChainTendency('disco')).toBe(0.10);
  });
});
