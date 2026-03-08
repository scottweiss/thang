import { describe, it, expect } from 'vitest';
import { attackMultiplier, decayMultiplier, sustainMultiplier, releaseMultiplier, shouldApplyEnvelopeEvolution } from './envelope-evolution';

describe('attackMultiplier', () => {
  it('build section gets punchier over time', () => {
    const start = attackMultiplier('build', 0);
    const end = attackMultiplier('build', 1);
    expect(end).toBeLessThan(start);
    expect(end).toBeLessThan(1.0); // actually punchy
  });

  it('breakdown section gets softer over time', () => {
    const start = attackMultiplier('breakdown', 0);
    const end = attackMultiplier('breakdown', 1);
    expect(end).toBeGreaterThan(start);
    expect(end).toBeGreaterThan(1.0); // actually softer
  });

  it('peak is punchy and stable', () => {
    const start = attackMultiplier('peak', 0);
    const end = attackMultiplier('peak', 1);
    expect(start).toBeLessThan(1.0);
    expect(Math.abs(end - start)).toBeLessThan(0.1);
  });

  it('stays within 0.7-1.4 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = attackMultiplier(section, p);
        expect(val).toBeGreaterThanOrEqual(0.7);
        expect(val).toBeLessThanOrEqual(1.4);
      }
    }
  });

  it('clamps progress', () => {
    const normal = attackMultiplier('build', 1.0);
    const clamped = attackMultiplier('build', 2.0);
    expect(clamped).toBeCloseTo(normal, 4);
  });
});

describe('decayMultiplier', () => {
  it('build shortens decay over time (percussive energy)', () => {
    const start = decayMultiplier('build', 0);
    const end = decayMultiplier('build', 1);
    expect(end).toBeLessThan(start);
    expect(end).toBeLessThan(1.0); // actually shorter decay
  });

  it('breakdown lengthens decay over time (notes bloom)', () => {
    const start = decayMultiplier('breakdown', 0);
    const end = decayMultiplier('breakdown', 1);
    expect(end).toBeGreaterThan(start);
    expect(end).toBeGreaterThan(1.0); // actually longer decay
  });

  it('peak has short stable decay', () => {
    const start = decayMultiplier('peak', 0);
    const end = decayMultiplier('peak', 1);
    expect(start).toBeLessThan(1.0);
    expect(Math.abs(end - start)).toBeLessThan(0.1);
  });

  it('intro has long decay (atmospheric)', () => {
    const start = decayMultiplier('intro', 0);
    expect(start).toBeGreaterThan(1.0);
  });

  it('stays within 0.7-1.4 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = decayMultiplier(section, p);
        expect(val).toBeGreaterThanOrEqual(0.7);
        expect(val).toBeLessThanOrEqual(1.4);
      }
    }
  });

  it('clamps progress', () => {
    const normal = decayMultiplier('build', 1.0);
    const clamped = decayMultiplier('build', 2.0);
    expect(clamped).toBeCloseTo(normal, 4);
  });
});

describe('sustainMultiplier', () => {
  it('build drops sustain over time (notes pop then vanish)', () => {
    const start = sustainMultiplier('build', 0);
    const end = sustainMultiplier('build', 1);
    expect(end).toBeLessThan(start);
    expect(end).toBeLessThan(1.0);
  });

  it('breakdown raises sustain over time (pads bloom)', () => {
    const start = sustainMultiplier('breakdown', 0);
    const end = sustainMultiplier('breakdown', 1);
    expect(end).toBeGreaterThan(start);
    expect(end).toBeGreaterThan(1.0);
  });

  it('peak has low stable sustain (punchy)', () => {
    const start = sustainMultiplier('peak', 0);
    const end = sustainMultiplier('peak', 1);
    expect(start).toBeLessThan(1.0);
    expect(Math.abs(end - start)).toBeLessThan(0.1);
  });

  it('intro has elevated sustain (notes float)', () => {
    const start = sustainMultiplier('intro', 0);
    expect(start).toBeGreaterThan(1.0);
  });

  it('stays within 0.75-1.3 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = sustainMultiplier(section, p);
        expect(val).toBeGreaterThanOrEqual(0.75);
        expect(val).toBeLessThanOrEqual(1.3);
      }
    }
  });

  it('clamps progress', () => {
    const normal = sustainMultiplier('build', 1.0);
    const clamped = sustainMultiplier('build', 2.0);
    expect(clamped).toBeCloseTo(normal, 4);
  });
});

describe('releaseMultiplier', () => {
  it('build tightens release over time', () => {
    const start = releaseMultiplier('build', 0);
    const end = releaseMultiplier('build', 1);
    expect(end).toBeLessThan(start);
  });

  it('breakdown blooms release over time', () => {
    const start = releaseMultiplier('breakdown', 0);
    const end = releaseMultiplier('breakdown', 1);
    expect(end).toBeGreaterThan(start);
  });

  it('stays within 0.7-1.4 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const section of sections) {
      for (let p = 0; p <= 1; p += 0.1) {
        const val = releaseMultiplier(section, p);
        expect(val).toBeGreaterThanOrEqual(0.7);
        expect(val).toBeLessThanOrEqual(1.4);
      }
    }
  });
});

describe('shouldApplyEnvelopeEvolution', () => {
  it('returns true for build (all params evolve)', () => {
    expect(shouldApplyEnvelopeEvolution('build')).toBe(true);
  });

  it('returns true for breakdown (all params evolve)', () => {
    expect(shouldApplyEnvelopeEvolution('breakdown')).toBe(true);
  });

  it('returns true for intro (decay/sustain/attack evolve)', () => {
    expect(shouldApplyEnvelopeEvolution('intro')).toBe(true);
  });

  it('returns false for groove (minimal change)', () => {
    expect(shouldApplyEnvelopeEvolution('groove')).toBe(false);
  });
});
