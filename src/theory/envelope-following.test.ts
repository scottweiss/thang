import { describe, it, expect } from 'vitest';
import {
  layerActivity,
  accompanimentGainResponse,
  shouldFollowEnvelope,
  followingLayers,
  followSensitivity,
} from './envelope-following';

describe('layerActivity', () => {
  it('all notes = 1.0', () => {
    expect(layerActivity('C4 E4 G4 C5')).toBe(1.0);
  });

  it('all rests = 0.0', () => {
    expect(layerActivity('~ ~ ~ ~')).toBe(0.0);
  });

  it('half notes = 0.5', () => {
    expect(layerActivity('C4 ~ E4 ~')).toBe(0.5);
  });

  it('empty = 0.0', () => {
    expect(layerActivity('')).toBe(0.0);
  });
});

describe('accompanimentGainResponse', () => {
  it('high lead activity = lower accompaniment', () => {
    const resp = accompanimentGainResponse(0.9, 'lofi', 'groove');
    expect(resp).toBeLessThan(1.0);
  });

  it('low lead activity = higher accompaniment', () => {
    const resp = accompanimentGainResponse(0.1, 'lofi', 'groove');
    expect(resp).toBeGreaterThan(1.0);
  });

  it('medium activity = near 1.0', () => {
    const resp = accompanimentGainResponse(0.5, 'lofi', 'groove');
    expect(resp).toBeCloseTo(1.0, 1);
  });

  it('clamps to 0.5-1.3', () => {
    expect(accompanimentGainResponse(1.0, 'lofi', 'breakdown')).toBeGreaterThanOrEqual(0.5);
    expect(accompanimentGainResponse(0.0, 'lofi', 'breakdown')).toBeLessThanOrEqual(1.3);
  });

  it('trance is less responsive than lofi', () => {
    const trance = accompanimentGainResponse(0.9, 'trance', 'groove');
    const lofi = accompanimentGainResponse(0.9, 'lofi', 'groove');
    // trance should be closer to 1.0 (less dip)
    expect(Math.abs(trance - 1.0)).toBeLessThan(Math.abs(lofi - 1.0));
  });
});

describe('shouldFollowEnvelope', () => {
  it('lofi in groove follows', () => {
    expect(shouldFollowEnvelope('lofi', 'groove')).toBe(true);
  });

  it('trance in intro does not follow', () => {
    expect(shouldFollowEnvelope('trance', 'intro')).toBe(false);
  });
});

describe('followingLayers', () => {
  it('lofi follows with many layers', () => {
    const layers = followingLayers('lofi');
    expect(layers).toContain('arp');
    expect(layers).toContain('harmony');
    expect(layers).toContain('atmosphere');
  });

  it('trance follows with fewer layers', () => {
    const layers = followingLayers('trance');
    expect(layers).toEqual(['arp']);
  });
});

describe('followSensitivity', () => {
  it('lofi is highest', () => {
    expect(followSensitivity('lofi')).toBe(0.50);
  });

  it('trance is lowest', () => {
    expect(followSensitivity('trance')).toBe(0.15);
  });
});
