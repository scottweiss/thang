import { describe, it, expect } from 'vitest';
import {
  formPosition,
  currentPhase,
  energyEnvelope,
  tensionCeiling,
  trajectoryGainMultiplier,
  sectionPreference,
  moodFormLength,
} from './form-trajectory';

describe('formPosition', () => {
  it('returns 0 at start', () => {
    expect(formPosition({ ticksElapsed: 0, formLength: 100 })).toBe(0);
  });

  it('returns 1 at end', () => {
    expect(formPosition({ ticksElapsed: 100, formLength: 100 })).toBe(1);
  });

  it('returns 0.5 at midpoint', () => {
    expect(formPosition({ ticksElapsed: 50, formLength: 100 })).toBe(0.5);
  });

  it('clamps to 1 beyond form length', () => {
    expect(formPosition({ ticksElapsed: 200, formLength: 100 })).toBe(1);
  });

  it('handles zero form length', () => {
    expect(formPosition({ ticksElapsed: 50, formLength: 0 })).toBe(0.5);
  });
});

describe('currentPhase', () => {
  it('early ticks are establishing', () => {
    expect(currentPhase({ ticksElapsed: 10, formLength: 100 })).toBe('establishing');
  });

  it('mid ticks are rising', () => {
    expect(currentPhase({ ticksElapsed: 40, formLength: 100 })).toBe('rising');
  });

  it('late-mid ticks are climax', () => {
    expect(currentPhase({ ticksElapsed: 70, formLength: 100 })).toBe('climax');
  });

  it('final ticks are denouement', () => {
    expect(currentPhase({ ticksElapsed: 90, formLength: 100 })).toBe('denouement');
  });
});

describe('energyEnvelope', () => {
  it('is lower at start than at climax', () => {
    const early = energyEnvelope({ ticksElapsed: 5, formLength: 100 });
    const climax = energyEnvelope({ ticksElapsed: 70, formLength: 100 });
    expect(climax).toBeGreaterThan(early);
  });

  it('peaks near 70% position', () => {
    const at60 = energyEnvelope({ ticksElapsed: 60, formLength: 100 });
    const at70 = energyEnvelope({ ticksElapsed: 70, formLength: 100 });
    const at80 = energyEnvelope({ ticksElapsed: 80, formLength: 100 });
    expect(at70).toBeGreaterThanOrEqual(at60);
    expect(at70).toBeGreaterThanOrEqual(at80);
  });

  it('returns values between 0 and 1', () => {
    for (let i = 0; i <= 100; i++) {
      const e = energyEnvelope({ ticksElapsed: i, formLength: 100 });
      expect(e).toBeGreaterThanOrEqual(0);
      expect(e).toBeLessThanOrEqual(1);
    }
  });

  it('has a non-zero floor (never fully silent)', () => {
    const start = energyEnvelope({ ticksElapsed: 0, formLength: 100 });
    expect(start).toBeGreaterThan(0.2);
  });
});

describe('tensionCeiling', () => {
  it('establishing has lower ceiling than climax', () => {
    const early = tensionCeiling({ ticksElapsed: 10, formLength: 100 });
    const climax = tensionCeiling({ ticksElapsed: 70, formLength: 100 });
    expect(climax).toBeGreaterThan(early);
  });

  it('climax allows full tension', () => {
    expect(tensionCeiling({ ticksElapsed: 70, formLength: 100 })).toBe(1.0);
  });

  it('all values are positive', () => {
    for (let i = 0; i <= 100; i++) {
      expect(tensionCeiling({ ticksElapsed: i, formLength: 100 })).toBeGreaterThan(0);
    }
  });
});

describe('trajectoryGainMultiplier', () => {
  it('returns values in reasonable range', () => {
    for (let i = 0; i <= 100; i++) {
      const g = trajectoryGainMultiplier({ ticksElapsed: i, formLength: 100 });
      expect(g).toBeGreaterThanOrEqual(0.8);
      expect(g).toBeLessThanOrEqual(1.15);
    }
  });

  it('climax is louder than start', () => {
    const start = trajectoryGainMultiplier({ ticksElapsed: 0, formLength: 100 });
    const climax = trajectoryGainMultiplier({ ticksElapsed: 70, formLength: 100 });
    expect(climax).toBeGreaterThan(start);
  });
});

describe('sectionPreference', () => {
  it('establishing favors intro', () => {
    const pref = sectionPreference({ ticksElapsed: 10, formLength: 100 });
    expect(pref.intro).toBeGreaterThan(pref.peak);
  });

  it('climax favors peak', () => {
    const pref = sectionPreference({ ticksElapsed: 70, formLength: 100 });
    expect(pref.peak).toBeGreaterThan(pref.intro);
  });

  it('denouement favors breakdown', () => {
    const pref = sectionPreference({ ticksElapsed: 90, formLength: 100 });
    expect(pref.breakdown).toBeGreaterThan(pref.peak);
  });

  it('all values are positive', () => {
    const pref = sectionPreference({ ticksElapsed: 50, formLength: 100 });
    for (const v of Object.values(pref)) {
      expect(v).toBeGreaterThan(0);
    }
  });
});

describe('moodFormLength', () => {
  it('ambient has longest form', () => {
    expect(moodFormLength('ambient')).toBeGreaterThan(moodFormLength('syro'));
  });

  it('all moods return positive values', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    for (const m of moods) {
      expect(moodFormLength(m)).toBeGreaterThan(0);
    }
  });
});
