import { describe, it, expect } from 'vitest';
import {
  phraseRole,
  qaGainEmphasis,
  shouldResolveToTonic,
  qaStrength,
} from './phrase-question-answer';

describe('phraseRole', () => {
  it('even phrases are questions', () => {
    expect(phraseRole(0)).toBe('question');
    expect(phraseRole(2)).toBe('question');
  });

  it('odd phrases are answers', () => {
    expect(phraseRole(1)).toBe('answer');
    expect(phraseRole(3)).toBe('answer');
  });
});

describe('qaGainEmphasis', () => {
  it('answer phrases get boost', () => {
    const gain = qaGainEmphasis(1, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('question phrases get slight reduction', () => {
    const gain = qaGainEmphasis(0, 'avril', 'build');
    expect(gain).toBeLessThan(1.0);
  });

  it('avril emphasizes more than syro', () => {
    const avril = qaGainEmphasis(1, 'avril', 'build');
    const syro = qaGainEmphasis(1, 'syro', 'build');
    expect(avril).toBeGreaterThan(syro);
  });

  it('stays in 0.95-1.15 range', () => {
    const gain = qaGainEmphasis(1, 'avril', 'peak');
    expect(gain).toBeGreaterThanOrEqual(0.95);
    expect(gain).toBeLessThanOrEqual(1.15);
  });
});

describe('shouldResolveToTonic', () => {
  it('answer phrase should resolve', () => {
    expect(shouldResolveToTonic(1, 'avril')).toBe(true);
  });

  it('question phrase should not resolve', () => {
    expect(shouldResolveToTonic(0, 'avril')).toBe(false);
  });

  it('most moods want resolution on answers', () => {
    expect(shouldResolveToTonic(1, 'lofi')).toBe(true);
  });
});

describe('qaStrength', () => {
  it('avril is highest', () => {
    expect(qaStrength('avril')).toBe(0.60);
  });

  it('syro is lowest', () => {
    expect(qaStrength('syro')).toBe(0.15);
  });
});
