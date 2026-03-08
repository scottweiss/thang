import { describe, it, expect } from 'vitest';
import {
  shouldOrnamentCadence,
  selectOrnament,
  ornamentProbability,
} from './cadential-ornamentation';
import type { OrnamentType } from './cadential-ornamentation';

describe('shouldOrnamentCadence', () => {
  it('false when not phrase end', () => {
    expect(shouldOrnamentCadence(0, 'avril', 'peak', false)).toBe(false);
  });

  it('returns boolean at phrase end', () => {
    expect(typeof shouldOrnamentCadence(0, 'avril', 'peak', true)).toBe('boolean');
  });

  it('avril ornaments more than trance', () => {
    let avrilCount = 0;
    let tranceCount = 0;
    for (let tick = 0; tick < 200; tick++) {
      if (shouldOrnamentCadence(tick, 'avril', 'peak', true)) avrilCount++;
      if (shouldOrnamentCadence(tick, 'trance', 'peak', true)) tranceCount++;
    }
    expect(avrilCount).toBeGreaterThan(tranceCount);
  });
});

describe('selectOrnament', () => {
  it('returns valid ornament type', () => {
    const valid: OrnamentType[] = ['trill', 'turn', 'mordent', 'appoggiatura'];
    for (let tick = 0; tick < 50; tick++) {
      expect(valid).toContain(selectOrnament(tick, 'lofi'));
    }
  });

  it('is deterministic', () => {
    expect(selectOrnament(42, 'avril')).toBe(selectOrnament(42, 'avril'));
  });
});

describe('ornamentProbability', () => {
  it('avril is highest', () => {
    expect(ornamentProbability('avril')).toBe(0.50);
  });

  it('trance is low', () => {
    expect(ornamentProbability('trance')).toBe(0.05);
  });
});
