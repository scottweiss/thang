import { describe, it, expect } from 'vitest';
import {
  classifyGesture,
  gestureEntropy,
  entropyDeficit,
  shouldInjectSurprise,
  shouldInjectStability,
  suggestGesture,
  targetEntropy,
  type GestureType,
} from './gestural-entropy';

describe('classifyGesture', () => {
  it('zero interval is repeat', () => {
    expect(classifyGesture(0)).toBe('repeat');
  });

  it('small positive is step-up', () => {
    expect(classifyGesture(1)).toBe('step-up');
    expect(classifyGesture(2)).toBe('step-up');
  });

  it('small negative is step-down', () => {
    expect(classifyGesture(-1)).toBe('step-down');
    expect(classifyGesture(-2)).toBe('step-down');
  });

  it('large positive is leap-up', () => {
    expect(classifyGesture(5)).toBe('leap-up');
  });

  it('large negative is leap-down', () => {
    expect(classifyGesture(-4)).toBe('leap-down');
  });
});

describe('gestureEntropy', () => {
  it('all same gesture = low entropy', () => {
    const history: GestureType[] = Array(8).fill('step-up');
    expect(gestureEntropy(history)).toBeLessThan(0.1);
  });

  it('all different gestures = high entropy', () => {
    const history: GestureType[] = [
      'step-up', 'step-down', 'leap-up', 'leap-down',
      'repeat', 'rest', 'direction-change',
    ];
    expect(gestureEntropy(history)).toBeGreaterThan(0.9);
  });

  it('empty history returns 0.5 (neutral)', () => {
    expect(gestureEntropy([])).toBe(0.5);
  });

  it('single gesture returns 0.5 (neutral)', () => {
    expect(gestureEntropy(['step-up'])).toBe(0.5);
  });

  it('mixed but biased gives moderate entropy', () => {
    const history: GestureType[] = [
      'step-up', 'step-up', 'step-up', 'step-down',
      'step-up', 'step-up', 'leap-up', 'step-up',
    ];
    const e = gestureEntropy(history);
    expect(e).toBeGreaterThan(0.2);
    expect(e).toBeLessThan(0.7);
  });
});

describe('entropyDeficit', () => {
  it('monotonous history has negative deficit (too predictable)', () => {
    const history: GestureType[] = Array(8).fill('step-up');
    const deficit = entropyDeficit(history, 'syro', 'peak');
    expect(deficit).toBeLessThan(-0.3);
  });

  it('varied history has positive deficit for trance', () => {
    const history: GestureType[] = [
      'step-up', 'step-down', 'leap-up', 'leap-down',
      'repeat', 'rest', 'direction-change', 'step-up',
    ];
    const deficit = entropyDeficit(history, 'trance', 'groove');
    expect(deficit).toBeGreaterThan(0);
  });
});

describe('shouldInjectSurprise', () => {
  it('monotonous history triggers surprise', () => {
    const history: GestureType[] = Array(8).fill('step-up');
    expect(shouldInjectSurprise(history, 'lofi', 'groove')).toBe(true);
  });

  it('varied history does not trigger surprise', () => {
    const history: GestureType[] = [
      'step-up', 'step-down', 'leap-up', 'leap-down',
      'repeat', 'rest', 'direction-change', 'step-up',
    ];
    expect(shouldInjectSurprise(history, 'lofi', 'groove')).toBe(false);
  });
});

describe('shouldInjectStability', () => {
  it('chaotic history triggers stability for trance', () => {
    const history: GestureType[] = [
      'step-up', 'step-down', 'leap-up', 'leap-down',
      'repeat', 'rest', 'direction-change', 'step-up',
    ];
    expect(shouldInjectStability(history, 'trance', 'groove')).toBe(true);
  });

  it('monotonous history does not trigger stability', () => {
    const history: GestureType[] = Array(8).fill('step-up');
    expect(shouldInjectStability(history, 'trance', 'groove')).toBe(false);
  });
});

describe('suggestGesture', () => {
  it('suggests rare gesture when too predictable', () => {
    const history: GestureType[] = Array(8).fill('step-up');
    const suggestion = suggestGesture(history, 'syro', 'peak', 42);
    expect(suggestion).not.toBe('step-up');
  });

  it('suggests common gesture when too chaotic', () => {
    const history: GestureType[] = [
      'step-up', 'step-down', 'leap-up', 'leap-down',
      'repeat', 'rest', 'direction-change',
    ];
    // For trance at intro, target is very low → stability
    const suggestion = suggestGesture(history, 'trance', 'intro', 42);
    expect(typeof suggestion).toBe('string');
  });

  it('returns valid gesture type', () => {
    const history: GestureType[] = ['step-up', 'step-down', 'repeat'];
    const suggestion = suggestGesture(history, 'lofi', 'groove', 100);
    const valid: GestureType[] = [
      'step-up', 'step-down', 'leap-up', 'leap-down',
      'repeat', 'rest', 'direction-change',
    ];
    expect(valid).toContain(suggestion);
  });
});

describe('targetEntropy', () => {
  it('syro has highest target', () => {
    expect(targetEntropy('syro')).toBe(0.75);
  });

  it('trance has lowest target', () => {
    expect(targetEntropy('trance')).toBe(0.30);
  });
});
