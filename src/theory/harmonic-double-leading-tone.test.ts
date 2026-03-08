import { describe, it, expect } from 'vitest';
import {
  countLeadingTones,
  doubleLeadingToneFm,
  leadingToneDepthValue,
} from './harmonic-double-leading-tone';

describe('countLeadingTones', () => {
  it('B→C is one leading tone', () => {
    expect(countLeadingTones([0], [11])).toBe(1); // B→C
  });

  it('B→C and F#→G is two', () => {
    // C=0,G=7 as targets; B=11,F#=6 as prev
    expect(countLeadingTones([0, 7], [11, 6])).toBe(2);
  });

  it('no chromatic approach returns 0', () => {
    // D=2, G=7, A=9 — none within 1 semitone of C=0, E=4, G=7
    // 2→0=10, 2→4=2, 2→7=5; 7→0=5, 7→4=9, 7→7=0; 9→0=3, 9→4=7, 9→7=10
    expect(countLeadingTones([0, 4, 7], [2, 7, 9])).toBe(0);
  });

  it('caps at 4', () => {
    expect(countLeadingTones([0, 2, 4, 7, 9], [11, 1, 3, 6, 8])).toBeLessThanOrEqual(4);
  });
});

describe('doubleLeadingToneFm', () => {
  it('no leading tones is neutral', () => {
    expect(doubleLeadingToneFm(0, 'avril', 'build')).toBe(1.0);
  });

  it('leading tones enrich FM', () => {
    const fm = doubleLeadingToneFm(2, 'avril', 'build');
    expect(fm).toBeGreaterThan(1.0);
  });

  it('more leading tones = more FM', () => {
    const one = doubleLeadingToneFm(1, 'avril', 'build');
    const three = doubleLeadingToneFm(3, 'avril', 'build');
    expect(three).toBeGreaterThan(one);
  });

  it('avril enriches more than blockhead', () => {
    const av = doubleLeadingToneFm(2, 'avril', 'build');
    const bh = doubleLeadingToneFm(2, 'blockhead', 'build');
    expect(av).toBeGreaterThan(bh);
  });

  it('stays in 1.0-1.05 range', () => {
    for (let c = 0; c <= 5; c++) {
      const fm = doubleLeadingToneFm(c, 'avril', 'build');
      expect(fm).toBeGreaterThanOrEqual(1.0);
      expect(fm).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('leadingToneDepthValue', () => {
  it('avril is highest', () => {
    expect(leadingToneDepthValue('avril')).toBe(0.55);
  });

  it('ambient is low', () => {
    expect(leadingToneDepthValue('ambient')).toBe(0.20);
  });
});
