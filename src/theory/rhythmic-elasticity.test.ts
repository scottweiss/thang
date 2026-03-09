import { describe, it, expect } from 'vitest';
import {
  elasticTempoMultiplier,
  elasticLateOffset,
  shouldApplyElasticity,
  moodElasticity,
} from './rhythmic-elasticity';

describe('elasticTempoMultiplier', () => {
  it('neutral tension = no change', () => {
    const mult = elasticTempoMultiplier(0.5, 'lofi', 'groove');
    expect(mult).toBeCloseTo(1.0, 2);
  });

  it('high tension = slower', () => {
    const mult = elasticTempoMultiplier(0.9, 'lofi', 'groove');
    expect(mult).toBeLessThan(1.0);
  });

  it('low tension = faster', () => {
    const mult = elasticTempoMultiplier(0.1, 'lofi', 'groove');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('trance barely changes', () => {
    const mult = elasticTempoMultiplier(0.9, 'trance', 'groove');
    expect(Math.abs(mult - 1.0)).toBeLessThan(0.02);
  });

  it('lofi changes more', () => {
    const lofi = elasticTempoMultiplier(0.9, 'lofi', 'breakdown');
    const trance = elasticTempoMultiplier(0.9, 'trance', 'breakdown');
    expect(Math.abs(lofi - 1.0)).toBeGreaterThan(Math.abs(trance - 1.0));
  });
});

describe('elasticLateOffset', () => {
  it('zero at low tension', () => {
    expect(elasticLateOffset(0.3, 'lofi', 'groove')).toBe(0);
  });

  it('positive at high tension', () => {
    const offset = elasticLateOffset(0.8, 'lofi', 'groove');
    expect(offset).toBeGreaterThan(0);
  });

  it('increases with tension', () => {
    const mid = elasticLateOffset(0.6, 'lofi', 'groove');
    const high = elasticLateOffset(0.9, 'lofi', 'groove');
    expect(high).toBeGreaterThan(mid);
  });

  it('ambient stretches most', () => {
    const ambient = elasticLateOffset(0.8, 'ambient', 'breakdown');
    const trance = elasticLateOffset(0.8, 'trance', 'breakdown');
    expect(ambient).toBeGreaterThan(trance);
  });
});

describe('shouldApplyElasticity', () => {
  it('lofi in groove applies', () => {
    expect(shouldApplyElasticity('lofi', 'groove')).toBe(true);
  });

  it('trance in peak may not apply', () => {
    // trance 0.02 * peak 0.5 = 0.01 < 0.03
    expect(shouldApplyElasticity('trance', 'peak')).toBe(false);
  });
});

describe('moodElasticity', () => {
  it('ambient is highest', () => {
    expect(moodElasticity('ambient')).toBe(0.05);
  });

  it('trance is lowest', () => {
    expect(moodElasticity('trance')).toBe(0.01);
  });
});
