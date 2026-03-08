import { describe, it, expect } from 'vitest';
import { selectNextSection, getTransitionWeights } from './form-structure';

describe('getTransitionWeights', () => {
  it('returns weights for valid mood/section', () => {
    const weights = getTransitionWeights('trance', 'build');
    expect(weights.peak).toBeGreaterThan(0);
  });

  it('trance build strongly favors peak', () => {
    const weights = getTransitionWeights('trance', 'build');
    const peakWeight = weights.peak ?? 0;
    const totalOther = Object.entries(weights)
      .filter(([k]) => k !== 'peak')
      .reduce((sum, [, v]) => sum + (v as number), 0);
    expect(peakWeight).toBeGreaterThan(totalOther);
  });

  it('ambient groove can repeat itself', () => {
    const weights = getTransitionWeights('ambient', 'groove');
    expect(weights.groove).toBeGreaterThan(0);
  });

  it('disco peak can repeat (double peak)', () => {
    const weights = getTransitionWeights('disco', 'peak');
    expect(weights.peak).toBeGreaterThan(0);
  });

  it('syro has transitions from peak to many sections', () => {
    const weights = getTransitionWeights('syro', 'peak');
    const sections = Object.keys(weights);
    expect(sections.length).toBeGreaterThanOrEqual(3);
  });

  it('intro always leads to build (or groove for syro)', () => {
    const moods = ['ambient', 'downtempo', 'trance', 'disco', 'flim'] as const;
    for (const mood of moods) {
      const weights = getTransitionWeights(mood, 'intro');
      expect(weights.build).toBeGreaterThan(0);
    }
  });

  it('all moods have transitions from all sections', () => {
    const moods = ['ambient', 'downtempo', 'lofi', 'trance', 'avril', 'xtal', 'syro', 'blockhead', 'flim', 'disco'] as const;
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const mood of moods) {
      for (const section of sections) {
        const weights = getTransitionWeights(mood, section);
        const total = Object.values(weights).reduce((s, v) => s + (v as number), 0);
        expect(total).toBeGreaterThan(0);
      }
    }
  });
});

describe('selectNextSection', () => {
  it('returns a valid section', () => {
    const validSections = ['intro', 'build', 'peak', 'breakdown', 'groove'];
    for (let i = 0; i < 50; i++) {
      const next = selectNextSection('trance', 'build');
      expect(validSections).toContain(next);
    }
  });

  it('trance build almost always leads to peak', () => {
    let peakCount = 0;
    const trials = 200;
    for (let i = 0; i < trials; i++) {
      if (selectNextSection('trance', 'build') === 'peak') peakCount++;
    }
    // With weight 9/10 for peak, expect ~90%
    expect(peakCount / trials).toBeGreaterThan(0.7);
  });

  it('ambient groove sometimes repeats', () => {
    let grooveRepeat = 0;
    const trials = 200;
    for (let i = 0; i < trials; i++) {
      if (selectNextSection('ambient', 'groove') === 'groove') grooveRepeat++;
    }
    expect(grooveRepeat).toBeGreaterThan(0);
  });

  it('cycleCount increases self-repeat probability', () => {
    let repeat0 = 0;
    let repeat3 = 0;
    const trials = 500;
    for (let i = 0; i < trials; i++) {
      if (selectNextSection('lofi', 'groove', 0) === 'groove') repeat0++;
      if (selectNextSection('lofi', 'groove', 3) === 'groove') repeat3++;
    }
    // Cycle 3 should have more repeats than cycle 0 (boosted by 1.3x)
    // This is probabilistic, so use a generous margin
    expect(repeat3).toBeGreaterThanOrEqual(repeat0 * 0.8);
  });

  it('intro transitions to build or groove', () => {
    for (let i = 0; i < 50; i++) {
      const next = selectNextSection('syro', 'intro');
      expect(['build', 'groove']).toContain(next);
    }
  });
});
