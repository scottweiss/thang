import { describe, it, expect } from 'vitest';
import {
  textureGradient,
  gradientDensityMultiplier,
  shouldApplyGradient,
  transitionSpeed,
} from './texture-gradient';

describe('textureGradient', () => {
  it('starts near from-section values', () => {
    const grad = textureGradient('breakdown', 'peak', 0.0, 'trance');
    expect(grad.density).toBeCloseTo(0.20, 1); // breakdown density
  });

  it('ends near to-section values', () => {
    const grad = textureGradient('breakdown', 'peak', 1.0, 'trance');
    expect(grad.density).toBeCloseTo(0.90, 1); // peak density
  });

  it('midpoint is between sections', () => {
    const grad = textureGradient('intro', 'build', 0.5, 'lofi');
    expect(grad.density).toBeGreaterThan(0.25);
    expect(grad.density).toBeLessThan(0.60);
  });

  it('returns all three properties', () => {
    const grad = textureGradient('build', 'peak', 0.5, 'downtempo');
    expect(grad.density).toBeDefined();
    expect(grad.complexity).toBeDefined();
    expect(grad.richness).toBeDefined();
  });

  it('same section returns constant values', () => {
    const grad = textureGradient('peak', 'peak', 0.5, 'trance');
    expect(grad.density).toBeCloseTo(0.90, 1);
  });
});

describe('gradientDensityMultiplier', () => {
  it('returns 1.0 when fully transitioned', () => {
    const mult = gradientDensityMultiplier('intro', 'peak', 1.0, 'trance');
    expect(mult).toBeCloseTo(1.0, 1);
  });

  it('returns < 1.0 early in build-to-peak transition', () => {
    // Early in transition, density is still lower than peak target
    const mult = gradientDensityMultiplier('breakdown', 'peak', 0.1, 'ambient');
    expect(mult).toBeLessThan(1.0);
  });
});

describe('shouldApplyGradient', () => {
  it('applies early in section', () => {
    expect(shouldApplyGradient(0.05, true, 'trance')).toBe(true);
  });

  it('does not apply late in section', () => {
    expect(shouldApplyGradient(0.8, false, 'trance')).toBe(false);
  });

  it('ambient has longer transition window than trance', () => {
    // At a late progress, ambient still applies but trance doesn't
    const ambientApplies = shouldApplyGradient(0.48, false, 'ambient');
    const tranceApplies = shouldApplyGradient(0.48, false, 'trance');
    expect(ambientApplies).toBe(true);
    expect(tranceApplies).toBe(false);
  });
});

describe('transitionSpeed', () => {
  it('trance is fastest', () => {
    expect(transitionSpeed('trance')).toBe(0.70);
  });

  it('ambient is slowest', () => {
    expect(transitionSpeed('ambient')).toBe(0.15);
  });
});
