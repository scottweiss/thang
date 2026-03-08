import { describe, it, expect } from 'vitest';
import {
  ensembleBreathMultiplier,
  shouldApplyEnsembleBreath,
  breathDepth,
} from './ensemble-breath';

describe('ensembleBreathMultiplier', () => {
  it('returns ~1.0 at phrase midpoint', () => {
    // At the midpoint of a phrase, the breath should be near neutral
    const mult = ensembleBreathMultiplier(3, 'lofi', 'groove');
    expect(mult).toBeGreaterThan(0.9);
    expect(mult).toBeLessThan(1.15);
  });

  it('is close to 1.0 for trance (low depth)', () => {
    const mult = ensembleBreathMultiplier(0, 'trance', 'peak');
    expect(Math.abs(mult - 1.0)).toBeLessThan(0.05);
  });

  it('varies within a phrase (not constant)', () => {
    const values = new Set<string>();
    for (let tick = 0; tick < 8; tick++) {
      values.add(ensembleBreathMultiplier(tick, 'avril', 'breakdown').toFixed(3));
    }
    expect(values.size).toBeGreaterThan(1);
  });

  it('consequent phrases breathe fuller than antecedent', () => {
    // Phrase length for lofi is 6
    // tick 0-5: antecedent, tick 6-11: consequent
    // Compare at similar positions within each phrase
    const ante = ensembleBreathMultiplier(3, 'lofi', 'groove'); // mid antecedent
    const cons = ensembleBreathMultiplier(9, 'lofi', 'groove'); // mid consequent
    // Consequent should be at least as full (roleBoost = 1.15)
    expect(cons).toBeGreaterThanOrEqual(ante - 0.02);
  });

  it('breakdown has most pronounced breathing', () => {
    const breakdown = ensembleBreathMultiplier(4, 'avril', 'breakdown');
    const peak = ensembleBreathMultiplier(4, 'avril', 'peak');
    // Breakdown has section multiplier 1.0, peak 0.5
    // Both should be >1 at phrase mid, but breakdown more so
    expect(Math.abs(breakdown - 1.0)).toBeGreaterThan(Math.abs(peak - 1.0));
  });

  it('stays in reasonable range (0.85-1.15)', () => {
    const moods = ['lofi', 'trance', 'avril', 'ambient', 'syro'] as const;
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const mood of moods) {
      for (const section of sections) {
        for (let tick = 0; tick < 20; tick++) {
          const mult = ensembleBreathMultiplier(tick, mood, section);
          expect(mult).toBeGreaterThan(0.85);
          expect(mult).toBeLessThan(1.15);
        }
      }
    }
  });
});

describe('shouldApplyEnsembleBreath', () => {
  it('avril applies (high depth)', () => {
    expect(shouldApplyEnsembleBreath('avril')).toBe(true);
  });

  it('trance applies (low but above threshold)', () => {
    expect(shouldApplyEnsembleBreath('trance')).toBe(true);
  });

  it('all moods have depth >= 0.1', () => {
    const moods = ['trance', 'disco', 'syro', 'blockhead', 'downtempo', 'lofi', 'flim', 'xtal', 'avril', 'ambient'] as const;
    for (const mood of moods) {
      expect(shouldApplyEnsembleBreath(mood)).toBe(true);
    }
  });
});

describe('breathDepth', () => {
  it('avril is highest', () => {
    expect(breathDepth('avril')).toBe(0.60);
  });

  it('trance is lowest', () => {
    expect(breathDepth('trance')).toBe(0.15);
  });
});
