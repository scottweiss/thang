import { describe, it, expect } from 'vitest';
import { harmonicMomentumMultiplier } from './harmonic-momentum';

describe('harmonicMomentumMultiplier', () => {
  it('build accelerates harmony toward the end', () => {
    const start = harmonicMomentumMultiplier('build', 0);
    const end = harmonicMomentumMultiplier('build', 1);
    expect(end).toBeLessThan(start);
    expect(end).toBeLessThan(1.0); // actually faster
    expect(start).toBeGreaterThan(1.0); // starts slow
  });

  it('peak starts fast then settles', () => {
    const start = harmonicMomentumMultiplier('peak', 0);
    const end = harmonicMomentumMultiplier('peak', 1);
    expect(start).toBeLessThan(end);
    expect(start).toBeLessThan(1.0); // fast at start
  });

  it('breakdown keeps harmony slow', () => {
    const mid = harmonicMomentumMultiplier('breakdown', 0.5);
    expect(mid).toBeGreaterThan(1.0); // slower than base
  });

  it('breakdown picks up slightly at end', () => {
    const mid = harmonicMomentumMultiplier('breakdown', 0.5);
    const end = harmonicMomentumMultiplier('breakdown', 0.9);
    expect(end).toBeLessThan(mid);
  });

  it('groove is consistent with end pickup', () => {
    const mid = harmonicMomentumMultiplier('groove', 0.5);
    const end = harmonicMomentumMultiplier('groove', 0.9);
    expect(end).toBeLessThan(mid);
  });

  it('intro gradually opens up', () => {
    const start = harmonicMomentumMultiplier('intro', 0);
    const end = harmonicMomentumMultiplier('intro', 1);
    expect(end).toBeLessThan(start);
  });

  it('stays within 0.5-1.5 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = harmonicMomentumMultiplier(section, p);
        expect(val).toBeGreaterThanOrEqual(0.5);
        expect(val).toBeLessThanOrEqual(1.5);
      }
    }
  });

  it('clamps progress', () => {
    const normal = harmonicMomentumMultiplier('build', 1.0);
    const clamped = harmonicMomentumMultiplier('build', 2.0);
    expect(clamped).toBeCloseTo(normal, 4);
  });
});
