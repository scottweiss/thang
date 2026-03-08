import { describe, it, expect } from 'vitest';
import {
  complementaryLpf,
  complementaryHpf,
  complementarityStrength,
} from './spectral-complementarity';

describe('complementaryLpf', () => {
  it('1.0 when no competitors', () => {
    expect(complementaryLpf('melody', ['drone', 'harmony'], 'lofi')).toBe(1.0);
  });

  it('bright layer opens up with bright competitor', () => {
    const lpf = complementaryLpf('melody', ['arp'], 'lofi');
    expect(lpf).toBeGreaterThan(1.0);
  });

  it('warm layer closes down with warm competitor', () => {
    const lpf = complementaryLpf('drone', ['atmosphere'], 'lofi');
    expect(lpf).toBeLessThan(1.0);
  });

  it('ambient corrects more than syro', () => {
    const ambient = complementaryLpf('melody', ['arp'], 'ambient');
    const syro = complementaryLpf('melody', ['arp'], 'syro');
    expect(Math.abs(ambient - 1.0)).toBeGreaterThan(Math.abs(syro - 1.0));
  });
});

describe('complementaryHpf', () => {
  it('1.0 when no competitors', () => {
    expect(complementaryHpf('drone', ['melody', 'arp'], 'lofi')).toBe(1.0);
  });

  it('bright layer raises HPF with bright competitor', () => {
    const hpf = complementaryHpf('melody', ['arp'], 'lofi');
    expect(hpf).toBeGreaterThan(1.0);
  });
});

describe('complementarityStrength', () => {
  it('ambient is highest', () => {
    expect(complementarityStrength('ambient')).toBe(0.60);
  });

  it('syro is low', () => {
    expect(complementarityStrength('syro')).toBe(0.30);
  });
});
