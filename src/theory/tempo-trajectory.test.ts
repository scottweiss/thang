import { describe, it, expect } from 'vitest';
import { tempoTrajectoryMultiplier, moodTempoSensitivity } from './tempo-trajectory';

describe('tempoTrajectoryMultiplier', () => {
  it('returns 1.0 at start of any section', () => {
    expect(tempoTrajectoryMultiplier('build', 0, 'downtempo')).toBeCloseTo(1.0, 3);
  });

  it('builds accelerate', () => {
    const end = tempoTrajectoryMultiplier('build', 1, 'downtempo');
    expect(end).toBeGreaterThan(1.0);
  });

  it('breakdowns decelerate', () => {
    const end = tempoTrajectoryMultiplier('breakdown', 1, 'downtempo');
    expect(end).toBeLessThan(1.0);
  });

  it('peaks are nearly steady', () => {
    const end = tempoTrajectoryMultiplier('peak', 1, 'downtempo');
    expect(Math.abs(end - 1.0)).toBeLessThan(0.02);
  });

  it('ambient has more variation than trance', () => {
    const ambientBuild = tempoTrajectoryMultiplier('build', 1, 'ambient');
    const tranceBuild = tempoTrajectoryMultiplier('build', 1, 'trance');
    // Both accelerate, but ambient more so
    expect(ambientBuild - 1.0).toBeGreaterThan(tranceBuild - 1.0);
  });

  it('progress interpolates smoothly', () => {
    const start = tempoTrajectoryMultiplier('build', 0, 'lofi');
    const mid = tempoTrajectoryMultiplier('build', 0.5, 'lofi');
    const end = tempoTrajectoryMultiplier('build', 1, 'lofi');
    // Build uses ease-in, so mid should be closer to start
    expect(mid).toBeGreaterThanOrEqual(start);
    expect(mid).toBeLessThanOrEqual(end);
  });

  it('stays within reasonable bounds', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    const moods = ['ambient', 'trance', 'syro', 'lofi'] as const;
    for (const s of sections) {
      for (const m of moods) {
        for (let p = 0; p <= 1; p += 0.1) {
          const mult = tempoTrajectoryMultiplier(s, p, m);
          expect(mult).toBeGreaterThan(0.93);
          expect(mult).toBeLessThan(1.07);
        }
      }
    }
  });
});

describe('moodTempoSensitivity', () => {
  it('ambient is most flexible', () => {
    expect(moodTempoSensitivity('ambient')).toBeGreaterThan(moodTempoSensitivity('trance'));
  });

  it('all moods return positive values', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      expect(moodTempoSensitivity(m)).toBeGreaterThan(0);
    }
  });
});
