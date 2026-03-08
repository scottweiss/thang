import { describe, it, expect } from 'vitest';
import {
  polyrhythmPositions,
  polyrhythmAccentMask,
  shouldApplyPolyrhythm,
  selectGrouping,
  polyrhythmStrength,
} from './polyrhythm';

describe('polyrhythmPositions', () => {
  it('3 over 16 gives 3 positions', () => {
    const pos = polyrhythmPositions(3, 16);
    expect(pos).toHaveLength(3);
    expect(pos[0]).toBe(0);
    // Roughly evenly spaced
    expect(pos[1]).toBeGreaterThan(4);
    expect(pos[1]).toBeLessThan(7);
    expect(pos[2]).toBeGreaterThan(9);
    expect(pos[2]).toBeLessThan(12);
  });

  it('5 over 16 gives 5 positions', () => {
    const pos = polyrhythmPositions(5, 16);
    expect(pos).toHaveLength(5);
    expect(pos[0]).toBe(0);
  });

  it('7 over 16 gives 7 positions', () => {
    const pos = polyrhythmPositions(7, 16);
    expect(pos).toHaveLength(7);
    expect(pos[0]).toBe(0);
  });

  it('3 over 8 gives 3 positions', () => {
    const pos = polyrhythmPositions(3, 8);
    expect(pos).toHaveLength(3);
    expect(pos).toEqual([0, 3, 5]); // round(0), round(2.67), round(5.33)
  });

  it('all positions are within grid', () => {
    for (const grouping of [3, 5, 6, 7] as const) {
      const pos = polyrhythmPositions(grouping, 16);
      for (const p of pos) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThan(16);
      }
    }
  });
});

describe('polyrhythmAccentMask', () => {
  it('returns correct length', () => {
    const mask = polyrhythmAccentMask(3, 16);
    expect(mask).toHaveLength(16);
  });

  it('poly positions are boosted', () => {
    const mask = polyrhythmAccentMask(3, 16, 0.5);
    const positions = new Set(polyrhythmPositions(3, 16));
    for (let i = 0; i < 16; i++) {
      if (positions.has(i)) {
        expect(mask[i]).toBeGreaterThan(1.0);
      } else {
        expect(mask[i]).toBeLessThan(1.0);
      }
    }
  });

  it('strength 0 gives all 1.0', () => {
    const mask = polyrhythmAccentMask(3, 16, 0);
    for (const m of mask) {
      expect(m).toBe(1.0);
    }
  });

  it('higher strength means more contrast', () => {
    const weak = polyrhythmAccentMask(3, 16, 0.3);
    const strong = polyrhythmAccentMask(3, 16, 0.8);
    const positions = polyrhythmPositions(3, 16);
    // Strong accent should boost more on poly beats
    expect(strong[positions[0]]).toBeGreaterThan(weak[positions[0]]);
  });
});

describe('shouldApplyPolyrhythm', () => {
  it('only applies to arp layer', () => {
    expect(shouldApplyPolyrhythm('syro', 'peak', 'melody')).toBe(false);
    expect(shouldApplyPolyrhythm('syro', 'peak', 'harmony')).toBe(false);
    expect(shouldApplyPolyrhythm('syro', 'peak', 'drone')).toBe(false);
  });

  it('syro arp at peak has reasonable probability', () => {
    let count = 0;
    for (let i = 0; i < 200; i++) {
      if (shouldApplyPolyrhythm('syro', 'peak', 'arp')) count++;
    }
    // syro prob=0.40, peak mult=1.0 → ~40%
    expect(count).toBeGreaterThan(50);
    expect(count).toBeLessThan(120);
  });
});

describe('selectGrouping', () => {
  it('returns valid grouping for syro', () => {
    for (let i = 0; i < 20; i++) {
      const g = selectGrouping('syro');
      expect([3, 5, 7]).toContain(g);
    }
  });

  it('returns valid grouping for lofi', () => {
    for (let i = 0; i < 20; i++) {
      const g = selectGrouping('lofi');
      expect([3, 6]).toContain(g);
    }
  });
});

describe('polyrhythmStrength', () => {
  it('syro is strongest', () => {
    expect(polyrhythmStrength('syro')).toBe(0.40);
  });

  it('ambient is weakest', () => {
    expect(polyrhythmStrength('ambient')).toBe(0.05);
  });
});
