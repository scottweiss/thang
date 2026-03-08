import { describe, it, expect } from 'vitest';
import {
  registralProximity,
  registralReturnGain,
  returnStrengthValue,
} from './melodic-registral-return';

describe('registralProximity', () => {
  it('exact return = 1.0', () => {
    expect(registralProximity(60, 60)).toBe(1.0);
  });

  it('far away = 0', () => {
    expect(registralProximity(60, 72)).toBe(0);
  });

  it('within tolerance is partial', () => {
    const prox = registralProximity(60, 63);
    expect(prox).toBeGreaterThan(0);
    expect(prox).toBeLessThan(1.0);
  });

  it('closer = higher proximity', () => {
    expect(registralProximity(60, 61)).toBeGreaterThan(registralProximity(60, 64));
  });
});

describe('registralReturnGain', () => {
  it('return to home gets boost', () => {
    const gain = registralReturnGain(60, 60, 0.9, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('far from home is neutral', () => {
    const gain = registralReturnGain(60, 72, 0.9, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('boost stronger near end of section', () => {
    const early = registralReturnGain(60, 60, 0.1, 'avril', 'peak');
    const late = registralReturnGain(60, 60, 0.9, 'avril', 'peak');
    expect(late).toBeGreaterThan(early);
  });

  it('avril boosts more than blockhead', () => {
    const av = registralReturnGain(60, 60, 0.5, 'avril', 'peak');
    const bh = registralReturnGain(60, 60, 0.5, 'blockhead', 'peak');
    expect(av).toBeGreaterThan(bh);
  });

  it('stays in 1.0-1.03 range', () => {
    for (let p = 48; p <= 72; p++) {
      const gain = registralReturnGain(60, p, 1.0, 'avril', 'breakdown');
      expect(gain).toBeGreaterThanOrEqual(1.0);
      expect(gain).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('returnStrengthValue', () => {
  it('avril is highest', () => {
    expect(returnStrengthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(returnStrengthValue('blockhead')).toBe(0.15);
  });
});
