import { describe, it, expect } from 'vitest';
import {
  shouldModulate,
  modulationRatio,
  modulationSlowMult,
  modulationWindowTicks,
  modulationEnvelope,
  modulationTendency,
} from './metric-modulation';

describe('shouldModulate', () => {
  it('never modulates when section unchanged', () => {
    for (let i = 0; i < 100; i++) {
      expect(shouldModulate('groove', 'groove', 'syro', i)).toBe(false);
    }
  });

  it('is deterministic', () => {
    const a = shouldModulate('build', 'peak', 'lofi', 42);
    const b = shouldModulate('build', 'peak', 'lofi', 42);
    expect(a).toBe(b);
  });

  it('syro modulates more than ambient', () => {
    const syroCount = Array.from({ length: 200 }, (_, i) =>
      shouldModulate('build', 'peak', 'syro', i)
    ).filter(Boolean).length;
    const ambientCount = Array.from({ length: 200 }, (_, i) =>
      shouldModulate('build', 'peak', 'ambient', i)
    ).filter(Boolean).length;
    expect(syroCount).toBeGreaterThan(ambientCount);
  });
});

describe('modulationRatio', () => {
  it('build→peak is acceleration', () => {
    const ratio = modulationRatio('build', 'peak', 'syro', 0);
    expect(ratio).toBe('3:2'); // dramatic for syro
  });

  it('peak→breakdown is deceleration', () => {
    const ratio = modulationRatio('peak', 'breakdown', 'syro', 0);
    expect(ratio).toBe('2:3'); // dramatic for syro
  });

  it('mild moods get mild ratios', () => {
    const ratio = modulationRatio('build', 'peak', 'ambient', 0);
    expect(ratio).toBe('4:3'); // mild for ambient
  });
});

describe('modulationSlowMult', () => {
  it('3:2 = 1.5', () => {
    expect(modulationSlowMult('3:2')).toBe(1.5);
  });

  it('2:3 ≈ 0.667', () => {
    expect(modulationSlowMult('2:3')).toBeCloseTo(0.6667, 3);
  });

  it('4:3 ≈ 1.333', () => {
    expect(modulationSlowMult('4:3')).toBeCloseTo(1.3333, 3);
  });
});

describe('modulationWindowTicks', () => {
  it('fast moods get shorter windows', () => {
    expect(modulationWindowTicks('syro')).toBe(2);
  });

  it('slow moods get longer windows', () => {
    expect(modulationWindowTicks('ambient')).toBe(4);
  });

  it('moderate moods get medium windows', () => {
    expect(modulationWindowTicks('disco')).toBe(3);
  });
});

describe('modulationEnvelope', () => {
  it('starts at 1.0', () => {
    expect(modulationEnvelope(0, '3:2')).toBeCloseTo(1.0, 5);
  });

  it('ends at 1.0', () => {
    expect(modulationEnvelope(1, '3:2')).toBeCloseTo(1.0, 5);
  });

  it('peaks at midpoint', () => {
    const peak = modulationEnvelope(0.5, '3:2');
    expect(peak).toBeCloseTo(1.5, 5); // 1.0 + (1.5 - 1.0) * sin(π*0.5)
  });

  it('deceleration dips below 1.0 at midpoint', () => {
    const dip = modulationEnvelope(0.5, '2:3');
    expect(dip).toBeLessThan(1.0);
    expect(dip).toBeCloseTo(2 / 3, 5);
  });

  it('clamps progress to 0-1', () => {
    expect(modulationEnvelope(-0.5, '3:2')).toBeCloseTo(1.0, 5);
    expect(modulationEnvelope(1.5, '3:2')).toBeCloseTo(1.0, 5);
  });
});

describe('modulationTendency', () => {
  it('syro has highest tendency', () => {
    expect(modulationTendency('syro')).toBe(0.35);
  });

  it('ambient has lowest tendency', () => {
    expect(modulationTendency('ambient')).toBe(0.03);
  });
});
