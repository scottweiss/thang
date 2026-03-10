import { describe, it, expect, beforeEach } from 'vitest';
import { SectionManager } from './section-manager';
import { GenerativeState, Mood, Section } from '../types';

function makeState(mood: Mood = 'ambient', section: Section = 'intro'): GenerativeState {
  return {
    scale: { root: 'C', type: 'major', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
    currentChord: { symbol: 'Cmaj', root: 'C', quality: 'maj', notes: ['C', 'E', 'G'], degree: 0 },
    chordHistory: [],
    progressionIndex: 0,
    mood,
    params: { tempo: 90, density: 0.5, brightness: 0.5, spaciousness: 0.5 },
    elapsed: 0,
    lastChordChange: 0,
    lastScaleChange: 0,
    tick: 0,
    chordChanged: false,
    scaleChanged: false,
    section,
    sectionChanged: false,
    activeLayers: new Set(['drone', 'atmosphere']),
    layerGainMultipliers: {
      drone: 1, harmony: 0, melody: 0, texture: 0, arp: 0, atmosphere: 1,
    },
    tension: { structural: 0.3, harmonic: 0.3, rhythmic: 0.3, overall: 0.3 },
    layerCenterPitches: {},
    ticksSinceChordChange: 0,
    layerPhraseDensity: {},
    layerStepPattern: {},
    sectionProgress: 0,
  };
}

describe('SectionManager', () => {
  let mgr: SectionManager;

  beforeEach(() => {
    mgr = new SectionManager();
  });

  describe('SectionConfig compositional directives', () => {
    it('populates sectionDirectives on evolve for intro', () => {
      const state = makeState('lofi', 'intro');
      mgr.evolve(state, 1);
      expect(state.sectionDirectives).toBeDefined();
      expect(state.sectionDirectives!.harmonicRhythm).toBe('slow');
      expect(state.sectionDirectives!.contrastingMelody).toBe(false);
      expect(state.sectionDirectives!.arrangementDensity).toBe('sparse');
    });

    it('populates sectionDirectives on evolve for build', () => {
      const state = makeState('trance', 'build');
      mgr.evolve(state, 1);
      expect(state.sectionDirectives).toBeDefined();
      expect(state.sectionDirectives!.harmonicRhythm).toBe('accelerating');
      expect(state.sectionDirectives!.arrangementDensity).toBe('normal');
    });

    it('populates sectionDirectives on evolve for peak', () => {
      const state = makeState('disco', 'peak');
      mgr.evolve(state, 1);
      expect(state.sectionDirectives).toBeDefined();
      expect(state.sectionDirectives!.harmonicRhythm).toBe('normal');
      expect(state.sectionDirectives!.arrangementDensity).toBe('full');
    });

    it('populates sectionDirectives on evolve for breakdown with contrastingMelody', () => {
      const state = makeState('avril', 'breakdown');
      mgr.evolve(state, 1);
      expect(state.sectionDirectives).toBeDefined();
      expect(state.sectionDirectives!.harmonicRhythm).toBe('slow');
      expect(state.sectionDirectives!.contrastingMelody).toBe(true);
      expect(state.sectionDirectives!.arrangementDensity).toBe('sparse');
    });

    it('populates sectionDirectives on evolve for groove', () => {
      const state = makeState('syro', 'groove');
      mgr.evolve(state, 1);
      expect(state.sectionDirectives).toBeDefined();
      expect(state.sectionDirectives!.harmonicRhythm).toBe('normal');
      expect(state.sectionDirectives!.arrangementDensity).toBe('full');
    });

    it('works for all 10 moods', () => {
      const moods: Mood[] = [
        'ambient', 'downtempo', 'lofi', 'trance', 'avril',
        'xtal', 'syro', 'blockhead', 'flim', 'disco',
      ];
      const sections: Section[] = ['intro', 'build', 'peak', 'breakdown', 'groove'];
      for (const mood of moods) {
        for (const section of sections) {
          const state = makeState(mood, section);
          mgr.evolve(state, 1);
          expect(state.sectionDirectives).toBeDefined();
          expect(['slow', 'normal', 'accelerating']).toContain(state.sectionDirectives!.harmonicRhythm);
          expect(typeof state.sectionDirectives!.contrastingMelody).toBe('boolean');
          expect(['sparse', 'normal', 'full']).toContain(state.sectionDirectives!.arrangementDensity);
        }
      }
    });
  });

  describe('getIntroLayers', () => {
    it('returns intro active layers for a mood', () => {
      const layers = mgr.getIntroLayers('ambient');
      expect(layers).toContain('drone');
      expect(layers).toContain('atmosphere');
    });
  });

  describe('getSectionProgress', () => {
    it('starts at 0', () => {
      expect(mgr.getSectionProgress()).toBe(0);
    });

    it('increases after evolve', () => {
      const state = makeState('ambient', 'intro');
      mgr.reset('ambient');
      mgr.evolve(state, 5);
      expect(mgr.getSectionProgress()).toBeGreaterThan(0);
    });
  });
});
