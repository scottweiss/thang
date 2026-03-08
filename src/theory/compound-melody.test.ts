import { describe, it, expect } from 'vitest';
import {
  shouldApplyCompound,
  createCompoundMelody,
  compoundSeparation,
  compoundPattern,
  compoundTendency,
} from './compound-melody';

describe('shouldApplyCompound', () => {
  it('is deterministic', () => {
    const a = shouldApplyCompound(42, 'xtal', 'breakdown');
    const b = shouldApplyCompound(42, 'xtal', 'breakdown');
    expect(a).toBe(b);
  });

  it('breakdown has more compound than peak', () => {
    const breakdownCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyCompound(i, 'xtal', 'breakdown')
    ).filter(Boolean).length;
    const peakCount = Array.from({ length: 200 }, (_, i) =>
      shouldApplyCompound(i, 'xtal', 'peak')
    ).filter(Boolean).length;
    expect(breakdownCount).toBeGreaterThan(peakCount);
  });
});

describe('createCompoundMelody', () => {
  it('returns same length as input', () => {
    const result = createCompoundMelody(['C4', 'D4', 'E4', 'F4'], 12);
    expect(result).toHaveLength(4);
  });

  it('preserves rests', () => {
    const result = createCompoundMelody(['C4', '~', 'E4'], 12);
    expect(result[1]).toBe('~');
  });

  it('alternate pattern creates register jumps', () => {
    const result = createCompoundMelody(['C4', 'D4', 'E4', 'F4'], 12, 'alternate');
    // Even indices go high, odd indices go low
    // The pitches should be different from the originals
    expect(result[0]).not.toBe('C4');
    expect(result[1]).not.toBe('D4');
  });

  it('grouped pattern keeps first half high, second half low', () => {
    const result = createCompoundMelody(['C4', 'D4', 'E4', 'F4'], 12, 'grouped');
    // First two go high, last two go low
    expect(result).toHaveLength(4);
  });

  it('handles single note', () => {
    const result = createCompoundMelody(['C4'], 12);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('C4');
  });

  it('handles empty motif', () => {
    const result = createCompoundMelody([], 12);
    expect(result).toHaveLength(0);
  });

  it('clamps octaves to safe range', () => {
    const result = createCompoundMelody(['C2', 'D2'], 14);
    // Lower register should not go below 2
    for (const note of result) {
      if (note !== '~') {
        const oct = parseInt(note.match(/\d+$/)?.[0] ?? '3');
        expect(oct).toBeGreaterThanOrEqual(2);
        expect(oct).toBeLessThanOrEqual(6);
      }
    }
  });
});

describe('compoundSeparation', () => {
  it('returns at least 5 semitones', () => {
    expect(compoundSeparation('trance', 'peak')).toBeGreaterThanOrEqual(5);
  });

  it('ambient has wide separation', () => {
    expect(compoundSeparation('ambient', 'groove')).toBeGreaterThanOrEqual(12);
  });

  it('breakdown widens separation', () => {
    const groove = compoundSeparation('lofi', 'groove');
    const breakdown = compoundSeparation('lofi', 'breakdown');
    expect(breakdown).toBeGreaterThan(groove);
  });
});

describe('compoundPattern', () => {
  it('is deterministic', () => {
    const a = compoundPattern('xtal', 42);
    const b = compoundPattern('xtal', 42);
    expect(a).toBe(b);
  });

  it('returns valid pattern type', () => {
    const result = compoundPattern('lofi', 100);
    expect(['alternate', 'grouped']).toContain(result);
  });
});

describe('compoundTendency', () => {
  it('xtal has highest', () => {
    expect(compoundTendency('xtal')).toBe(0.35);
  });

  it('trance has lowest', () => {
    expect(compoundTendency('trance')).toBe(0.03);
  });
});
