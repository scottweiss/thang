import { describe, it, expect } from 'vitest';
import {
  registerCeiling,
  registerFloor,
  isInRegister,
  constrainToRegister,
  registralSensitivity,
} from './registral-climax';

describe('registerCeiling', () => {
  it('peak has highest ceiling', () => {
    const peak = registerCeiling('trance', 'peak', 0.5, 0.8);
    const intro = registerCeiling('trance', 'intro', 0.5, 0.3);
    expect(peak).toBeGreaterThan(intro);
  });

  it('build ceiling increases with progress', () => {
    const early = registerCeiling('trance', 'build', 0.1, 0.5);
    const late = registerCeiling('trance', 'build', 0.9, 0.5);
    expect(late).toBeGreaterThanOrEqual(early);
  });

  it('high tension opens register', () => {
    const low = registerCeiling('avril', 'groove', 0.5, 0.1);
    const high = registerCeiling('avril', 'groove', 0.5, 0.9);
    expect(high).toBeGreaterThanOrEqual(low);
  });

  it('ambient has minimal register restriction', () => {
    const peak = registerCeiling('ambient', 'peak', 0.5, 0.5);
    const intro = registerCeiling('ambient', 'intro', 0.5, 0.5);
    // Ambient has very low sensitivity, so difference is small
    expect(peak - intro).toBeLessThan(10);
  });
});

describe('registerFloor', () => {
  it('breakdown has lowest floor (warmth)', () => {
    const breakdown = registerFloor('trance', 'breakdown');
    const peak = registerFloor('trance', 'peak');
    expect(breakdown).toBeLessThan(peak);
  });

  it('ambient barely moves floor', () => {
    const intro = registerFloor('ambient', 'intro');
    const peak = registerFloor('ambient', 'peak');
    expect(Math.abs(intro - peak)).toBeLessThanOrEqual(2);
  });
});

describe('isInRegister', () => {
  it('note within range returns true', () => {
    expect(isInRegister(60, 48, 84)).toBe(true);
  });

  it('note below floor returns false', () => {
    expect(isInRegister(36, 48, 84)).toBe(false);
  });

  it('note above ceiling returns false', () => {
    expect(isInRegister(96, 48, 84)).toBe(false);
  });

  it('boundary values are inclusive', () => {
    expect(isInRegister(48, 48, 84)).toBe(true);
    expect(isInRegister(84, 48, 84)).toBe(true);
  });
});

describe('constrainToRegister', () => {
  it('passes through rests', () => {
    expect(constrainToRegister('~', 48, 84)).toBe('~');
  });

  it('keeps note in range', () => {
    expect(constrainToRegister('C4', 48, 84)).toBe('C4');
  });

  it('transposes down if above ceiling', () => {
    const result = constrainToRegister('C7', 48, 84);
    const oct = parseInt(result.match(/\d+$/)?.[0] ?? '7');
    expect(oct).toBeLessThan(7);
  });

  it('transposes up if below floor', () => {
    const result = constrainToRegister('C2', 48, 84);
    const oct = parseInt(result.match(/\d+$/)?.[0] ?? '2');
    expect(oct).toBeGreaterThan(2);
  });

  it('preserves note name', () => {
    const result = constrainToRegister('F#6', 48, 72);
    expect(result.startsWith('F#')).toBe(true);
  });
});

describe('registralSensitivity', () => {
  it('trance has highest', () => {
    expect(registralSensitivity('trance')).toBe(0.60);
  });

  it('ambient has lowest', () => {
    expect(registralSensitivity('ambient')).toBe(0.05);
  });
});
