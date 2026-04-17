import type { Mood, Section } from '../types';

export type ArrangementMomentType = 'drop' | 'spotlight';

export interface ArrangementMoment {
  type: ArrangementMomentType;
  durationBars: number;
  targetLayer?: string;
}

const dropProb: Record<Mood, number> = {
  trance: 0.9,
  disco: 0.7,
  syro: 0.5,
  blockhead: 0.4,
  lofi: 0.2,
  downtempo: 0.15,
  flim: 0.1,
  xtal: 0.05,
  ambient: 0,
  plantasia: 0,
  avril: 0,
};

const spotlightProb: Record<Mood, number> = {
  lofi: 0.4,
  downtempo: 0.3,
  avril: 0.3,
  flim: 0.25,
  ambient: 0.2,
  plantasia: 0.2,
  xtal: 0.15,
  trance: 0.1,
  disco: 0.1,
  blockhead: 0.1,
  syro: 0.05,
};

export function checkArrangementMoment(
  fromSection: Section,
  toSection: Section,
  mood: Mood,
): ArrangementMoment | null {
  // No moment if sections are the same (not a transition)
  if (fromSection === toSection) return null;

  // Drop: build→peak only
  if (fromSection === 'build' && toSection === 'peak') {
    const prob = dropProb[mood];
    if (prob > 0 && Math.random() < prob) {
      return { type: 'drop', durationBars: 0 };
    }
  }

  // Spotlight: →breakdown only
  if (toSection === 'breakdown') {
    const prob = spotlightProb[mood];
    if (prob > 0 && Math.random() < prob) {
      const targetLayer = Math.random() < 0.7 ? 'melody' : 'harmony';
      return { type: 'spotlight', durationBars: 4, targetLayer };
    }
  }

  return null;
}

export function momentGainMultiplier(
  moment: ArrangementMoment,
  layerName: string,
): number {
  if (moment.type === 'drop') {
    return 0.0;
  }
  // spotlight
  if (moment.targetLayer === layerName) {
    return 1.0;
  }
  return 0.15;
}
