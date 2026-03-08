import { describe, it, expect } from 'vitest';
import {
  classifyFunction,
  harmonicPull,
  functionalStrength,
  functionalWeight,
  functionalBias,
} from './functional-harmony';

describe('classifyFunction', () => {
  it('I is tonic', () => {
    expect(classifyFunction(0, 'maj')).toBe('tonic');
  });

  it('ii is subdominant', () => {
    expect(classifyFunction(1, 'min')).toBe('subdominant');
  });

  it('iii is tonic', () => {
    expect(classifyFunction(2, 'min')).toBe('tonic');
  });

  it('IV is subdominant', () => {
    expect(classifyFunction(3, 'maj')).toBe('subdominant');
  });

  it('V is dominant', () => {
    expect(classifyFunction(4, 'maj')).toBe('dominant');
  });

  it('vi (minor) is tonic substitute', () => {
    expect(classifyFunction(5, 'min')).toBe('tonic');
  });

  it('VI7 (dom7) is dominant (secondary dominant context)', () => {
    expect(classifyFunction(5, 'dom7')).toBe('dominant');
  });

  it('vii° is dominant', () => {
    expect(classifyFunction(6, 'dim')).toBe('dominant');
  });
});

describe('harmonicPull', () => {
  it('V7 has maximum pull', () => {
    expect(harmonicPull(4, 'dom7')).toBe(1.0);
  });

  it('V (no 7th) has strong pull', () => {
    expect(harmonicPull(4, 'maj')).toBe(0.8);
  });

  it('I has no pull (already home)', () => {
    expect(harmonicPull(0, 'maj')).toBe(0.0);
  });

  it('ii has moderate pull', () => {
    expect(harmonicPull(1, 'min')).toBe(0.4);
  });

  it('vii° has strong pull', () => {
    expect(harmonicPull(6, 'dim')).toBe(0.85);
  });

  it('secondary dom7 has moderate pull', () => {
    expect(harmonicPull(1, 'dom7')).toBe(0.6);
  });

  it('pull ordering: V7 > vii° > V > ii > IV > vi > I', () => {
    const v7 = harmonicPull(4, 'dom7');
    const vii = harmonicPull(6, 'dim');
    const v = harmonicPull(4, 'maj');
    const ii = harmonicPull(1, 'min');
    const IV = harmonicPull(3, 'maj');
    const vi = harmonicPull(5, 'min');
    const I = harmonicPull(0, 'maj');
    expect(v7).toBeGreaterThan(vii);
    expect(vii).toBeGreaterThan(v);
    expect(v).toBeGreaterThan(ii);
    expect(ii).toBeGreaterThan(IV);
    expect(IV).toBeGreaterThan(vi);
    expect(vi).toBeGreaterThan(I);
  });
});

describe('functionalStrength', () => {
  it('V → I is strongest (D → T resolution)', () => {
    expect(functionalStrength(4, 'dom7', 0)).toBe(1.0);
  });

  it('ii → V is strong (S → D preparation)', () => {
    expect(functionalStrength(1, 'min', 4)).toBe(0.85);
  });

  it('V → vi is moderate (deceptive cadence)', () => {
    expect(functionalStrength(4, 'dom7', 5)).toBe(0.7);
  });

  it('I → IV is moderate (T → S departure)', () => {
    expect(functionalStrength(0, 'maj', 3)).toBe(0.6);
  });

  it('IV → I is moderate (plagal cadence)', () => {
    expect(functionalStrength(3, 'maj', 0)).toBe(0.5);
  });

  it('V → IV is weak (retrogression)', () => {
    expect(functionalStrength(4, 'dom7', 3)).toBe(0.15);
  });

  it('D → T > S → D > T → S > S → T', () => {
    const dt = functionalStrength(4, 'dom7', 0);
    const sd = functionalStrength(1, 'min', 4);
    const ts = functionalStrength(0, 'maj', 3);
    const st = functionalStrength(3, 'maj', 0);
    expect(dt).toBeGreaterThan(sd);
    expect(sd).toBeGreaterThan(ts);
    expect(ts).toBeGreaterThan(st);
  });
});

describe('functionalWeight', () => {
  it('trance has high weight (strong functional pulls)', () => {
    expect(functionalWeight('trance')).toBeGreaterThan(0.5);
  });

  it('ambient has very low weight', () => {
    expect(functionalWeight('ambient')).toBeLessThan(0.2);
  });

  it('disco is high (strong grooves)', () => {
    expect(functionalWeight('disco')).toBeGreaterThan(0.5);
  });

  it('syro is low (IDM subverts expectations)', () => {
    expect(functionalWeight('syro')).toBeLessThan(0.3);
  });
});

describe('functionalBias', () => {
  it('V7 → I gets positive bias in trance', () => {
    expect(functionalBias(4, 'dom7', 0, 'trance')).toBeGreaterThan(1.0);
  });

  it('V → IV retrogression gets negative bias', () => {
    expect(functionalBias(4, 'dom7', 3, 'trance')).toBeLessThan(1.0);
  });

  it('ambient has minimal bias (close to 1.0)', () => {
    const bias = functionalBias(4, 'dom7', 0, 'ambient');
    expect(Math.abs(bias - 1.0)).toBeLessThan(0.1);
  });

  it('bias scales with mood weight', () => {
    const tranceBias = functionalBias(4, 'dom7', 0, 'trance');
    const lofiBias = functionalBias(4, 'dom7', 0, 'lofi');
    // Trance has higher functional weight, so stronger bias
    expect(tranceBias - 1.0).toBeGreaterThan(lofiBias - 1.0);
  });
});
