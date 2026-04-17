/**
 * Gestural archetypes — musical gestures with inherent emotional meaning.
 *
 * Certain musical shapes carry universal emotional associations:
 * - Rising lines = aspiration, hope, building energy
 * - Falling lines = resolution, calm, acceptance
 * - Rapid oscillation = agitation, excitement
 * - Sustained tone = stability, meditation
 * - Sudden leap = surprise, wonder
 * - Cascading descent = release, dissolution
 *
 * This module maps sections and emotional contexts to appropriate
 * gestural archetypes, then provides concrete musical parameters
 * (contour shape, velocity curve, density pattern) that embody
 * each gesture.
 *
 * The idea: instead of randomly generating musical parameters,
 * we start from "what emotion should this moment express?" and
 * derive the musical details from that intention.
 */

import type { Mood, Section } from '../types';

export type GestureType =
  | 'aspiration'    // rising, opening up
  | 'resolution'    // falling, settling
  | 'agitation'     // rapid, oscillating
  | 'meditation'    // sustained, still
  | 'surprise'      // sudden leap
  | 'dissolution'   // cascading descent
  | 'momentum'      // steady forward drive
  | 'breath';       // inhale-exhale cycle

export interface GestureProfile {
  /** Pitch direction tendency (-1 = falling, 0 = static, 1 = rising) */
  pitchDirection: number;
  /** Note density multiplier (0.5 = sparse, 2.0 = dense) */
  densityMult: number;
  /** Velocity curve shape ('crescendo' | 'decrescendo' | 'flat' | 'swell') */
  dynamicShape: 'crescendo' | 'decrescendo' | 'flat' | 'swell';
  /** Register tendency (higher = prefer upper register) */
  registerBias: number;
  /** Rhythmic regularity (0 = free, 1 = strict) */
  regularity: number;
}

/** Gesture → musical profile mapping */
const GESTURE_PROFILES: Record<GestureType, GestureProfile> = {
  aspiration: {
    pitchDirection: 0.7,
    densityMult: 1.2,
    dynamicShape: 'crescendo',
    registerBias: 0.6,
    regularity: 0.5,
  },
  resolution: {
    pitchDirection: -0.5,
    densityMult: 0.8,
    dynamicShape: 'decrescendo',
    registerBias: -0.3,
    regularity: 0.6,
  },
  agitation: {
    pitchDirection: 0.0,
    densityMult: 1.8,
    dynamicShape: 'swell',
    registerBias: 0.2,
    regularity: 0.3,
  },
  meditation: {
    pitchDirection: 0.0,
    densityMult: 0.4,
    dynamicShape: 'flat',
    registerBias: 0.0,
    regularity: 0.8,
  },
  surprise: {
    pitchDirection: 0.9,
    densityMult: 0.6,
    dynamicShape: 'crescendo',
    registerBias: 0.8,
    regularity: 0.2,
  },
  dissolution: {
    pitchDirection: -0.8,
    densityMult: 1.0,
    dynamicShape: 'decrescendo',
    registerBias: -0.5,
    regularity: 0.4,
  },
  momentum: {
    pitchDirection: 0.3,
    densityMult: 1.4,
    dynamicShape: 'flat',
    registerBias: 0.1,
    regularity: 0.7,
  },
  breath: {
    pitchDirection: 0.0,
    densityMult: 1.0,
    dynamicShape: 'swell',
    registerBias: 0.0,
    regularity: 0.5,
  },
};

/** Section → appropriate gestures */
const SECTION_GESTURES: Record<Section, GestureType[]> = {
  intro:     ['meditation', 'breath', 'aspiration'],
  build:     ['aspiration', 'momentum', 'agitation'],
  peak:      ['agitation', 'momentum', 'surprise'],
  breakdown: ['dissolution', 'meditation', 'resolution'],
  groove:    ['momentum', 'breath', 'aspiration'],
};

/** Mood weights for gesture selection */
const MOOD_GESTURE_AFFINITY: Record<Mood, Partial<Record<GestureType, number>>> = {
  ambient:   { meditation: 1.5, breath: 1.3, dissolution: 1.2 },
  plantasia: { meditation: 1.5, breath: 1.3, dissolution: 1.2 },
  xtal:      { meditation: 1.3, dissolution: 1.2, breath: 1.1 },
  downtempo: { breath: 1.3, resolution: 1.2, momentum: 1.1 },
  lofi:      { breath: 1.2, momentum: 1.1, resolution: 1.1 },
  avril:     { aspiration: 1.3, resolution: 1.2, breath: 1.1 },
  flim:      { meditation: 1.2, surprise: 1.1, breath: 1.1 },
  blockhead: { momentum: 1.3, agitation: 1.1, surprise: 1.1 },
  syro:      { agitation: 1.3, surprise: 1.2, momentum: 1.1 },
  disco:     { momentum: 1.4, agitation: 1.1 },
  trance:    { momentum: 1.5, aspiration: 1.2 },
};

/**
 * Select the most appropriate gesture for the current musical moment.
 *
 * @param section   Current section
 * @param mood      Current mood
 * @param tension   Current tension (0-1)
 * @param tick      Current tick (for variation)
 * @returns The selected gesture type
 */
export function selectGesture(
  section: Section,
  mood: Mood,
  tension: number,
  tick: number
): GestureType {
  const candidates = SECTION_GESTURES[section];
  const affinities = MOOD_GESTURE_AFFINITY[mood];

  // Score each candidate
  const scored = candidates.map(g => {
    let score = 1.0;
    // Mood affinity
    if (affinities[g]) score *= affinities[g]!;
    // Tension influences: high tension favors agitation/surprise
    if (tension > 0.7 && (g === 'agitation' || g === 'surprise')) score *= 1.3;
    if (tension < 0.3 && (g === 'meditation' || g === 'resolution')) score *= 1.3;
    return { gesture: g, score };
  });

  // Deterministic selection based on tick
  scored.sort((a, b) => b.score - a.score);
  const idx = tick % scored.length;
  return scored[idx].gesture;
}

/**
 * Get the musical profile for a gesture.
 */
export function gestureProfile(gesture: GestureType): GestureProfile {
  return { ...GESTURE_PROFILES[gesture] };
}

/**
 * Get a density multiplier from the current gesture context.
 * Can be applied to melody/arp density for gesture-appropriate phrasing.
 */
export function gestureDensityMult(
  section: Section,
  mood: Mood,
  tension: number,
  tick: number
): number {
  const gesture = selectGesture(section, mood, tension, tick);
  return GESTURE_PROFILES[gesture].densityMult;
}

/**
 * Get a pitch direction bias from the current gesture context.
 * Positive = favor ascending, negative = favor descending.
 */
export function gesturePitchBias(
  section: Section,
  mood: Mood,
  tension: number,
  tick: number
): number {
  const gesture = selectGesture(section, mood, tension, tick);
  return GESTURE_PROFILES[gesture].pitchDirection;
}
