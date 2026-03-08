import { describe, it, expect } from 'vitest';
import {
  subdivisionDecay,
  subdivisionSustain,
  articulationResponsiveness,
} from './subdivision-articulation';

describe('subdivisionDecay', () => {
  it('whole notes have longer decay', () => {
    const whole = subdivisionDecay(1, 'blockhead');
    const sixteenth = subdivisionDecay(16, 'blockhead');
    expect(whole).toBeGreaterThan(sixteenth);
  });

  it('stays in 0.5-1.5 range', () => {
    for (const sub of [1, 2, 4, 8, 16]) {
      const decay = subdivisionDecay(sub, 'avril');
      expect(decay).toBeGreaterThanOrEqual(0.5);
      expect(decay).toBeLessThanOrEqual(1.5);
    }
  });

  it('less responsive mood varies less', () => {
    const blockheadRange = subdivisionDecay(1, 'blockhead') - subdivisionDecay(16, 'blockhead');
    const ambientRange = subdivisionDecay(1, 'ambient') - subdivisionDecay(16, 'ambient');
    expect(blockheadRange).toBeGreaterThan(ambientRange);
  });
});

describe('subdivisionSustain', () => {
  it('fast notes have less sustain', () => {
    const slow = subdivisionSustain(1, 'flim');
    const fast = subdivisionSustain(16, 'flim');
    expect(slow).toBeGreaterThan(fast);
  });

  it('stays in 0.3-1.2 range', () => {
    for (const sub of [1, 2, 4, 8, 16]) {
      const sustain = subdivisionSustain(sub, 'blockhead');
      expect(sustain).toBeGreaterThanOrEqual(0.3);
      expect(sustain).toBeLessThanOrEqual(1.2);
    }
  });
});

describe('articulationResponsiveness', () => {
  it('blockhead is highest', () => {
    expect(articulationResponsiveness('blockhead')).toBe(0.60);
  });

  it('ambient is lowest', () => {
    expect(articulationResponsiveness('ambient')).toBe(0.25);
  });
});
