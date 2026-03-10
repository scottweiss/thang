import { describe, it, expect } from 'vitest';
import {
  selectArc,
  getArc,
  getAllArcTypes,
  getCurrentArcPhase,
  arcTensionCeiling,
  arcSectionPreference,
  arcEnergyTarget,
} from './narrative-arc';
import type { Mood } from '../types';

const ALL_MOODS: Mood[] = [
  'ambient', 'downtempo', 'lofi', 'trance', 'avril',
  'xtal', 'syro', 'blockhead', 'flim', 'disco',
];

describe('selectArc', () => {
  it('returns a valid arc for each mood', () => {
    const validTypes = new Set(getAllArcTypes());
    for (const mood of ALL_MOODS) {
      const arc = selectArc(mood);
      expect(validTypes.has(arc.type)).toBe(true);
      expect(arc.phases.length).toBeGreaterThan(0);
    }
  });
});

describe('getArc', () => {
  it('returns correct arc for each type', () => {
    for (const type of getAllArcTypes()) {
      const arc = getArc(type);
      expect(arc.type).toBe(type);
      expect(arc.phases.length).toBeGreaterThan(0);
    }
  });
});

describe('getAllArcTypes', () => {
  it('returns all 5 types', () => {
    const types = getAllArcTypes();
    expect(types).toHaveLength(5);
    expect(types).toContain('journey');
    expect(types).toContain('meditation');
    expect(types).toContain('dance');
    expect(types).toContain('elegy');
    expect(types).toContain('triumph');
  });
});

describe('getCurrentArcPhase', () => {
  const journey = getArc('journey');

  it('returns first phase at progress 0', () => {
    const { phase, phaseIndex, phaseProgress } = getCurrentArcPhase(journey, 0);
    expect(phaseIndex).toBe(0);
    expect(phase.name).toBe('departure');
    expect(phaseProgress).toBeCloseTo(0, 5);
  });

  it('returns last phase at progress 1', () => {
    const { phase, phaseIndex } = getCurrentArcPhase(journey, 1);
    expect(phaseIndex).toBe(journey.phases.length - 1);
    expect(phase.name).toBe('homecoming');
  });

  it('returns middle phases at middle progress', () => {
    // Journey: departure=0.15, wonder=0.20, challenge=0.25
    // At 0.36 we should be in 'challenge' (0.35-0.60)
    const { phase, phaseIndex } = getCurrentArcPhase(journey, 0.36);
    expect(phaseIndex).toBe(2);
    expect(phase.name).toBe('challenge');
  });

  it('clamps negative progress to 0', () => {
    const { phaseIndex } = getCurrentArcPhase(journey, -0.5);
    expect(phaseIndex).toBe(0);
  });

  it('clamps progress > 1 to last phase', () => {
    const { phaseIndex } = getCurrentArcPhase(journey, 1.5);
    expect(phaseIndex).toBe(journey.phases.length - 1);
  });
});

describe('arcTensionCeiling', () => {
  it('returns values between 0 and 1', () => {
    for (const type of getAllArcTypes()) {
      const arc = getArc(type);
      for (let p = 0; p <= 1; p += 0.05) {
        const ceiling = arcTensionCeiling(arc, p);
        expect(ceiling).toBeGreaterThanOrEqual(0);
        expect(ceiling).toBeLessThanOrEqual(1);
      }
    }
  });

  it('interpolates smoothly near phase boundaries', () => {
    const journey = getArc('journey');
    // Departure (ceiling 0.4) -> Wonder (ceiling 0.6)
    // Boundary is at 0.15. The last 30% of departure is 0.15 * 0.7 = 0.105 to 0.15
    // At phaseProgress 0.85 (which is progress ~0.1275), should be partway between 0.4 and 0.6
    const atBoundary = arcTensionCeiling(journey, 0.13);
    expect(atBoundary).toBeGreaterThan(0.4);
    expect(atBoundary).toBeLessThan(0.6);
  });
});

describe('arcSectionPreference', () => {
  it('returns positive weights for all sections', () => {
    const sections = ['intro', 'build', 'peak', 'breakdown', 'groove'] as const;
    for (const type of getAllArcTypes()) {
      const arc = getArc(type);
      for (let p = 0; p <= 1; p += 0.25) {
        const pref = arcSectionPreference(arc, p);
        for (const s of sections) {
          expect(pref[s]).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});

describe('arcEnergyTarget', () => {
  it('returns values between 0 and 1', () => {
    for (const type of getAllArcTypes()) {
      const arc = getArc(type);
      for (let p = 0; p <= 1; p += 0.05) {
        const energy = arcEnergyTarget(arc, p);
        expect(energy).toBeGreaterThanOrEqual(0);
        expect(energy).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('arc phase durations', () => {
  it('sum to 1.0 for every arc', () => {
    for (const type of getAllArcTypes()) {
      const arc = getArc(type);
      const total = arc.phases.reduce((sum, phase) => sum + phase.duration, 0);
      expect(total).toBeCloseTo(1.0, 5);
    }
  });
});

describe('journey arc', () => {
  it('has higher tension in challenge than departure', () => {
    const journey = getArc('journey');
    const departure = journey.phases.find(p => p.name === 'departure')!;
    const challenge = journey.phases.find(p => p.name === 'challenge')!;
    expect(challenge.tensionCeiling).toBeGreaterThan(departure.tensionCeiling);
  });
});

describe('dance arc', () => {
  it('has highest energy in second_peak', () => {
    const dance = getArc('dance');
    const secondPeak = dance.phases.find(p => p.name === 'second_peak')!;
    for (const phase of dance.phases) {
      expect(secondPeak.energyTarget).toBeGreaterThanOrEqual(phase.energyTarget);
    }
  });
});

describe('meditation arc', () => {
  it('never exceeds tension ceiling of 0.5', () => {
    const meditation = getArc('meditation');
    for (const phase of meditation.phases) {
      expect(phase.tensionCeiling).toBeLessThanOrEqual(0.5);
    }
  });
});
