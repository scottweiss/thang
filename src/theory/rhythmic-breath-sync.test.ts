import { describe, it, expect } from 'vitest';
import {
  breathSyncGainPattern,
  shouldApplyBreathSync,
  breathSyncDepth,
  applyBreathSyncToGain,
} from './rhythmic-breath-sync';

describe('breathSyncGainPattern', () => {
  it('returns all 1.0 for ambient in breakdown', () => {
    // ambient=0.05 * breakdown=0.3 = 0.015, below 0.05 threshold
    const pattern = breathSyncGainPattern(8, 'ambient', 'breakdown');
    expect(pattern.every(v => v === 1.0)).toBe(true);
  });

  it('has dips before strong beats for lofi', () => {
    const pattern = breathSyncGainPattern(8, 'lofi', 'groove');
    // Step 7 (before beat 1) and step 3 (before beat 3) should dip
    expect(pattern[7]).toBeLessThan(1.0);
    expect(pattern[3]).toBeLessThan(1.0);
  });

  it('non-breath steps are 1.0', () => {
    const pattern = breathSyncGainPattern(8, 'lofi', 'groove');
    // Steps 0, 1, 2, 4, 5, 6 should be 1.0
    expect(pattern[0]).toBe(1.0);
    expect(pattern[1]).toBe(1.0);
    expect(pattern[4]).toBe(1.0);
  });

  it('16-step pattern has 4 dips', () => {
    const pattern = breathSyncGainPattern(16, 'blockhead', 'groove');
    const dipCount = pattern.filter(v => v < 1.0).length;
    expect(dipCount).toBe(4);
  });

  it('groove section has deeper dips than breakdown', () => {
    const groove = breathSyncGainPattern(8, 'lofi', 'groove');
    const breakdown = breathSyncGainPattern(8, 'lofi', 'breakdown');
    // Groove dips should be deeper (lower value = deeper dip)
    expect(groove[7]).toBeLessThan(breakdown[7]);
  });

  it('values stay within 0.8-1.0', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      const pattern = breathSyncGainPattern(8, m, 'groove');
      pattern.forEach(v => {
        expect(v).toBeGreaterThanOrEqual(0.8);
        expect(v).toBeLessThanOrEqual(1.0);
      });
    }
  });
});

describe('shouldApplyBreathSync', () => {
  it('returns false for ambient', () => {
    expect(shouldApplyBreathSync('ambient')).toBe(false);
  });

  it('returns true for lofi', () => {
    expect(shouldApplyBreathSync('lofi')).toBe(true);
  });
});

describe('breathSyncDepth', () => {
  it('blockhead has highest depth', () => {
    expect(breathSyncDepth('blockhead')).toBe(0.45);
  });

  it('ambient has lowest depth', () => {
    expect(breathSyncDepth('ambient')).toBe(0.05);
  });
});

describe('applyBreathSyncToGain', () => {
  it('modifies gain pattern', () => {
    const original = '0.5000 0.5000 0.5000 0.5000 0.5000 0.5000 0.5000 0.5000';
    const result = applyBreathSyncToGain(original, 'lofi', 'groove');
    const values = result.split(' ').map(Number);
    // Step 7 should be reduced
    expect(values[7]).toBeLessThan(0.5);
    // Step 0 should be unchanged
    expect(values[0]).toBeCloseTo(0.5, 3);
  });
});
