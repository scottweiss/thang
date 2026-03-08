import { describe, it, expect } from 'vitest';
import {
  compingPattern,
  shouldComp,
  compProbability,
  pickCompingStyle,
} from './comping-rhythm';

describe('compingPattern', () => {
  it('returns correct number of steps', () => {
    const pattern = compingPattern(8, 'disco', 'groove');
    expect(pattern).toHaveLength(8);
  });

  it('sustained returns all 1s', () => {
    const pattern = compingPattern(8, 'ambient', 'intro');
    expect(pattern.every(v => v === 1.0)).toBe(true);
  });

  it('non-sustained patterns have zeros', () => {
    const pattern = compingPattern(8, 'disco', 'groove');
    expect(pattern.some(v => v === 0)).toBe(true);
    expect(pattern.some(v => v > 0)).toBe(true);
  });

  it('16-step patterns work', () => {
    const pattern = compingPattern(16, 'lofi', 'groove');
    expect(pattern).toHaveLength(16);
  });
});

describe('shouldComp', () => {
  it('true for disco groove', () => {
    expect(shouldComp('disco', 'groove')).toBe(true);
  });

  it('false for ambient intro', () => {
    expect(shouldComp('ambient', 'intro')).toBe(false);
  });

  it('false for trance intro', () => {
    expect(shouldComp('trance', 'intro')).toBe(false);
  });

  it('true for blockhead peak', () => {
    expect(shouldComp('blockhead', 'peak')).toBe(true);
  });
});

describe('compProbability', () => {
  it('disco groove is highest', () => {
    const discoGroove = compProbability('disco', 'groove');
    const ambientIntro = compProbability('ambient', 'intro');
    expect(discoGroove).toBeGreaterThan(ambientIntro);
  });

  it('breakdown reduces probability', () => {
    const groove = compProbability('lofi', 'groove');
    const breakdown = compProbability('lofi', 'breakdown');
    expect(breakdown).toBeLessThan(groove);
  });

  it('is deterministic', () => {
    const a = compProbability('downtempo', 'peak');
    const b = compProbability('downtempo', 'peak');
    expect(a).toBe(b);
  });
});

describe('pickCompingStyle', () => {
  it('ambient returns sustained', () => {
    expect(pickCompingStyle('ambient', 'intro')).toBe('sustained');
  });

  it('disco returns a rhythmic style', () => {
    const style = pickCompingStyle('disco', 'groove');
    expect(['stabs', 'offbeat', 'charleston']).toContain(style);
  });

  it('is deterministic for same mood/section', () => {
    const a = pickCompingStyle('lofi', 'groove');
    const b = pickCompingStyle('lofi', 'groove');
    expect(a).toBe(b);
  });
});
