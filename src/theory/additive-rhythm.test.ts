import { describe, it, expect } from 'vitest';
import {
  shouldApplyAdditive,
  selectGrouping,
  additiveAccentMask,
  additiveNoteMask,
  applyAdditiveToSteps,
  additiveTendency,
} from './additive-rhythm';

describe('shouldApplyAdditive', () => {
  it('is deterministic', () => {
    const a = shouldApplyAdditive(42, 'syro', 'peak');
    const b = shouldApplyAdditive(42, 'syro', 'peak');
    expect(a).toBe(b);
  });

  it('peak has more additive than intro', () => {
    const peakCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyAdditive(i, 'syro', 'peak')
    ).filter(Boolean).length;
    const introCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyAdditive(i, 'syro', 'intro')
    ).filter(Boolean).length;
    expect(peakCount).toBeGreaterThan(introCount);
  });
});

describe('selectGrouping', () => {
  it('returns grouping summing to 8', () => {
    const grouping = selectGrouping(8, 'lofi', 42);
    expect(grouping.reduce((a, b) => a + b, 0)).toBe(8);
  });

  it('returns grouping summing to 16', () => {
    const grouping = selectGrouping(16, 'syro', 99);
    expect(grouping.reduce((a, b) => a + b, 0)).toBe(16);
  });

  it('is deterministic', () => {
    const a = selectGrouping(8, 'trance', 100);
    const b = selectGrouping(8, 'trance', 100);
    expect(a).toEqual(b);
  });
});

describe('additiveAccentMask', () => {
  it('accents first beat of each group', () => {
    const mask = additiveAccentMask([3, 3, 2], 1.0, 0.5);
    expect(mask).toHaveLength(8);
    expect(mask[0]).toBe(1.0); // beat 1 of group 1
    expect(mask[3]).toBe(1.0); // beat 1 of group 2
    expect(mask[6]).toBe(1.0); // beat 1 of group 3
    expect(mask[1]).toBe(0.5); // unaccented
    expect(mask[2]).toBe(0.5); // unaccented
  });

  it('handles standard 4x2 grouping', () => {
    const mask = additiveAccentMask([2, 2, 2, 2]);
    expect(mask).toHaveLength(8);
    expect(mask[0]).toBe(1.0);
    expect(mask[2]).toBe(1.0);
    expect(mask[4]).toBe(1.0);
    expect(mask[6]).toBe(1.0);
  });
});

describe('additiveNoteMask', () => {
  it('places notes at group boundaries', () => {
    const mask = additiveNoteMask([3, 3, 2]);
    expect(mask).toHaveLength(8);
    expect(mask[0]).toBe(true);
    expect(mask[3]).toBe(true);
    expect(mask[6]).toBe(true);
    expect(mask[1]).toBe(false);
    expect(mask[2]).toBe(false);
  });

  it('adds secondary beat for large groups', () => {
    const mask = additiveNoteMask([5, 3]);
    expect(mask[0]).toBe(true);  // start of group 1
    expect(mask[2]).toBe(true);  // secondary beat at floor(5/2)
    expect(mask[5]).toBe(true);  // start of group 2
  });
});

describe('applyAdditiveToSteps', () => {
  it('keeps notes at group boundaries', () => {
    const steps = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const result = applyAdditiveToSteps(steps, [3, 3, 2]);
    expect(result[0]).toBe('C4'); // kept (group boundary)
    expect(result[3]).toBe('F4'); // kept (group boundary)
    expect(result[6]).toBe('B4'); // kept (group boundary)
    expect(result[1]).toBe('~');  // silenced
    expect(result[2]).toBe('~');  // silenced
  });

  it('preserves existing rests', () => {
    const steps = ['C4', '~', 'E4', '~', 'G4', '~', 'B4', '~'];
    const result = applyAdditiveToSteps(steps, [3, 3, 2]);
    expect(result[1]).toBe('~');
    expect(result[3]).toBe('~');
  });

  it('ensures at least one note survives', () => {
    const steps = ['~', 'C4', '~', '~', '~', '~', '~', '~'];
    const result = applyAdditiveToSteps(steps, [3, 3, 2]);
    const hasNote = result.some(s => s !== '~');
    expect(hasNote).toBe(true);
  });
});

describe('additiveTendency', () => {
  it('syro has highest', () => {
    expect(additiveTendency('syro')).toBe(0.40);
  });

  it('ambient has lowest', () => {
    expect(additiveTendency('ambient')).toBe(0.05);
  });
});
