import { describe, it, expect } from 'vitest';
import {
  isStructuralDownbeat,
  downbeatGainBoost,
  downbeatBrightnessBoost,
  downbeatDecayTicks,
  decayedEmphasis,
  downbeatEmphasis,
} from './structural-downbeat';

describe('isStructuralDownbeat', () => {
  it('section change is a downbeat', () => {
    expect(isStructuralDownbeat(true, false, 5)).toBe(true);
  });

  it('grand pause ending is a downbeat', () => {
    expect(isStructuralDownbeat(false, true, 5)).toBe(true);
  });

  it('first tick after silence is a downbeat', () => {
    expect(isStructuralDownbeat(false, false, 1)).toBe(true);
  });

  it('normal tick is not a downbeat', () => {
    expect(isStructuralDownbeat(false, false, 5)).toBe(false);
  });
});

describe('downbeatGainBoost', () => {
  it('trance peak has highest boost', () => {
    const boost = downbeatGainBoost('trance', 'peak');
    expect(boost).toBeGreaterThan(1.15);
  });

  it('ambient intro has minimal boost', () => {
    const boost = downbeatGainBoost('ambient', 'intro');
    expect(boost).toBeLessThan(1.02);
  });

  it('always >= 1.0', () => {
    expect(downbeatGainBoost('ambient', 'intro')).toBeGreaterThanOrEqual(1.0);
  });
});

describe('downbeatBrightnessBoost', () => {
  it('trance is brightest', () => {
    expect(downbeatBrightnessBoost('trance')).toBeGreaterThan(1.08);
  });

  it('ambient barely brightens', () => {
    expect(downbeatBrightnessBoost('ambient')).toBeLessThan(1.02);
  });
});

describe('downbeatDecayTicks', () => {
  it('dramatic moods decay over 3 ticks', () => {
    expect(downbeatDecayTicks('trance')).toBe(3);
  });

  it('subtle moods decay over 1 tick', () => {
    expect(downbeatDecayTicks('ambient')).toBe(1);
  });
});

describe('decayedEmphasis', () => {
  it('highest at tick 0', () => {
    const t0 = decayedEmphasis(0, 'trance');
    const t1 = decayedEmphasis(1, 'trance');
    expect(t0).toBeGreaterThan(t1);
  });

  it('returns 1.0 after decay period', () => {
    const decay = downbeatDecayTicks('trance');
    expect(decayedEmphasis(decay, 'trance')).toBe(1.0);
  });

  it('negative ticks return 1.0', () => {
    expect(decayedEmphasis(-1, 'trance')).toBe(1.0);
  });
});

describe('downbeatEmphasis', () => {
  it('trance has highest', () => {
    expect(downbeatEmphasis('trance')).toBe(0.55);
  });

  it('ambient has lowest', () => {
    expect(downbeatEmphasis('ambient')).toBe(0.05);
  });
});
