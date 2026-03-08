import { describe, it, expect } from 'vitest';
import {
  cambiataScore,
  cambiataFigureGain,
  cambiataStrengthValue,
} from './melodic-cambiata-figure';

describe('cambiataScore', () => {
  it('perfect cambiata scores 1', () => {
    // step up, leap 3rd up, step back down
    expect(cambiataScore(2, 3, -1)).toBe(1.0);
  });

  it('descending cambiata scores 1', () => {
    expect(cambiataScore(-1, -4, 2)).toBe(1.0);
  });

  it('no step start scores 0', () => {
    expect(cambiataScore(5, 3, -1)).toBe(0);
  });

  it('no 3rd leap scores 0', () => {
    expect(cambiataScore(2, 7, -1)).toBe(0);
  });

  it('same direction throughout scores 0', () => {
    expect(cambiataScore(2, 3, 1)).toBe(0);
  });

  it('opposite direction for leap scores 0', () => {
    expect(cambiataScore(2, -3, 1)).toBe(0);
  });
});

describe('cambiataFigureGain', () => {
  it('cambiata gets boost', () => {
    const gain = cambiataFigureGain(2, 3, -1, 'avril', 'peak');
    expect(gain).toBeGreaterThan(1.0);
  });

  it('non-cambiata is neutral', () => {
    const gain = cambiataFigureGain(5, 3, -1, 'avril', 'peak');
    expect(gain).toBe(1.0);
  });

  it('avril boosts more than blockhead', () => {
    const av = cambiataFigureGain(2, 3, -1, 'avril', 'peak');
    const bh = cambiataFigureGain(2, 3, -1, 'blockhead', 'peak');
    expect(av).toBeGreaterThan(bh);
  });

  it('stays in 1.0-1.03 range', () => {
    const gain = cambiataFigureGain(2, 3, -1, 'avril', 'peak');
    expect(gain).toBeGreaterThanOrEqual(1.0);
    expect(gain).toBeLessThanOrEqual(1.03);
  });
});

describe('cambiataStrengthValue', () => {
  it('avril is highest', () => {
    expect(cambiataStrengthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(cambiataStrengthValue('blockhead')).toBe(0.10);
  });
});
