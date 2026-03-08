import { describe, it, expect } from 'vitest';
import {
  detectDirection,
  suggestCounterDirection,
  getPreferredMotion,
  orderByDirection,
} from './contrapuntal-motion';

describe('detectDirection', () => {
  it('ascending when notes go up', () => {
    expect(detectDirection(['C3', 'D3', 'E3', 'G3', 'A3', 'B3'])).toBe('ascending');
  });

  it('descending when notes go down', () => {
    expect(detectDirection(['B4', 'A4', 'G4', 'E4', 'D4', 'C4'])).toBe('descending');
  });

  it('static for flat motion', () => {
    expect(detectDirection(['C4', 'D4', 'C4', 'D4'])).toBe('static');
  });

  it('static for single note', () => {
    expect(detectDirection(['C4'])).toBe('static');
  });

  it('ignores rests', () => {
    expect(detectDirection(['C3', '~', 'E3', '~', 'G3', 'B3'])).toBe('ascending');
  });

  it('empty returns static', () => {
    expect(detectDirection([])).toBe('static');
  });
});

describe('getPreferredMotion', () => {
  it('ambient prefers oblique', () => {
    expect(getPreferredMotion('ambient', 'groove')).toBe('oblique');
  });

  it('trance prefers parallel', () => {
    expect(getPreferredMotion('trance', 'groove')).toBe('parallel');
  });

  it('syro prefers contrary', () => {
    expect(getPreferredMotion('syro', 'groove')).toBe('contrary');
  });

  it('downtempo build uses section default (contrary)', () => {
    expect(getPreferredMotion('downtempo', 'build')).toBe('contrary');
  });

  it('downtempo groove uses section default (similar)', () => {
    expect(getPreferredMotion('downtempo', 'groove')).toBe('similar');
  });
});

describe('suggestCounterDirection', () => {
  it('contrary: ascending melody suggests descending counter', () => {
    const dir = suggestCounterDirection('ascending', 'syro', 'groove');
    expect(dir).toBe('descending');
  });

  it('contrary: descending melody suggests ascending counter', () => {
    const dir = suggestCounterDirection('descending', 'syro', 'groove');
    expect(dir).toBe('ascending');
  });

  it('parallel: ascending melody suggests ascending counter', () => {
    const dir = suggestCounterDirection('ascending', 'trance', 'groove');
    expect(dir).toBe('ascending');
  });

  it('oblique: any melody suggests static counter', () => {
    const dir = suggestCounterDirection('ascending', 'ambient', 'groove');
    expect(dir).toBe('static');
  });

  it('static melody with contrary returns static', () => {
    const dir = suggestCounterDirection('static', 'syro', 'groove');
    expect(dir).toBe('static');
  });
});

describe('orderByDirection', () => {
  const notes = ['G3', 'C3', 'E3', 'C4'];

  it('ascending sorts low to high', () => {
    const result = orderByDirection(notes, 'ascending');
    expect(result[0]).toBe('C3');
    expect(result[result.length - 1]).toBe('C4');
  });

  it('descending sorts high to low', () => {
    const result = orderByDirection(notes, 'descending');
    expect(result[0]).toBe('C4');
    expect(result[result.length - 1]).toBe('C3');
  });

  it('static interleaves for minimal motion', () => {
    const result = orderByDirection(notes, 'static');
    // Should alternate low/high: C3, C4, E3, G3 or similar
    expect(result.length).toBe(4);
    // First should be lowest, second should be highest
    expect(result[0]).toBe('C3');
    expect(result[1]).toBe('C4');
  });

  it('handles single note', () => {
    expect(orderByDirection(['C4'], 'ascending')).toEqual(['C4']);
  });

  it('handles empty', () => {
    expect(orderByDirection([], 'ascending')).toEqual([]);
  });
});
