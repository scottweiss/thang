import { describe, it, expect } from 'vitest';
import { checkArrangementMoment, momentGainMultiplier } from './arrangement-moment';

describe('checkArrangementMoment', () => {
  it('returns null for non-transition sections', () => {
    expect(checkArrangementMoment('groove', 'groove', 'trance')).toBeNull();
  });

  it('never returns drop for ambient', () => {
    for (let i = 0; i < 50; i++) {
      const m = checkArrangementMoment('build', 'peak', 'ambient');
      if (m) expect(m.type).not.toBe('drop');
    }
  });

  it('drop only triggers on build→peak', () => {
    for (let i = 0; i < 50; i++) {
      const m = checkArrangementMoment('peak', 'breakdown', 'trance');
      if (m) expect(m.type).not.toBe('drop');
    }
  });

  it('spotlight only triggers on →breakdown', () => {
    for (let i = 0; i < 50; i++) {
      const m = checkArrangementMoment('build', 'peak', 'lofi');
      if (m) expect(m.type).not.toBe('spotlight');
    }
  });

  it('trance build→peak often produces drop', () => {
    let drops = 0;
    for (let i = 0; i < 100; i++) {
      const m = checkArrangementMoment('build', 'peak', 'trance');
      if (m?.type === 'drop') drops++;
    }
    expect(drops).toBeGreaterThan(50); // 0.9 probability
  });
});

describe('momentGainMultiplier', () => {
  it('drop silences all layers', () => {
    const m = { type: 'drop' as const, durationBars: 0 };
    expect(momentGainMultiplier(m, 'melody')).toBe(0);
    expect(momentGainMultiplier(m, 'drone')).toBe(0);
  });

  it('spotlight boosts target, dims others', () => {
    const m = { type: 'spotlight' as const, durationBars: 4, targetLayer: 'melody' };
    expect(momentGainMultiplier(m, 'melody')).toBe(1.0);
    expect(momentGainMultiplier(m, 'harmony')).toBe(0.15);
    expect(momentGainMultiplier(m, 'drone')).toBe(0.15);
  });
});
