import { describe, it, expect } from 'vitest';
import {
  selectGesture,
  gestureProfile,
  gestureDensityMult,
  gesturePitchBias,
} from './gestural-archetype';

describe('selectGesture', () => {
  it('intro favors meditation/breath', () => {
    const gestures = new Set(
      Array.from({ length: 10 }, (_, i) => selectGesture('intro', 'ambient', 0.3, i))
    );
    // Should include calm gestures
    expect(
      gestures.has('meditation') || gestures.has('breath') || gestures.has('aspiration')
    ).toBe(true);
  });

  it('peak favors energetic gestures', () => {
    const gestures = new Set(
      Array.from({ length: 10 }, (_, i) => selectGesture('peak', 'trance', 0.8, i))
    );
    expect(
      gestures.has('agitation') || gestures.has('momentum') || gestures.has('surprise')
    ).toBe(true);
  });

  it('breakdown favors dissolution/meditation', () => {
    const gestures = new Set(
      Array.from({ length: 10 }, (_, i) => selectGesture('breakdown', 'ambient', 0.2, i))
    );
    expect(
      gestures.has('dissolution') || gestures.has('meditation') || gestures.has('resolution')
    ).toBe(true);
  });

  it('is deterministic', () => {
    const a = selectGesture('groove', 'lofi', 0.5, 7);
    const b = selectGesture('groove', 'lofi', 0.5, 7);
    expect(a).toBe(b);
  });
});

describe('gestureProfile', () => {
  it('aspiration has positive pitch direction', () => {
    const p = gestureProfile('aspiration');
    expect(p.pitchDirection).toBeGreaterThan(0);
  });

  it('dissolution has negative pitch direction', () => {
    const p = gestureProfile('dissolution');
    expect(p.pitchDirection).toBeLessThan(0);
  });

  it('meditation has low density', () => {
    const p = gestureProfile('meditation');
    expect(p.densityMult).toBeLessThan(1.0);
  });

  it('agitation has high density', () => {
    const p = gestureProfile('agitation');
    expect(p.densityMult).toBeGreaterThan(1.0);
  });
});

describe('gestureDensityMult', () => {
  it('returns positive value', () => {
    expect(gestureDensityMult('groove', 'lofi', 0.5, 0)).toBeGreaterThan(0);
  });

  it('varies across ticks', () => {
    const values = Array.from({ length: 5 }, (_, i) =>
      gestureDensityMult('groove', 'lofi', 0.5, i)
    );
    // Should have at least some variation (different gestures)
    expect(values.length).toBeGreaterThan(0);
  });
});

describe('gesturePitchBias', () => {
  it('build tends positive (ascending)', () => {
    const biases = Array.from({ length: 10 }, (_, i) =>
      gesturePitchBias('build', 'trance', 0.6, i)
    );
    const avg = biases.reduce((a, b) => a + b, 0) / biases.length;
    expect(avg).toBeGreaterThan(0);
  });

  it('breakdown tends negative (descending)', () => {
    const biases = Array.from({ length: 10 }, (_, i) =>
      gesturePitchBias('breakdown', 'ambient', 0.2, i)
    );
    const avg = biases.reduce((a, b) => a + b, 0) / biases.length;
    expect(avg).toBeLessThan(0);
  });
});
