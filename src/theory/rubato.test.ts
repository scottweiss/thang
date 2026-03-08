import { describe, it, expect } from 'vitest';
import { rubatoMultiplier } from './rubato';

describe('rubatoMultiplier', () => {
  it('builds are faster than breakdowns', () => {
    const build = rubatoMultiplier('downtempo', 'build', 0.5);
    const breakdown = rubatoMultiplier('downtempo', 'breakdown', 0.5);
    expect(build).toBeGreaterThan(breakdown);
  });

  it('high tension is faster than low tension', () => {
    const highT = rubatoMultiplier('lofi', 'groove', 0.9);
    const lowT = rubatoMultiplier('lofi', 'groove', 0.1);
    expect(highT).toBeGreaterThan(lowT);
  });

  it('trance has minimal rubato', () => {
    const build = rubatoMultiplier('trance', 'build', 0.8);
    const breakdown = rubatoMultiplier('trance', 'breakdown', 0.2);
    // Difference should be tiny for trance
    expect(Math.abs(build - breakdown)).toBeLessThan(0.03);
  });

  it('stays within reasonable bounds', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'disco', 'syro'] as const;
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const mood of moods) {
      for (const section of sections) {
        const m = rubatoMultiplier(mood, section, 0.5);
        expect(m).toBeGreaterThanOrEqual(0.92);
        expect(m).toBeLessThanOrEqual(1.08);
      }
    }
  });

  it('neutral at groove with medium tension', () => {
    const m = rubatoMultiplier('downtempo', 'groove', 0.5);
    // Should be close to 1.0
    expect(Math.abs(m - 1.0)).toBeLessThan(0.02);
  });
});
