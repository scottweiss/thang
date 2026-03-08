import { describe, it, expect } from 'vitest';
import { tensionDelayMultiplier, shouldApplyTensionDelay } from './tension-delay';

describe('tensionDelayMultiplier', () => {
  it('neutral tension returns ~1.0', () => {
    expect(tensionDelayMultiplier(0.5, 'downtempo')).toBeCloseTo(1.0, 2);
  });

  it('high tension adds echo (multiplier > 1)', () => {
    expect(tensionDelayMultiplier(0.9, 'downtempo')).toBeGreaterThan(1.0);
  });

  it('low tension reduces echo (multiplier < 1)', () => {
    expect(tensionDelayMultiplier(0.1, 'downtempo')).toBeLessThan(1.0);
  });

  it('syro has strong feedback buildup', () => {
    const mult = tensionDelayMultiplier(1.0, 'syro');
    expect(mult).toBeGreaterThan(1.2);
  });

  it('avril is gentle', () => {
    const mult = tensionDelayMultiplier(0.9, 'avril');
    expect(mult).toBeLessThan(1.1);
  });

  it('stays within safe clamp range', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const mood of moods) {
      for (let t = 0; t <= 1; t += 0.25) {
        const mult = tensionDelayMultiplier(t, mood);
        expect(mult).toBeGreaterThanOrEqual(0.7);
        expect(mult).toBeLessThanOrEqual(1.3);
      }
    }
  });
});

describe('shouldApplyTensionDelay', () => {
  it('applies to melody', () => {
    expect(shouldApplyTensionDelay('melody')).toBe(true);
  });

  it('applies to arp', () => {
    expect(shouldApplyTensionDelay('arp')).toBe(true);
  });

  it('does not apply to drone', () => {
    expect(shouldApplyTensionDelay('drone')).toBe(false);
  });

  it('does not apply to atmosphere', () => {
    expect(shouldApplyTensionDelay('atmosphere')).toBe(false);
  });
});
