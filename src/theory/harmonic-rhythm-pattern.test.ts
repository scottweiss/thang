import { describe, it, expect } from 'vitest';
import {
  selectHarmonicRhythm,
  harmonicRhythmMultiplier,
  shouldApplyHarmonicRhythm,
  harmonicRhythmTendency,
} from './harmonic-rhythm-pattern';

describe('selectHarmonicRhythm', () => {
  it('build prefers accelerando or quick-quick-slow', () => {
    const pattern = selectHarmonicRhythm('build', 'lofi', 0);
    expect(['accelerando', 'quick-quick-slow']).toContain(pattern);
  });

  it('breakdown prefers long-short or even', () => {
    const pattern = selectHarmonicRhythm('breakdown', 'lofi', 0);
    expect(['long-short', 'even']).toContain(pattern);
  });

  it('ambient always returns even (low tendency)', () => {
    expect(selectHarmonicRhythm('build', 'ambient', 0)).toBe('even');
    expect(selectHarmonicRhythm('peak', 'ambient', 0)).toBe('even');
  });

  it('rotates patterns over time', () => {
    const patterns = new Set<string>();
    for (let tick = 0; tick < 20; tick++) {
      patterns.add(selectHarmonicRhythm('build', 'lofi', tick));
    }
    expect(patterns.size).toBeGreaterThan(1);
  });
});

describe('harmonicRhythmMultiplier', () => {
  it('quick-quick-slow: first two are fast, third is slow', () => {
    const q1 = harmonicRhythmMultiplier('quick-quick-slow', 0, 'lofi');
    const q2 = harmonicRhythmMultiplier('quick-quick-slow', 1, 'lofi');
    const slow = harmonicRhythmMultiplier('quick-quick-slow', 2, 'lofi');
    expect(q1).toBeLessThan(1.0);
    expect(q2).toBeLessThan(1.0);
    expect(slow).toBeGreaterThan(1.0);
  });

  it('long-short: alternates long and short', () => {
    const long = harmonicRhythmMultiplier('long-short', 0, 'lofi');
    const short = harmonicRhythmMultiplier('long-short', 1, 'lofi');
    expect(long).toBeGreaterThan(1.0);
    expect(short).toBeLessThan(1.0);
  });

  it('accelerando: progressively faster over 4 chords', () => {
    const m0 = harmonicRhythmMultiplier('accelerando', 0, 'lofi');
    const m1 = harmonicRhythmMultiplier('accelerando', 1, 'lofi');
    const m2 = harmonicRhythmMultiplier('accelerando', 2, 'lofi');
    const m3 = harmonicRhythmMultiplier('accelerando', 3, 'lofi');
    expect(m0).toBeGreaterThan(m1);
    expect(m1).toBeGreaterThan(m2);
    expect(m2).toBeGreaterThan(m3);
  });

  it('even returns 1.0', () => {
    expect(harmonicRhythmMultiplier('even', 0, 'lofi')).toBe(1.0);
    expect(harmonicRhythmMultiplier('even', 5, 'lofi')).toBe(1.0);
  });

  it('patterns cycle after their period', () => {
    const qqs0 = harmonicRhythmMultiplier('quick-quick-slow', 0, 'lofi');
    const qqs3 = harmonicRhythmMultiplier('quick-quick-slow', 3, 'lofi');
    expect(qqs0).toBe(qqs3); // period 3
  });

  it('trance has minimal effect (low tendency)', () => {
    const q = harmonicRhythmMultiplier('quick-quick-slow', 0, 'trance');
    const s = harmonicRhythmMultiplier('quick-quick-slow', 2, 'trance');
    expect(Math.abs(q - s)).toBeLessThan(0.15);
  });

  it('stays within safe range (0.5-1.6)', () => {
    const patterns = ['quick-quick-slow', 'long-short', 'accelerando', 'even'] as const;
    const moods = ['lofi', 'trance', 'syro', 'avril'] as const;
    for (const p of patterns) {
      for (const m of moods) {
        for (let i = 0; i < 5; i++) {
          const mult = harmonicRhythmMultiplier(p, i, m);
          expect(mult).toBeGreaterThanOrEqual(0.5);
          expect(mult).toBeLessThanOrEqual(1.6);
        }
      }
    }
  });
});

describe('shouldApplyHarmonicRhythm', () => {
  it('lofi applies', () => {
    expect(shouldApplyHarmonicRhythm('lofi')).toBe(true);
  });

  it('ambient applies (exactly 0.10 threshold)', () => {
    expect(shouldApplyHarmonicRhythm('ambient')).toBe(true);
  });
});

describe('harmonicRhythmTendency', () => {
  it('syro is highest', () => {
    expect(harmonicRhythmTendency('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(harmonicRhythmTendency('ambient')).toBe(0.10);
  });
});
