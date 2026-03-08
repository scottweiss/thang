import { describe, it, expect } from 'vitest';
import {
  updateEntrainment,
  shouldBreakPattern,
  reengagementGain,
  entrainmentRate,
  plateauThreshold,
} from './loop-engagement-cycle';

describe('updateEntrainment', () => {
  it('increases with repetitions', () => {
    const after1 = updateEntrainment(0, 1, 'trance', 'peak');
    const after4 = updateEntrainment(0, 4, 'trance', 'peak');
    expect(after4).toBeGreaterThan(after1);
  });

  it('faster buildup for syro than trance', () => {
    const syro = updateEntrainment(0, 3, 'syro', 'peak');
    const trance = updateEntrainment(0, 3, 'trance', 'peak');
    expect(syro).toBeGreaterThan(trance);
  });

  it('capped at 1', () => {
    expect(updateEntrainment(0.95, 10, 'syro', 'peak')).toBeLessThanOrEqual(1);
  });

  it('slower during breakdowns', () => {
    const peak = updateEntrainment(0, 3, 'lofi', 'peak');
    const bd = updateEntrainment(0, 3, 'lofi', 'breakdown');
    expect(peak).toBeGreaterThan(bd);
  });
});

describe('shouldBreakPattern', () => {
  it('false at low entrainment', () => {
    expect(shouldBreakPattern(0.3, 'trance')).toBe(false);
  });

  it('true above plateau for syro', () => {
    expect(shouldBreakPattern(0.65, 'syro')).toBe(true);
  });

  it('false at same level for trance (higher threshold)', () => {
    expect(shouldBreakPattern(0.65, 'trance')).toBe(false);
  });

  it('true above plateau for trance', () => {
    expect(shouldBreakPattern(0.90, 'trance')).toBe(true);
  });
});

describe('reengagementGain', () => {
  it('1.0 immediately after break (tick 0)', () => {
    expect(reengagementGain(0, 'lofi')).toBe(1.0);
  });

  it('> 1.0 at tick 1', () => {
    expect(reengagementGain(1, 'syro')).toBeGreaterThan(1.0);
  });

  it('decays back to 1.0 after 5+ ticks', () => {
    expect(reengagementGain(5, 'syro')).toBe(1.0);
  });

  it('boost capped at 1.10', () => {
    expect(reengagementGain(1, 'syro')).toBeLessThanOrEqual(1.10);
  });
});

describe('entrainmentRate', () => {
  it('syro is fastest', () => {
    expect(entrainmentRate('syro')).toBe(0.30);
  });

  it('ambient is slowest', () => {
    expect(entrainmentRate('ambient')).toBe(0.05);
  });
});

describe('plateauThreshold', () => {
  it('ambient is highest (rarely break)', () => {
    expect(plateauThreshold('ambient')).toBe(0.90);
  });

  it('syro is lowest (break early)', () => {
    expect(plateauThreshold('syro')).toBe(0.60);
  });
});
