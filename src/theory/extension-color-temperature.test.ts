import { describe, it, expect } from 'vitest';
import {
  chordTemperature,
  extensionColorLpf,
  colorSensitivity,
} from './extension-color-temperature';

describe('chordTemperature', () => {
  it('9th is warm (negative)', () => {
    expect(chordTemperature([0, 4, 7, 2])).toBeLessThan(0);
  });

  it('#11 is cool (positive)', () => {
    expect(chordTemperature([0, 4, 7, 6])).toBeGreaterThan(0);
  });

  it('plain triad is neutral', () => {
    expect(chordTemperature([0, 4, 7])).toBe(0);
  });

  it('stays in -1 to 1 range', () => {
    const temp = chordTemperature([1, 2, 6, 9, 10, 11]);
    expect(temp).toBeGreaterThanOrEqual(-1);
    expect(temp).toBeLessThanOrEqual(1);
  });

  it('empty returns 0', () => {
    expect(chordTemperature([])).toBe(0);
  });
});

describe('extensionColorLpf', () => {
  it('warm chord darkens', () => {
    const lpf = extensionColorLpf([0, 4, 7, 2], 'lofi'); // add9 = warm
    expect(lpf).toBeLessThan(1.0);
  });

  it('cool chord brightens', () => {
    const lpf = extensionColorLpf([0, 4, 7, 6], 'lofi'); // #11 = cool
    expect(lpf).toBeGreaterThan(1.0);
  });

  it('stays in 0.85-1.15 range', () => {
    const lpf = extensionColorLpf([1, 6, 11], 'xtal');
    expect(lpf).toBeGreaterThanOrEqual(0.85);
    expect(lpf).toBeLessThanOrEqual(1.15);
  });

  it('sensitive mood responds more', () => {
    const intervals = [0, 4, 7, 2]; // warm
    const lofi = extensionColorLpf(intervals, 'lofi');
    const trance = extensionColorLpf(intervals, 'trance');
    expect(Math.abs(lofi - 1.0)).toBeGreaterThan(Math.abs(trance - 1.0));
  });
});

describe('colorSensitivity', () => {
  it('lofi is highest', () => {
    expect(colorSensitivity('lofi')).toBe(0.60);
  });

  it('blockhead is low', () => {
    expect(colorSensitivity('blockhead')).toBe(0.20);
  });
});
