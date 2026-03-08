import { describe, it, expect } from 'vitest';
import {
  syncopationLevel,
  syncopationGain,
  syncopationAppetite,
} from './syncopation-depth';

describe('syncopationLevel', () => {
  it('downbeat is 0', () => {
    expect(syncopationLevel(0)).toBe(0);
  });

  it('backbeat is 0', () => {
    expect(syncopationLevel(8)).toBe(0);
  });

  it('sixteenth is most syncopated', () => {
    expect(syncopationLevel(1)).toBe(0.8);
  });

  it('hierarchy: downbeat < quarter < eighth < sixteenth', () => {
    expect(syncopationLevel(0)).toBeLessThan(syncopationLevel(4));
    expect(syncopationLevel(4)).toBeLessThan(syncopationLevel(2));
    expect(syncopationLevel(2)).toBeLessThan(syncopationLevel(1));
  });
});

describe('syncopationGain', () => {
  it('hungry mood boosts syncopated positions', () => {
    const gain = syncopationGain(1, 'lofi'); // sixteenth, hungry
    expect(gain).toBeGreaterThan(1.0);
  });

  it('strict mood reduces syncopated positions', () => {
    const gain = syncopationGain(1, 'trance'); // sixteenth, strict
    expect(gain).toBeLessThan(1.0);
  });

  it('stays in 0.88-1.12 range', () => {
    for (let p = 0; p < 16; p++) {
      const gain = syncopationGain(p, 'blockhead');
      expect(gain).toBeGreaterThanOrEqual(0.88);
      expect(gain).toBeLessThanOrEqual(1.12);
    }
  });

  it('downbeat is unaffected', () => {
    const gain = syncopationGain(0, 'lofi');
    expect(gain).toBe(1.0);
  });
});

describe('syncopationAppetite', () => {
  it('lofi is highest', () => {
    expect(syncopationAppetite('lofi')).toBe(0.65);
  });

  it('ambient is lowest', () => {
    expect(syncopationAppetite('ambient')).toBe(0.15);
  });
});
