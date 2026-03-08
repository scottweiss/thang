import { describe, it, expect } from 'vitest';
import {
  registerFatigueGain,
  fatigueRate,
} from './melodic-register-fatigue';

describe('registerFatigueGain', () => {
  it('fresh register is neutral', () => {
    const gain = registerFatigueGain(1, 'syro');
    expect(gain).toBe(1.0);
  });

  it('long stay gets reduction', () => {
    const gain = registerFatigueGain(8, 'syro');
    expect(gain).toBeLessThan(1.0);
  });

  it('fatigue increases with time', () => {
    const short = registerFatigueGain(3, 'syro');
    const long = registerFatigueGain(8, 'syro');
    expect(long).toBeLessThan(short);
  });

  it('syro fatigues faster than ambient', () => {
    const sy = registerFatigueGain(6, 'syro');
    const amb = registerFatigueGain(6, 'ambient');
    expect(sy).toBeLessThan(amb);
  });

  it('stays in 0.96-1.0 range', () => {
    for (let t = 0; t <= 10; t++) {
      const gain = registerFatigueGain(t, 'syro');
      expect(gain).toBeGreaterThanOrEqual(0.96);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('fatigueRate', () => {
  it('syro is highest', () => {
    expect(fatigueRate('syro')).toBe(0.55);
  });

  it('ambient is lowest', () => {
    expect(fatigueRate('ambient')).toBe(0.20);
  });
});
