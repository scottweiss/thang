import { describe, it, expect } from 'vitest';
import {
  phraseCompletionGain,
  completionBonus,
} from './melodic-phrase-completion';

describe('phraseCompletionGain', () => {
  it('mid-phrase is neutral', () => {
    const gain = phraseCompletionGain(0.5, 'avril');
    expect(gain).toBe(1.0);
  });

  it('near completion gets boost', () => {
    const gain = phraseCompletionGain(0.95, 'avril');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('avril boosts more than syro', () => {
    const av = phraseCompletionGain(0.95, 'avril');
    const sy = phraseCompletionGain(0.95, 'syro');
    expect(av).toBeGreaterThan(sy);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let p = 0; p <= 1.0; p += 0.05) {
      const gain = phraseCompletionGain(p, 'avril');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('completionBonus', () => {
  it('avril is high', () => {
    expect(completionBonus('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(completionBonus('syro')).toBe(0.20);
  });
});
