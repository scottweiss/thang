import { describe, it, expect } from 'vitest';
import {
  tensionFmColor,
  tensionDecayColor,
  tensionPanColor,
  shouldApplyTensionColor,
  colorSensitivity,
} from './harmonic-tension-color';

describe('tensionFmColor', () => {
  it('neutral tension = neutral FM', () => {
    expect(tensionFmColor(0.5, 'lofi')).toBeCloseTo(1.0, 1);
  });

  it('high tension = more FM', () => {
    expect(tensionFmColor(0.9, 'lofi')).toBeGreaterThan(1.0);
  });

  it('low tension = less FM', () => {
    expect(tensionFmColor(0.1, 'lofi')).toBeLessThan(1.0);
  });
});

describe('tensionDecayColor', () => {
  it('neutral = neutral decay', () => {
    expect(tensionDecayColor(0.5, 'avril')).toBeCloseTo(1.0, 1);
  });

  it('high tension = shorter decay', () => {
    expect(tensionDecayColor(0.9, 'avril')).toBeLessThan(1.0);
  });

  it('low tension = longer decay', () => {
    expect(tensionDecayColor(0.1, 'avril')).toBeGreaterThan(1.0);
  });
});

describe('tensionPanColor', () => {
  it('neutral = neutral pan', () => {
    expect(tensionPanColor(0.5, 'lofi')).toBeCloseTo(1.0, 1);
  });

  it('high tension = narrower', () => {
    expect(tensionPanColor(0.9, 'lofi')).toBeLessThan(1.0);
  });

  it('low tension = wider', () => {
    expect(tensionPanColor(0.1, 'lofi')).toBeGreaterThan(1.0);
  });
});

describe('shouldApplyTensionColor', () => {
  it('avril applies', () => {
    expect(shouldApplyTensionColor('avril')).toBe(true);
  });

  it('all moods above threshold apply', () => {
    // syro is 0.20 > 0.15
    expect(shouldApplyTensionColor('syro')).toBe(true);
  });
});

describe('colorSensitivity', () => {
  it('ambient and avril are highest', () => {
    expect(colorSensitivity('ambient')).toBe(0.50);
    expect(colorSensitivity('avril')).toBe(0.50);
  });

  it('syro is lowest', () => {
    expect(colorSensitivity('syro')).toBe(0.20);
  });
});
