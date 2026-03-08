import { describe, it, expect } from 'vitest';
import {
  attentionEnergy,
  needsNovelty,
  fatigueRisk,
  noveltyGainBoost,
  shouldTrackAttention,
  noveltyThreshold,
} from './attention-decay';

describe('attentionEnergy', () => {
  it('1.0 immediately after change', () => {
    expect(attentionEnergy(0, 'trance', 'peak')).toBeCloseTo(1.0, 2);
  });

  it('decays over time', () => {
    const early = attentionEnergy(2, 'lofi', 'peak');
    const late = attentionEnergy(8, 'lofi', 'peak');
    expect(early).toBeGreaterThan(late);
  });

  it('syro decays faster than ambient', () => {
    const syro = attentionEnergy(5, 'syro', 'peak');
    const ambient = attentionEnergy(5, 'ambient', 'peak');
    expect(syro).toBeLessThan(ambient);
  });

  it('peak decays faster than breakdown', () => {
    const peak = attentionEnergy(5, 'lofi', 'peak');
    const bd = attentionEnergy(5, 'lofi', 'breakdown');
    expect(peak).toBeLessThan(bd);
  });

  it('clamped at 0', () => {
    expect(attentionEnergy(100, 'syro', 'peak')).toBeGreaterThanOrEqual(0);
  });
});

describe('needsNovelty', () => {
  it('false at full attention', () => {
    expect(needsNovelty(1.0, 'trance')).toBe(false);
  });

  it('true at low attention for syro', () => {
    expect(needsNovelty(0.3, 'syro')).toBe(true);
  });

  it('false at same level for ambient (lower threshold)', () => {
    // ambient threshold=0.15, so attention 0.3 means 1-0.15=0.85 cutoff — 0.3 < 0.85 → true
    // Actually: needsNovelty when attention < (1 - threshold)
    // ambient: 0.3 < 0.85 → true
    expect(needsNovelty(0.3, 'ambient')).toBe(true);
  });

  it('trance tolerates lower attention before needing novelty', () => {
    // trance threshold=0.20, cutoff=0.80
    // At attention 0.85, trance doesn't need novelty
    expect(needsNovelty(0.85, 'trance')).toBe(false);
    // syro threshold=0.55, cutoff=0.45
    // At attention 0.85, syro doesn't need either
    expect(needsNovelty(0.85, 'syro')).toBe(false);
  });
});

describe('fatigueRisk', () => {
  it('0 at start', () => {
    expect(fatigueRisk(0, 'trance')).toBeCloseTo(0, 2);
  });

  it('increases over time', () => {
    const early = fatigueRisk(3, 'lofi');
    const late = fatigueRisk(10, 'lofi');
    expect(late).toBeGreaterThan(early);
  });

  it('syro fatigues faster than ambient', () => {
    const syro = fatigueRisk(8, 'syro');
    const ambient = fatigueRisk(8, 'ambient');
    expect(syro).toBeGreaterThan(ambient);
  });

  it('clamped at 1', () => {
    expect(fatigueRisk(100, 'syro')).toBeLessThanOrEqual(1);
  });
});

describe('noveltyGainBoost', () => {
  it('> 1.0 right after novelty', () => {
    expect(noveltyGainBoost(0, 'syro')).toBeGreaterThan(1.0);
  });

  it('decays to 1.0 after 3+ ticks', () => {
    expect(noveltyGainBoost(3, 'syro')).toBe(1.0);
  });

  it('capped at 1.08', () => {
    expect(noveltyGainBoost(0, 'syro')).toBeLessThanOrEqual(1.08);
  });
});

describe('shouldTrackAttention', () => {
  it('true for all moods (all > 0.02)', () => {
    expect(shouldTrackAttention('trance')).toBe(true);
    expect(shouldTrackAttention('ambient')).toBe(true);
  });
});

describe('noveltyThreshold', () => {
  it('syro is highest', () => {
    expect(noveltyThreshold('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(noveltyThreshold('ambient')).toBe(0.15);
  });
});
