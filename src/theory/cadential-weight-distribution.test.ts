import { describe, it, expect } from 'vitest';
import {
  cadentialWeight,
  cadentialSustain,
  cadentialWeightStrength,
} from './cadential-weight-distribution';

describe('cadentialWeight', () => {
  it('high at phrase start', () => {
    const start = cadentialWeight(0, 'avril');
    const mid = cadentialWeight(0.5, 'avril');
    expect(start).toBeGreaterThan(mid);
  });

  it('high at phrase end', () => {
    const end = cadentialWeight(1.0, 'avril');
    const mid = cadentialWeight(0.5, 'avril');
    expect(end).toBeGreaterThan(mid);
  });

  it('stays in 0.85-1.2 range', () => {
    for (let p = 0; p <= 1.0; p += 0.1) {
      const w = cadentialWeight(p, 'ambient');
      expect(w).toBeGreaterThanOrEqual(0.85);
      expect(w).toBeLessThanOrEqual(1.2);
    }
  });

  it('avril has more variation than syro', () => {
    const avrilRange = cadentialWeight(0, 'avril') - cadentialWeight(0.5, 'avril');
    const syroRange = cadentialWeight(0, 'syro') - cadentialWeight(0.5, 'syro');
    expect(avrilRange).toBeGreaterThan(syroRange);
  });
});

describe('cadentialSustain', () => {
  it('more sustain at phrase end', () => {
    const end = cadentialSustain(1.0, 'avril');
    const start = cadentialSustain(0, 'avril');
    expect(end).toBeGreaterThan(start);
  });

  it('stays in 0.8-1.4 range', () => {
    const sus = cadentialSustain(1.0, 'avril');
    expect(sus).toBeGreaterThanOrEqual(0.8);
    expect(sus).toBeLessThanOrEqual(1.4);
  });
});

describe('cadentialWeightStrength', () => {
  it('avril is highest', () => {
    expect(cadentialWeightStrength('avril')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(cadentialWeightStrength('syro')).toBe(0.15);
  });
});
