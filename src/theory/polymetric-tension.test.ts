import { describe, it, expect } from 'vitest';
import {
  metricConflict,
  polymetricTension,
  polymetricTolerance,
} from './polymetric-tension';

describe('metricConflict', () => {
  it('same grouping has no conflict', () => {
    expect(metricConflict(4, 4)).toBe(0);
  });

  it('3 vs 4 has conflict', () => {
    const conflict = metricConflict(3, 4);
    expect(conflict).toBeGreaterThan(0);
  });

  it('2 vs 4 has less conflict than 3 vs 4', () => {
    // 2 and 4 align every 4 beats; 3 and 4 align every 12
    const twoFour = metricConflict(2, 4);
    const threeFour = metricConflict(3, 4);
    expect(twoFour).toBeLessThan(threeFour);
  });

  it('stays in 0-1 range', () => {
    for (let a = 2; a <= 7; a++) {
      for (let b = 2; b <= 7; b++) {
        const c = metricConflict(a, b);
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('polymetricTension', () => {
  it('syro generates more tension than trance', () => {
    const syro = polymetricTension(1, 3, 4, 'syro');
    const trance = polymetricTension(1, 3, 4, 'trance');
    expect(syro).toBeGreaterThan(trance);
  });

  it('aligned beats have less tension', () => {
    const aligned = polymetricTension(0, 3, 4, 'syro');
    const misaligned = polymetricTension(1, 3, 4, 'syro');
    expect(aligned).toBeLessThan(misaligned);
  });

  it('stays in 0-0.3 range', () => {
    const t = polymetricTension(1, 3, 5, 'syro');
    expect(t).toBeGreaterThanOrEqual(0);
    expect(t).toBeLessThanOrEqual(0.3);
  });
});

describe('polymetricTolerance', () => {
  it('syro is highest', () => {
    expect(polymetricTolerance('syro')).toBe(0.65);
  });

  it('disco is lowest', () => {
    expect(polymetricTolerance('disco')).toBe(0.10);
  });
});
