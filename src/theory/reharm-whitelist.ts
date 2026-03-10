import type { Mood } from '../types';

export type ReharmType =
  | 'modalInterchange'
  | 'relativeSub'
  | 'secondaryDominant'
  | 'negativeHarmony'
  | 'neoRiemannian'
  | 'tritoneSub'
  | 'chromaticApproach';

const WHITELIST: Record<Mood, ReharmType[]> = {
  lofi:      ['secondaryDominant', 'tritoneSub'],
  ambient:   ['neoRiemannian'],
  trance:    ['modalInterchange'],
  syro:      ['negativeHarmony', 'chromaticApproach'],
  avril:     ['relativeSub'],
  xtal:      ['neoRiemannian', 'modalInterchange'],
  downtempo: ['secondaryDominant', 'relativeSub'],
  blockhead: ['modalInterchange', 'chromaticApproach'],
  flim:      ['neoRiemannian', 'relativeSub'],
  disco:     ['secondaryDominant', 'modalInterchange'],
};

export function isReharmAllowed(mood: Mood, type: ReharmType): boolean {
  return WHITELIST[mood].includes(type);
}

export function getAllowedReharms(mood: Mood): ReharmType[] {
  return [...WHITELIST[mood]];
}
