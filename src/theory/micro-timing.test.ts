import { describe, it, expect } from 'vitest';
import { generateNudgePattern, shouldApplyMicroTiming, getTimingCharacter } from './micro-timing';

describe('generateNudgePattern', () => {
  it('returns space-separated numbers', () => {
    const pattern = generateNudgePattern('downtempo', 'groove', 8);
    const values = pattern.split(' ');
    expect(values.length).toBe(8);
    values.forEach(v => expect(parseFloat(v)).not.toBeNaN());
  });

  it('returns "0" for zero steps', () => {
    expect(generateNudgePattern('lofi', 'peak', 0)).toBe('0');
  });

  it('lofi has positive bias (lazy/behind beat)', () => {
    const pattern = generateNudgePattern('lofi', 'groove', 32, 99);
    const values = pattern.split(' ').map(parseFloat);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    expect(avg).toBeGreaterThan(0); // positive = behind beat
  });

  it('trance has negative bias (pushing/ahead)', () => {
    const pattern = generateNudgePattern('trance', 'groove', 32, 99);
    const values = pattern.split(' ').map(parseFloat);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    expect(avg).toBeLessThan(0); // negative = ahead of beat
  });

  it('peak section produces smaller offsets than breakdown', () => {
    const peakPattern = generateNudgePattern('downtempo', 'peak', 16, 42);
    const breakdownPattern = generateNudgePattern('downtempo', 'breakdown', 16, 42);
    const peakMax = Math.max(...peakPattern.split(' ').map(v => Math.abs(parseFloat(v))));
    const breakdownMax = Math.max(...breakdownPattern.split(' ').map(v => Math.abs(parseFloat(v))));
    expect(peakMax).toBeLessThan(breakdownMax);
  });

  it('is deterministic with same seed', () => {
    const a = generateNudgePattern('ambient', 'intro', 8, 123);
    const b = generateNudgePattern('ambient', 'intro', 8, 123);
    expect(a).toBe(b);
  });

  it('differs with different seeds', () => {
    const a = generateNudgePattern('ambient', 'intro', 8, 1);
    const b = generateNudgePattern('ambient', 'intro', 8, 2);
    expect(a).not.toBe(b);
  });

  it('offsets stay within ±25ms range', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const mood of moods) {
      for (const section of sections) {
        const values = generateNudgePattern(mood, section, 16, 42).split(' ').map(parseFloat);
        values.forEach(v => {
          expect(Math.abs(v)).toBeLessThanOrEqual(0.03); // 30ms hard cap
        });
      }
    }
  });
});

describe('shouldApplyMicroTiming', () => {
  it('returns true for all moods (all >= 0.08)', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      expect(shouldApplyMicroTiming(mood)).toBe(true);
    }
  });
});

describe('getTimingCharacter', () => {
  it('returns lofi with positive bias', () => {
    const char = getTimingCharacter('lofi');
    expect(char.bias).toBeGreaterThan(0);
    expect(char.amount).toBeGreaterThan(0);
  });

  it('returns trance with negative bias', () => {
    const char = getTimingCharacter('trance');
    expect(char.bias).toBeLessThan(0);
  });

  it('returns a copy (not mutable reference)', () => {
    const a = getTimingCharacter('ambient');
    a.bias = 999;
    const b = getTimingCharacter('ambient');
    expect(b.bias).not.toBe(999);
  });
});
