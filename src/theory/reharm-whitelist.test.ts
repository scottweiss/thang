import { describe, it, expect } from 'vitest';
import { isReharmAllowed, getAllowedReharms } from './reharm-whitelist';

describe('isReharmAllowed', () => {
  it('lofi allows secondary dominant', () => {
    expect(isReharmAllowed('lofi', 'secondaryDominant')).toBe(true);
  });
  it('lofi allows tritone sub', () => {
    expect(isReharmAllowed('lofi', 'tritoneSub')).toBe(true);
  });
  it('lofi blocks neo-riemannian', () => {
    expect(isReharmAllowed('lofi', 'neoRiemannian')).toBe(false);
  });
  it('ambient allows neo-riemannian', () => {
    expect(isReharmAllowed('ambient', 'neoRiemannian')).toBe(true);
  });
  it('ambient blocks secondary dominant', () => {
    expect(isReharmAllowed('ambient', 'secondaryDominant')).toBe(false);
  });
  it('trance allows modal interchange only', () => {
    expect(isReharmAllowed('trance', 'modalInterchange')).toBe(true);
    expect(isReharmAllowed('trance', 'tritoneSub')).toBe(false);
    expect(isReharmAllowed('trance', 'negativeHarmony')).toBe(false);
  });
  it('syro allows negative harmony and chromatic approach', () => {
    expect(isReharmAllowed('syro', 'negativeHarmony')).toBe(true);
    expect(isReharmAllowed('syro', 'chromaticApproach')).toBe(true);
    expect(isReharmAllowed('syro', 'tritoneSub')).toBe(false);
  });
});

describe('getAllowedReharms', () => {
  it('returns 1-3 types per mood', () => {
    const moods = ['lofi', 'ambient', 'trance', 'syro', 'avril', 'xtal', 'downtempo', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      const allowed = getAllowedReharms(m);
      expect(allowed.length).toBeGreaterThanOrEqual(1);
      expect(allowed.length).toBeLessThanOrEqual(3);
    }
  });
});
