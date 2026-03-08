import { describe, it, expect } from 'vitest';
import {
  noteSalience,
  salienceGainBoost,
  backgroundGainReduction,
  shouldApplySalience,
  salienceStrength,
} from './auditory-salience';

describe('noteSalience', () => {
  it('0 with all zero factors', () => {
    expect(noteSalience(0, 0, 0, 0, 'trance', 'peak')).toBe(0);
  });

  it('higher with extreme register', () => {
    const normal = noteSalience(0.2, 0, 0, 0, 'syro', 'peak');
    const extreme = noteSalience(0.9, 0, 0, 0, 'syro', 'peak');
    expect(extreme).toBeGreaterThan(normal);
  });

  it('higher with spectral change', () => {
    const still = noteSalience(0, 0.1, 0, 0, 'blockhead', 'peak');
    const bright = noteSalience(0, 0.9, 0, 0, 'blockhead', 'peak');
    expect(bright).toBeGreaterThan(still);
  });

  it('syro has stronger salience than ambient', () => {
    const syro = noteSalience(0.5, 0.5, 0.5, 0.5, 'syro', 'peak');
    const ambient = noteSalience(0.5, 0.5, 0.5, 0.5, 'ambient', 'peak');
    expect(syro).toBeGreaterThan(ambient);
  });

  it('clamped 0-1', () => {
    const val = noteSalience(1, 1, 1, 1, 'syro', 'peak');
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThanOrEqual(1);
  });

  it('peak stronger than breakdown', () => {
    const peak = noteSalience(0.5, 0.5, 0.5, 0.5, 'trance', 'peak');
    const bd = noteSalience(0.5, 0.5, 0.5, 0.5, 'trance', 'breakdown');
    expect(peak).toBeGreaterThan(bd);
  });
});

describe('salienceGainBoost', () => {
  it('1.0 with no salience', () => {
    expect(salienceGainBoost(0, 'trance')).toBe(1.0);
  });

  it('> 1.0 with high salience', () => {
    expect(salienceGainBoost(0.8, 'syro')).toBeGreaterThan(1.0);
  });
});

describe('backgroundGainReduction', () => {
  it('1.0 with no foreground salience', () => {
    expect(backgroundGainReduction(0, 'trance')).toBe(1.0);
  });

  it('< 1.0 with salient foreground', () => {
    expect(backgroundGainReduction(0.8, 'syro')).toBeLessThan(1.0);
  });

  it('clamped at 0.90', () => {
    expect(backgroundGainReduction(1.0, 'syro')).toBeGreaterThanOrEqual(0.90);
  });
});

describe('shouldApplySalience', () => {
  it('true for syro peak', () => {
    expect(shouldApplySalience('syro', 'peak')).toBe(true);
  });

  it('false for ambient breakdown', () => {
    // 0.10 * 0.4 = 0.04 < 0.08
    expect(shouldApplySalience('ambient', 'breakdown')).toBe(false);
  });
});

describe('salienceStrength', () => {
  it('syro is strongest', () => {
    expect(salienceStrength('syro')).toBe(0.60);
  });

  it('ambient is weakest', () => {
    expect(salienceStrength('ambient')).toBe(0.10);
  });
});
