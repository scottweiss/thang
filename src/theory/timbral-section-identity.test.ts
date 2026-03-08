import { describe, it, expect } from 'vitest';
import {
  sectionIdentityFm,
  identityStrength,
} from './timbral-section-identity';

describe('sectionIdentityFm', () => {
  it('peak is brightest', () => {
    const peak = sectionIdentityFm('xtal', 'peak');
    const intro = sectionIdentityFm('xtal', 'intro');
    expect(peak).toBeGreaterThan(intro);
  });

  it('intro is warmest', () => {
    const intro = sectionIdentityFm('xtal', 'intro');
    expect(intro).toBeLessThan(1.0);
  });

  it('xtal has more variation than syro', () => {
    const xtalPeak = sectionIdentityFm('xtal', 'peak');
    const syroPeak = sectionIdentityFm('syro', 'peak');
    expect(xtalPeak).toBeGreaterThan(syroPeak);
  });

  it('stays in 0.85-1.20 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const s of sections) {
      const fm = sectionIdentityFm('xtal', s);
      expect(fm).toBeGreaterThanOrEqual(0.85);
      expect(fm).toBeLessThanOrEqual(1.20);
    }
  });
});

describe('identityStrength', () => {
  it('xtal is highest', () => {
    expect(identityStrength('xtal')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(identityStrength('syro')).toBe(0.30);
  });
});
