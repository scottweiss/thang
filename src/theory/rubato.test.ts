import { describe, it, expect } from 'vitest';
import { rubatoMultiplier, cadentialRubato } from './rubato';

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

describe('cadentialRubato', () => {
  it('V7 → I causes tempo dip at tick 0', () => {
    const r = cadentialRubato(0, 4, 'dom7', 0, 'avril');
    expect(r).toBeLessThan(1.0);
    expect(r).toBeGreaterThan(0.9); // not extreme
  });

  it('tempo dip decays over ticks', () => {
    const t0 = cadentialRubato(0, 4, 'dom7', 0, 'avril');
    const t1 = cadentialRubato(0, 4, 'dom7', 1, 'avril');
    const t2 = cadentialRubato(0, 4, 'dom7', 2, 'avril');
    expect(t0).toBeLessThan(t1);
    expect(t1).toBeLessThan(t2);
  });

  it('returns 1.0 after tick 3', () => {
    expect(cadentialRubato(0, 4, 'dom7', 4, 'avril')).toBe(1.0);
  });

  it('returns 1.0 for non-arrival', () => {
    expect(cadentialRubato(3, 4, 'dom7', 0, 'avril')).toBe(1.0);
  });

  it('trance has minimal cadential rubato', () => {
    const trance = cadentialRubato(0, 4, 'dom7', 0, 'trance');
    const avril = cadentialRubato(0, 4, 'dom7', 0, 'avril');
    // Both slow down, but trance much less
    expect(1.0 - trance).toBeLessThan(1.0 - avril);
  });

  it('all values are between 0.9 and 1.0', () => {
    const moods = ['ambient', 'trance', 'avril', 'syro', 'disco'] as const;
    for (const mood of moods) {
      for (let t = 0; t <= 4; t++) {
        const r = cadentialRubato(0, 4, 'dom7', t, mood);
        expect(r).toBeGreaterThanOrEqual(0.9);
        expect(r).toBeLessThanOrEqual(1.0);
      }
    }
  });
});
