import { describe, it, expect } from 'vitest';
import {
  overlapAvoidanceGain,
  overlapSensitivity,
} from './voice-overlap-avoidance';

describe('overlapAvoidanceGain', () => {
  it('lower priority layer gets reduction when overlapping', () => {
    const gain = overlapAvoidanceGain('harmony', 'melody', 3, 'ambient');
    expect(gain).toBeLessThan(1.0);
  });

  it('higher priority layer stays neutral', () => {
    const gain = overlapAvoidanceGain('melody', 'harmony', 3, 'ambient');
    expect(gain).toBe(1.0);
  });

  it('no overlap when far apart', () => {
    const gain = overlapAvoidanceGain('harmony', 'melody', 15, 'ambient');
    expect(gain).toBe(1.0);
  });

  it('closer overlap = more reduction', () => {
    const close = overlapAvoidanceGain('harmony', 'melody', 2, 'ambient');
    const far = overlapAvoidanceGain('harmony', 'melody', 10, 'ambient');
    expect(close).toBeLessThan(far);
  });

  it('ambient is more sensitive than syro', () => {
    const amb = overlapAvoidanceGain('harmony', 'melody', 3, 'ambient');
    const syro = overlapAvoidanceGain('harmony', 'melody', 3, 'syro');
    expect(amb).toBeLessThan(syro);
  });

  it('stays in 0.94-1.0 range', () => {
    for (let s = 0; s <= 12; s++) {
      const gain = overlapAvoidanceGain('harmony', 'melody', s, 'ambient');
      expect(gain).toBeGreaterThanOrEqual(0.94);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('overlapSensitivity', () => {
  it('ambient is highest', () => {
    expect(overlapSensitivity('ambient')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(overlapSensitivity('syro')).toBe(0.25);
  });
});
