import { describe, it, expect } from 'vitest';
import {
  generateOstinato,
  selectOstinatoType,
  shouldApplyOstinato,
  ostinatoLength,
  ostinatoTendency,
} from './ostinato';

describe('generateOstinato', () => {
  it('ascending cycles through chord notes', () => {
    const ost = generateOstinato(['C3', 'E3', 'G3'], 'ascending', 6);
    expect(ost).toHaveLength(6);
    expect(ost[0]).toBe('C3');
    expect(ost[1]).toBe('E3');
    expect(ost[2]).toBe('G3');
    expect(ost[3]).toBe('C3');
  });

  it('descending cycles in reverse', () => {
    const ost = generateOstinato(['C3', 'E3', 'G3'], 'descending', 4);
    expect(ost[0]).toBe('G3');
    expect(ost[1]).toBe('E3');
    expect(ost[2]).toBe('C3');
  });

  it('pendulum goes up then down', () => {
    const ost = generateOstinato(['C3', 'E3', 'G3'], 'pendulum', 6);
    expect(ost[0]).toBe('C3');
    expect(ost[1]).toBe('E3');
    expect(ost[2]).toBe('G3');
    expect(ost[3]).toBe('E3'); // turning back
  });

  it('static repeats root', () => {
    const ost = generateOstinato(['C3', 'E3', 'G3'], 'static', 4);
    expect(ost.every(n => n === 'C3')).toBe(true);
  });

  it('handles empty chord notes', () => {
    expect(generateOstinato([], 'ascending')).toEqual([]);
  });

  it('clamps length to 2-8', () => {
    const short = generateOstinato(['C3'], 'static', 1);
    expect(short).toHaveLength(2);
    const long = generateOstinato(['C3'], 'static', 20);
    expect(long).toHaveLength(8);
  });
});

describe('selectOstinatoType', () => {
  it('returns valid type', () => {
    const valid = ['ascending', 'descending', 'pendulum', 'static'];
    for (let i = 0; i < 20; i++) {
      expect(valid).toContain(selectOstinatoType('trance', 'groove', i));
    }
  });

  it('is deterministic', () => {
    const a = selectOstinatoType('lofi', 'groove', 42);
    const b = selectOstinatoType('lofi', 'groove', 42);
    expect(a).toBe(b);
  });
});

describe('shouldApplyOstinato', () => {
  it('is deterministic', () => {
    const a = shouldApplyOstinato(42, 'trance', 'groove');
    const b = shouldApplyOstinato(42, 'trance', 'groove');
    expect(a).toBe(b);
  });

  it('trance groove has high ostinato rate', () => {
    const count = Array.from({ length: 200 }, (_, i) =>
      shouldApplyOstinato(i, 'trance', 'groove')
    ).filter(Boolean).length;
    expect(count).toBeGreaterThan(100); // >50% with 0.55 * 1.8 = 0.99
  });

  it('ambient breakdown has low rate', () => {
    const count = Array.from({ length: 200 }, (_, i) =>
      shouldApplyOstinato(i, 'ambient', 'breakdown')
    ).filter(Boolean).length;
    expect(count).toBeLessThan(20);
  });
});

describe('ostinatoLength', () => {
  it('trance and disco use 4-note ostinati', () => {
    expect(ostinatoLength('trance')).toBe(4);
    expect(ostinatoLength('disco')).toBe(4);
  });

  it('ambient uses short 2-note ostinati', () => {
    expect(ostinatoLength('ambient')).toBe(2);
  });
});

describe('ostinatoTendency', () => {
  it('trance has highest tendency', () => {
    expect(ostinatoTendency('trance')).toBe(0.55);
  });

  it('ambient has lowest tendency', () => {
    expect(ostinatoTendency('ambient')).toBe(0.08);
  });
});
