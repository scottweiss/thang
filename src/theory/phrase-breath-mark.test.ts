import { describe, it, expect } from 'vitest';
import {
  isBreathMark,
  breathMarkGain,
  shouldApplyBreathMarks,
  breathDepth,
} from './phrase-breath-mark';

describe('isBreathMark', () => {
  it('rest before note is breath mark', () => {
    expect(isBreathMark(['C4', '~', 'E4'], 1)).toBe(true);
  });

  it('rest before rest is not', () => {
    expect(isBreathMark(['C4', '~', '~'], 1)).toBe(false);
  });

  it('note position is not', () => {
    expect(isBreathMark(['C4', 'D4', 'E4'], 1)).toBe(false);
  });

  it('last position is not', () => {
    expect(isBreathMark(['C4', '~'], 1)).toBe(false);
  });

  it('rest at start before note is breath mark', () => {
    expect(isBreathMark(['~', 'C4', 'D4'], 0)).toBe(true);
  });
});

describe('breathMarkGain', () => {
  it('avril has deep breath', () => {
    const gain = breathMarkGain('avril', 'groove');
    expect(gain).toBeLessThan(0.85);
  });

  it('trance has shallow breath', () => {
    const gain = breathMarkGain('trance', 'groove');
    expect(gain).toBeGreaterThan(0.9);
  });

  it('clamped to at least 0.6', () => {
    const gain = breathMarkGain('avril', 'breakdown');
    expect(gain).toBeGreaterThanOrEqual(0.6);
  });

  it('peak reduces breath depth', () => {
    const peak = breathMarkGain('lofi', 'peak');
    const groove = breathMarkGain('lofi', 'groove');
    expect(peak).toBeGreaterThan(groove);
  });
});

describe('shouldApplyBreathMarks', () => {
  it('avril applies', () => {
    expect(shouldApplyBreathMarks('avril')).toBe(true);
  });

  it('trance does not', () => {
    expect(shouldApplyBreathMarks('trance')).toBe(false);
  });
});

describe('breathDepth', () => {
  it('avril is deepest', () => {
    expect(breathDepth('avril')).toBe(0.30);
  });

  it('trance is shallowest', () => {
    expect(breathDepth('trance')).toBe(0.08);
  });
});
