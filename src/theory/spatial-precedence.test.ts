import { describe, it, expect } from 'vitest';
import {
  precedenceReverbReduction,
  precedencePanNarrowing,
  shouldApplyPrecedence,
  precedenceStrengthForMood,
} from './spatial-precedence';

describe('precedenceReverbReduction', () => {
  it('first arrival = full reverb', () => {
    expect(precedenceReverbReduction(0, 'lofi')).toBe(1.0);
  });

  it('delayed = reduced reverb', () => {
    expect(precedenceReverbReduction(20, 'lofi')).toBeLessThan(1.0);
  });

  it('outside window = full reverb', () => {
    expect(precedenceReverbReduction(50, 'lofi')).toBe(1.0);
  });

  it('clamped at 0.5', () => {
    expect(precedenceReverbReduction(39, 'ambient')).toBeGreaterThanOrEqual(0.5);
  });

  it('stronger moods reduce more', () => {
    const ambient = precedenceReverbReduction(20, 'ambient');
    const syro = precedenceReverbReduction(20, 'syro');
    expect(ambient).toBeLessThan(syro);
  });
});

describe('precedencePanNarrowing', () => {
  it('first arrival = no narrowing', () => {
    expect(precedencePanNarrowing(0, 'lofi', 0.4)).toBe(0.4);
  });

  it('delayed = narrower pan', () => {
    expect(precedencePanNarrowing(20, 'lofi', 0.4)).toBeLessThan(0.4);
  });

  it('outside window = no narrowing', () => {
    expect(precedencePanNarrowing(50, 'lofi', 0.4)).toBe(0.4);
  });

  it('minimum width is 0.05', () => {
    expect(precedencePanNarrowing(39, 'ambient', 0.1)).toBeGreaterThanOrEqual(0.05);
  });
});

describe('shouldApplyPrecedence', () => {
  it('true with 3+ layers', () => {
    expect(shouldApplyPrecedence('lofi', 4)).toBe(true);
  });

  it('false with 2 layers', () => {
    expect(shouldApplyPrecedence('lofi', 2)).toBe(false);
  });
});

describe('precedenceStrengthForMood', () => {
  it('ambient is strongest', () => {
    expect(precedenceStrengthForMood('ambient')).toBe(0.60);
  });

  it('syro is weakest', () => {
    expect(precedenceStrengthForMood('syro')).toBe(0.30);
  });
});
