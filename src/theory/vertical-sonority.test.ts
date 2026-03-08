import { describe, it, expect } from 'vitest';
import {
  voicingRoughness,
  sonorityDistance,
  bestSonority,
  extensionImprovesSonority,
  targetRoughness,
  intervalRoughness,
} from './vertical-sonority';

describe('intervalRoughness', () => {
  it('unison is perfectly consonant', () => {
    expect(intervalRoughness(0)).toBe(0);
  });

  it('perfect 5th is very consonant', () => {
    expect(intervalRoughness(7)).toBeLessThan(0.1);
  });

  it('minor 2nd is very rough', () => {
    expect(intervalRoughness(1)).toBeGreaterThan(0.9);
  });

  it('tritone is rough', () => {
    expect(intervalRoughness(6)).toBeGreaterThan(0.6);
  });

  it('major 3rd is consonant', () => {
    expect(intervalRoughness(4)).toBeLessThan(0.3);
  });
});

describe('voicingRoughness', () => {
  it('returns 0 for single note', () => {
    expect(voicingRoughness(['C4'])).toBe(0);
  });

  it('major triad is relatively smooth', () => {
    const roughness = voicingRoughness(['C3', 'E3', 'G3']);
    expect(roughness).toBeLessThan(0.2);
  });

  it('minor 2nd cluster is very rough', () => {
    const roughness = voicingRoughness(['C4', 'Db4', 'D4']);
    expect(roughness).toBeGreaterThan(0.5);
  });

  it('open 5ths are relatively smooth', () => {
    // C3→G3 = P5 (0.05), G3→D4 = P5 (0.05), C3→D4 = M9/M2 (0.6)
    const roughness = voicingRoughness(['C3', 'G3', 'D4']);
    expect(roughness).toBeLessThan(0.25);
  });

  it('dom7 chord is moderately rough', () => {
    const roughness = voicingRoughness(['C3', 'E3', 'G3', 'Bb3']);
    expect(roughness).toBeGreaterThan(0.1);
    expect(roughness).toBeLessThan(0.5);
  });

  it('handles empty array', () => {
    expect(voicingRoughness([])).toBe(0);
  });
});

describe('targetRoughness', () => {
  it('ambient targets low roughness', () => {
    expect(targetRoughness('ambient', 'groove')).toBeLessThan(0.15);
  });

  it('syro targets high roughness', () => {
    expect(targetRoughness('syro', 'groove')).toBeGreaterThan(0.4);
  });

  it('peak section adds roughness', () => {
    const base = targetRoughness('lofi', 'groove');
    const peak = targetRoughness('lofi', 'peak');
    expect(peak).toBeGreaterThan(base);
  });

  it('intro section reduces roughness', () => {
    const base = targetRoughness('lofi', 'groove');
    const intro = targetRoughness('lofi', 'intro');
    expect(intro).toBeLessThan(base);
  });

  it('clamps to 0-1', () => {
    expect(targetRoughness('ambient', 'intro')).toBeGreaterThanOrEqual(0);
  });
});

describe('sonorityDistance', () => {
  it('returns 0 for perfect match', () => {
    // Major triad roughness ≈ 0.13, ambient+groove target ≈ 0.10 — close
    const dist = sonorityDistance(['C3', 'E3', 'G3'], 'ambient', 'groove');
    expect(dist).toBeLessThan(0.15);
  });

  it('cluster chord has high distance from ambient', () => {
    const dist = sonorityDistance(['C4', 'Db4', 'D4'], 'ambient', 'groove');
    expect(dist).toBeGreaterThan(0.4);
  });
});

describe('bestSonority', () => {
  it('picks the voicing closest to target', () => {
    const alternatives = [
      ['C4', 'Db4', 'D4'],   // cluster — very rough
      ['C3', 'E3', 'G3'],    // major triad — smooth
      ['C3', 'G3', 'D4'],    // open 5ths — very smooth
    ];
    // Ambient wants smooth — should prefer open 5ths or triad
    const best = bestSonority(alternatives, 'ambient', 'groove');
    expect(best).not.toBe(0); // not the cluster
  });

  it('syro prefers rougher voicings', () => {
    const alternatives = [
      ['C3', 'G3', 'D4'],     // open 5ths — very smooth
      ['C3', 'E3', 'Bb3'],    // 7th — moderate
    ];
    const best = bestSonority(alternatives, 'syro', 'peak');
    // Syro at peak wants ~0.6 roughness, the 7th voicing is closer
    expect(best).toBe(1);
  });

  it('handles empty alternatives', () => {
    expect(bestSonority([], 'lofi', 'groove')).toBe(0);
  });
});

describe('extensionImprovesSonority', () => {
  it('adding 7th improves sonority for jazz moods', () => {
    const base = ['C3', 'E3', 'G3'];
    // Lofi wants ~0.4 roughness, adding Bb3 (minor 7th) adds crunch
    const improves = extensionImprovesSonority(base, 'Bb3', 'lofi', 'groove');
    expect(improves).toBe(true);
  });

  it('adding minor 2nd does not improve ambient sonority', () => {
    const base = ['C3', 'E3', 'G3'];
    // Ambient wants ~0.1 roughness, Db3 would be harsh
    const improves = extensionImprovesSonority(base, 'Db3', 'ambient', 'groove');
    expect(improves).toBe(false);
  });
});
