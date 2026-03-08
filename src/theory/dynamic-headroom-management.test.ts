import { describe, it, expect } from 'vitest';
import {
  headroomGain,
  headroomDiscipline,
} from './dynamic-headroom-management';

describe('headroomGain', () => {
  it('peak has no reservation', () => {
    expect(headroomGain('trance', 'peak')).toBe(1.0);
  });

  it('build has most reservation', () => {
    const build = headroomGain('trance', 'build');
    const peak = headroomGain('trance', 'peak');
    expect(build).toBeLessThan(peak);
  });

  it('trance reserves more than syro', () => {
    const trance = headroomGain('trance', 'build');
    const syro = headroomGain('syro', 'build');
    expect(trance).toBeLessThan(syro);
  });

  it('stays in 0.88-1.0 range', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const s of sections) {
      const gain = headroomGain('trance', s);
      expect(gain).toBeGreaterThanOrEqual(0.88);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('headroomDiscipline', () => {
  it('avril is highest', () => {
    expect(headroomDiscipline('avril')).toBe(0.55);
  });

  it('syro is low', () => {
    expect(headroomDiscipline('syro')).toBe(0.25);
  });
});
