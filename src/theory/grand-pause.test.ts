import { describe, it, expect } from 'vitest';
import {
  shouldGrandPause,
  gpDuration,
  shouldFermata,
  applyFermata,
  selectFermataNote,
  gpTendency,
} from './grand-pause';

describe('shouldGrandPause', () => {
  it('is deterministic', () => {
    const a = shouldGrandPause(42, 'trance', 'build', 0.9);
    const b = shouldGrandPause(42, 'trance', 'build', 0.9);
    expect(a).toBe(b);
  });

  it('never triggers before 80% section progress', () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldGrandPause(i, 'trance', 'build', 0.5)).toBe(false);
    }
  });

  it('never triggers in intro', () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldGrandPause(i, 'trance', 'intro', 0.95)).toBe(false);
    }
  });

  it('build has more GP than peak', () => {
    const buildCount = Array.from({ length: 500 }, (_, i) =>
      shouldGrandPause(i, 'trance', 'build', 0.9)
    ).filter(Boolean).length;
    const peakCount = Array.from({ length: 500 }, (_, i) =>
      shouldGrandPause(i, 'trance', 'peak', 0.9)
    ).filter(Boolean).length;
    expect(buildCount).toBeGreaterThan(peakCount);
  });
});

describe('gpDuration', () => {
  it('trance is short', () => {
    expect(gpDuration('trance')).toBe(1);
  });

  it('avril is longer', () => {
    expect(gpDuration('avril')).toBe(2);
  });
});

describe('shouldFermata', () => {
  it('is deterministic', () => {
    const a = shouldFermata(42, 'avril', 'breakdown');
    const b = shouldFermata(42, 'avril', 'breakdown');
    expect(a).toBe(b);
  });

  it('breakdown has more fermata than peak', () => {
    const breakdownCount = Array.from({ length: 1000 }, (_, i) =>
      shouldFermata(i, 'avril', 'breakdown')
    ).filter(Boolean).length;
    const peakCount = Array.from({ length: 1000 }, (_, i) =>
      shouldFermata(i, 'avril', 'peak')
    ).filter(Boolean).length;
    expect(breakdownCount).toBeGreaterThan(peakCount);
  });
});

describe('applyFermata', () => {
  it('extends note into following rests', () => {
    const result = applyFermata(['C4', '~', '~', 'D4'], 0, 2);
    expect(result[0]).toBe('C4');
    expect(result[1]).toBe('C4');
    expect(result[2]).toBe('C4');
    expect(result[3]).toBe('D4'); // preserved
  });

  it('stops at existing notes', () => {
    const result = applyFermata(['C4', 'D4', '~'], 0, 3);
    expect(result[0]).toBe('C4');
    expect(result[1]).toBe('D4'); // not overwritten
  });

  it('handles rest at holdIdx', () => {
    const result = applyFermata(['~', 'C4'], 0, 1);
    expect(result).toEqual(['~', 'C4']);
  });

  it('handles out of bounds', () => {
    const result = applyFermata(['C4'], 5, 1);
    expect(result).toEqual(['C4']);
  });
});

describe('selectFermataNote', () => {
  it('prefers strong beat positions', () => {
    const steps = ['~', '~', '~', '~', 'C4', '~', '~', '~'];
    expect(selectFermataNote(steps)).toBe(4);
  });

  it('falls back to first note', () => {
    const steps = ['~', 'C4', '~', '~'];
    expect(selectFermataNote(steps)).toBe(1);
  });

  it('handles all rests', () => {
    expect(selectFermataNote(['~', '~'])).toBe(-1);
  });
});

describe('gpTendency', () => {
  it('trance has highest', () => {
    expect(gpTendency('trance')).toBe(0.12);
  });

  it('ambient has lowest', () => {
    expect(gpTendency('ambient')).toBe(0.01);
  });
});
