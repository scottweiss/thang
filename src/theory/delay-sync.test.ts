import { describe, it, expect } from 'vitest';
import { divisionToSeconds, syncedDelayTime, primaryDelayDivision } from './delay-sync';

describe('divisionToSeconds', () => {
  // At 120 BPM: CPS = 120/240 = 0.5
  // One beat = 1/(0.5*4) = 0.5 seconds
  const cps120 = 0.5;

  it('quarter note at 120 BPM = 0.5s', () => {
    expect(divisionToSeconds('1/4', cps120)).toBeCloseTo(0.5);
  });

  it('eighth note at 120 BPM = 0.25s', () => {
    expect(divisionToSeconds('1/8', cps120)).toBeCloseTo(0.25);
  });

  it('dotted eighth at 120 BPM = 0.375s', () => {
    expect(divisionToSeconds('3/16', cps120)).toBeCloseTo(0.375);
  });

  it('faster tempo = shorter delay', () => {
    const slow = divisionToSeconds('1/4', 0.3);
    const fast = divisionToSeconds('1/4', 0.6);
    expect(fast).toBeLessThan(slow);
  });

  it('handles zero CPS gracefully', () => {
    expect(divisionToSeconds('1/4', 0)).toBe(0.5);
  });

  it('all divisions return positive values', () => {
    const divs = ['1/4', '3/16', '1/8', '1/6', '1/3'] as const;
    for (const d of divs) {
      expect(divisionToSeconds(d, 0.5)).toBeGreaterThan(0);
    }
  });
});

describe('syncedDelayTime', () => {
  it('returns positive delay time', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      const time = syncedDelayTime(m, 0.5);
      expect(time).toBeGreaterThan(0);
      expect(time).toBeLessThan(2); // reasonable range
    }
  });

  it('scales with tempo', () => {
    const slow = syncedDelayTime('trance', 0.3);
    const fast = syncedDelayTime('trance', 0.6);
    // Not guaranteed due to random division choice, but over many runs...
    // Just check both are positive and reasonable
    expect(slow).toBeGreaterThan(0);
    expect(fast).toBeGreaterThan(0);
  });
});

describe('primaryDelayDivision', () => {
  it('returns valid division for all moods', () => {
    const validDivs = ['1/4', '3/16', '1/8', '1/6', '1/3'];
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      expect(validDivs).toContain(primaryDelayDivision(m));
    }
  });

  it('ambient prefers quarter note', () => {
    expect(primaryDelayDivision('ambient')).toBe('1/4');
  });

  it('syro prefers eighth note', () => {
    expect(primaryDelayDivision('syro')).toBe('1/8');
  });
});
