import { describe, it, expect } from 'vitest';
import {
  shouldApplyRhythmicCadence,
  selectCadenceType,
  applyAgogicCadence,
  applyDeceleration,
  applyTerminalRest,
  applyRhythmicRhyme,
  applyRhythmicCadence,
  rhythmicCadenceTendency,
} from './rhythmic-cadence';

describe('shouldApplyRhythmicCadence', () => {
  it('is deterministic', () => {
    const a = shouldApplyRhythmicCadence(42, 'avril', 'breakdown');
    const b = shouldApplyRhythmicCadence(42, 'avril', 'breakdown');
    expect(a).toBe(b);
  });

  it('breakdown has more cadence than peak', () => {
    const breakdownCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyRhythmicCadence(i, 'avril', 'breakdown')
    ).filter(Boolean).length;
    const peakCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyRhythmicCadence(i, 'avril', 'peak')
    ).filter(Boolean).length;
    expect(breakdownCount).toBeGreaterThan(peakCount);
  });
});

describe('selectCadenceType', () => {
  it('is deterministic', () => {
    const a = selectCadenceType('lofi', 42);
    const b = selectCadenceType('lofi', 42);
    expect(a).toBe(b);
  });

  it('returns valid cadence type', () => {
    const result = selectCadenceType('ambient', 100);
    expect(['agogic', 'deceleration', 'terminal', 'rhyme']).toContain(result);
  });
});

describe('applyAgogicCadence', () => {
  it('extends last note into following rest', () => {
    const result = applyAgogicCadence(['C4', 'D4', 'E4', '~', '~']);
    expect(result[2]).toBe('E4');
    expect(result[3]).toBe('E4'); // extended
    expect(result[4]).toBe('~');  // depth=1, only extends one
  });

  it('respects depth parameter', () => {
    const result = applyAgogicCadence(['C4', 'D4', 'E4', '~', '~', '~'], 2);
    expect(result[3]).toBe('E4');
    expect(result[4]).toBe('E4');
  });

  it('handles no trailing rests', () => {
    const result = applyAgogicCadence(['C4', 'D4', 'E4']);
    expect(result).toEqual(['C4', 'D4', 'E4']);
  });

  it('handles all rests', () => {
    const result = applyAgogicCadence(['~', '~', '~']);
    expect(result).toEqual(['~', '~', '~']);
  });
});

describe('applyDeceleration', () => {
  it('thins notes in the last third', () => {
    const steps = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const result = applyDeceleration(steps);
    // Last third should have more rests than original
    const origRests = steps.filter(s => s === '~').length;
    const resultRests = result.filter(s => s === '~').length;
    expect(resultRests).toBeGreaterThan(origRests);
  });

  it('preserves short phrases', () => {
    const result = applyDeceleration(['C4', 'D4', '~']);
    expect(result).toEqual(['C4', 'D4', '~']);
  });
});

describe('applyTerminalRest', () => {
  it('clears last 2 positions', () => {
    const result = applyTerminalRest(['C4', 'D4', 'E4', 'F4', 'G4']);
    expect(result[3]).toBe('~');
    expect(result[4]).toBe('~');
    expect(result[2]).toBe('E4'); // preserved
  });

  it('respects custom rest count', () => {
    const result = applyTerminalRest(['C4', 'D4', 'E4', 'F4'], 1);
    expect(result[3]).toBe('~');
    expect(result[2]).toBe('E4');
  });
});

describe('applyRhythmicRhyme', () => {
  it('mirrors start rhythm at end', () => {
    const steps = ['C4', '~', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const result = applyRhythmicRhyme(steps);
    // End should follow same note/rest pattern as start
    expect(result).toHaveLength(steps.length);
  });

  it('handles short phrase', () => {
    const result = applyRhythmicRhyme(['C4', 'D4']);
    expect(result).toEqual(['C4', 'D4']);
  });
});

describe('applyRhythmicCadence', () => {
  it('dispatches to agogic', () => {
    const result = applyRhythmicCadence(['C4', 'D4', '~', '~'], 'agogic');
    expect(result[2]).toBe('D4'); // extended
  });

  it('dispatches to terminal', () => {
    const result = applyRhythmicCadence(['C4', 'D4', 'E4', 'F4'], 'terminal');
    expect(result[3]).toBe('~');
  });
});

describe('rhythmicCadenceTendency', () => {
  it('avril has highest', () => {
    expect(rhythmicCadenceTendency('avril')).toBe(0.55);
  });

  it('trance has lowest', () => {
    expect(rhythmicCadenceTendency('trance')).toBe(0.10);
  });
});
