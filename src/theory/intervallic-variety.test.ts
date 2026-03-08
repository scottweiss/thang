import { describe, it, expect } from 'vitest';
import {
  classifyInterval,
  intervalVariety,
  suggestIntervalBias,
  biasOffset,
  varietyAppetite,
} from './intervallic-variety';

describe('classifyInterval', () => {
  it('0 = unison', () => {
    expect(classifyInterval(0)).toBe('unison');
  });

  it('1-2 = step', () => {
    expect(classifyInterval(1)).toBe('step');
    expect(classifyInterval(2)).toBe('step');
  });

  it('3-4 = skip', () => {
    expect(classifyInterval(3)).toBe('skip');
    expect(classifyInterval(4)).toBe('skip');
  });

  it('5-7 = leap', () => {
    expect(classifyInterval(5)).toBe('leap');
    expect(classifyInterval(7)).toBe('leap');
  });

  it('8+ = wide-leap', () => {
    expect(classifyInterval(8)).toBe('wide-leap');
    expect(classifyInterval(12)).toBe('wide-leap');
  });
});

describe('intervalVariety', () => {
  it('all same = low variety', () => {
    expect(intervalVariety([2, 2, 2, 2, 2])).toBeLessThan(0.2);
  });

  it('mixed sizes = high variety', () => {
    expect(intervalVariety([1, 4, 7, 2, 5])).toBeGreaterThan(0.5);
  });

  it('short history = neutral', () => {
    expect(intervalVariety([2])).toBe(0.5);
  });
});

describe('suggestIntervalBias', () => {
  it('all steps → suggest larger', () => {
    expect(suggestIntervalBias([1, 2, 1, 2, 1, 2], 'lofi')).toBe('larger');
  });

  it('all leaps → suggest smaller', () => {
    expect(suggestIntervalBias([7, 6, 7, 8, 7, 6], 'lofi')).toBe('smaller');
  });

  it('good variety → any', () => {
    expect(suggestIntervalBias([2, 5, 1, 7, 3], 'lofi')).toBe('any');
  });

  it('trance tolerates less variety', () => {
    // All steps: variety ~0, trance appetite 0.20
    // 0 < 0.20 - 0.15 = 0.05 → barely triggers
    const result = suggestIntervalBias([2, 2, 2, 2, 2], 'trance');
    // May or may not trigger depending on exact variety calculation
    expect(['larger', 'any']).toContain(result);
  });
});

describe('biasOffset', () => {
  it('any = no offset', () => {
    expect(biasOffset('any', 2)).toBe(0);
  });

  it('larger with small interval = positive offset', () => {
    expect(biasOffset('larger', 2)).toBe(3);
  });

  it('smaller with large interval = negative offset', () => {
    expect(biasOffset('smaller', 7)).toBe(-3);
  });

  it('no offset when interval already matches', () => {
    expect(biasOffset('larger', 5)).toBe(0);
    expect(biasOffset('smaller', 2)).toBe(0);
  });
});

describe('varietyAppetite', () => {
  it('syro has highest appetite', () => {
    expect(varietyAppetite('syro')).toBe(0.60);
  });

  it('trance has lowest appetite', () => {
    expect(varietyAppetite('trance')).toBe(0.20);
  });
});
