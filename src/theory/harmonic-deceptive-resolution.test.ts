import { describe, it, expect } from 'vitest';
import {
  deceptiveResolutionLpf,
  deceptiveDepthValue,
} from './harmonic-deceptive-resolution';

describe('deceptiveResolutionLpf', () => {
  it('V→vi gets warmth', () => {
    const lpf = deceptiveResolutionLpf(5, 6, 'avril', 'breakdown');
    expect(lpf).toBeLessThan(1.0);
  });

  it('V→I is not deceptive', () => {
    const lpf = deceptiveResolutionLpf(5, 1, 'avril', 'peak');
    expect(lpf).toBe(1.0);
  });

  it('non-dominant previous is neutral', () => {
    const lpf = deceptiveResolutionLpf(4, 6, 'avril', 'peak');
    expect(lpf).toBe(1.0);
  });

  it('V→vi warmer than V→ii', () => {
    const vi = deceptiveResolutionLpf(5, 6, 'avril', 'peak');
    const ii = deceptiveResolutionLpf(5, 2, 'avril', 'peak');
    expect(vi).toBeLessThan(ii);
  });

  it('avril warms more than blockhead', () => {
    const av = deceptiveResolutionLpf(5, 6, 'avril', 'peak');
    const bh = deceptiveResolutionLpf(5, 6, 'blockhead', 'peak');
    expect(av).toBeLessThan(bh);
  });

  it('stays in 0.92-1.0 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const s of sections) {
      for (let d = 1; d <= 7; d++) {
        const lpf = deceptiveResolutionLpf(5, d, 'avril', s);
        expect(lpf).toBeGreaterThanOrEqual(0.92);
        expect(lpf).toBeLessThanOrEqual(1.0);
      }
    }
  });
});

describe('deceptiveDepthValue', () => {
  it('avril is highest', () => {
    expect(deceptiveDepthValue('avril')).toBe(0.55);
  });

  it('blockhead is lowest', () => {
    expect(deceptiveDepthValue('blockhead')).toBe(0.20);
  });
});
