import { describe, it, expect } from 'vitest';
import {
  rangeCenteringGain,
  centeringStrength,
} from './melodic-range-centering';

describe('rangeCenteringGain', () => {
  it('near center is close to 1.0', () => {
    const gain = rangeCenteringGain(67, 'melody', 'lofi');
    expect(gain).toBeGreaterThanOrEqual(1.0);
  });

  it('far from center gets reduction', () => {
    const gain = rangeCenteringGain(48, 'melody', 'lofi');
    expect(gain).toBeLessThan(1.0);
  });

  it('lofi centers more than syro', () => {
    const lofi = rangeCenteringGain(48, 'melody', 'lofi');
    const syro = rangeCenteringGain(48, 'melody', 'syro');
    expect(lofi).toBeLessThanOrEqual(syro);
  });

  it('stays in 0.92-1.04 range', () => {
    for (let n = 48; n <= 84; n += 4) {
      const gain = rangeCenteringGain(n, 'melody', 'lofi');
      expect(gain).toBeGreaterThanOrEqual(0.92);
      expect(gain).toBeLessThanOrEqual(1.04);
    }
  });
});

describe('centeringStrength', () => {
  it('lofi is highest', () => {
    expect(centeringStrength('lofi')).toBe(0.55);
  });

  it('syro is low', () => {
    expect(centeringStrength('syro')).toBe(0.25);
  });
});
