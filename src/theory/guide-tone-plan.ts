/**
 * Guide tone path planning — smooth inner voice paths across chord sequences.
 *
 * While guide-tones.ts handles voice leading between two adjacent chords,
 * this module plans ahead: given the current chord and a lookahead hint,
 * it pre-plans where the 3rd and 7th should go, choosing paths that
 * create the smoothest possible inner melody across multiple changes.
 *
 * Example: if we know Dm7 → G7 → Cmaj7 is coming:
 *   3rd path: F → F → E  (common tone, then step down)
 *   7th path: C → B → B  (step down, then common tone)
 *
 * When the lookahead suggests the next chord will have a guide tone
 * that's a step away from the current one, we can prepare the voice
 * to lean toward it — creating anticipatory voice leading.
 *
 * This also detects when guide tones create interesting patterns:
 * - Contrary motion (3rd goes up while 7th goes down)
 * - Parallel motion (both move in same direction — usually avoid)
 * - Oblique motion (one stays, one moves — very smooth)
 */

import type { Mood, ChordQuality } from '../types';

const NOTE_TO_MIDI: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

const MIDI_TO_NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function rootToPc(root: string): number {
  return NOTE_TO_MIDI[root] ?? 0;
}

/** Get the 3rd of a chord (pitch class relative to root) */
function thirdPc(quality: ChordQuality): number {
  switch (quality) {
    case 'min': case 'min7': case 'min9': case 'dim': return 3;  // minor 3rd
    case 'sus2': return 2;  // suspended 2nd
    case 'sus4': return 5;  // suspended 4th
    default: return 4;      // major 3rd
  }
}

/** Get the 7th of a chord (pitch class relative to root), or -1 if none */
function seventhPc(quality: ChordQuality): number {
  switch (quality) {
    case 'maj7': return 11;  // major 7th
    case 'min7': case 'dom7': case 'min9': return 10;  // minor 7th
    case 'dim': return 9;    // diminished 7th (actually bb7)
    default: return -1;      // no 7th
  }
}

export interface GuideTonePath {
  /** Current 3rd pitch class (0-11) */
  third: number;
  /** Current 7th pitch class (0-11, or -1 if none) */
  seventh: number;
  /** Next chord's 3rd pitch class */
  nextThird: number;
  /** Next chord's 7th pitch class (-1 if none) */
  nextSeventh: number;
  /** Motion type of the 3rd line */
  thirdMotion: 'common' | 'step' | 'leap';
  /** Motion type of the 7th line */
  seventhMotion: 'common' | 'step' | 'leap' | 'none';
  /** Voice pair motion type (between 3rd and 7th paths) */
  pairMotion: 'contrary' | 'oblique' | 'parallel' | 'similar';
}

/** Semitone distance (shortest path around the circle) */
function pcDistance(a: number, b: number): number {
  if (a < 0 || b < 0) return 99;
  const d = Math.abs(a - b);
  return Math.min(d, 12 - d);
}

function motionType(dist: number): 'common' | 'step' | 'leap' {
  if (dist === 0) return 'common';
  if (dist <= 2) return 'step';
  return 'leap';
}

/** Direction of pitch class movement (up, down, or none) */
function pcDirection(from: number, to: number): number {
  if (from < 0 || to < 0 || from === to) return 0;
  const up = (to - from + 12) % 12;
  return up <= 6 ? 1 : -1;
}

/**
 * Plan guide tone paths between current and next chord.
 *
 * @param currentRoot    Current chord root note name (e.g., 'D')
 * @param currentQuality Current chord quality
 * @param nextRoot       Next chord root note name
 * @param nextQuality    Next chord quality
 * @returns Guide tone path analysis
 */
export function planGuideTonePath(
  currentRoot: string,
  currentQuality: ChordQuality,
  nextRoot: string,
  nextQuality: ChordQuality
): GuideTonePath {
  const currRpc = rootToPc(currentRoot);
  const nextRpc = rootToPc(nextRoot);

  const third = (currRpc + thirdPc(currentQuality)) % 12;
  const seventh = seventhPc(currentQuality) >= 0
    ? (currRpc + seventhPc(currentQuality)) % 12
    : -1;

  const nextThird = (nextRpc + thirdPc(nextQuality)) % 12;
  const nextSeventh = seventhPc(nextQuality) >= 0
    ? (nextRpc + seventhPc(nextQuality)) % 12
    : -1;

  const thirdDist = pcDistance(third, nextThird);
  const seventhDist = pcDistance(seventh, nextSeventh);

  const thirdDir = pcDirection(third, nextThird);
  const seventhDir = pcDirection(seventh, nextSeventh);

  let pairMotion: GuideTonePath['pairMotion'];
  if (thirdDir === 0 || seventhDir === 0) {
    pairMotion = 'oblique';
  } else if (thirdDir !== seventhDir) {
    pairMotion = 'contrary';
  } else if (thirdDist === seventhDist) {
    pairMotion = 'parallel';
  } else {
    pairMotion = 'similar';
  }

  return {
    third,
    seventh,
    nextThird,
    nextSeventh,
    thirdMotion: motionType(thirdDist),
    seventhMotion: seventh < 0 || nextSeventh < 0 ? 'none' : motionType(seventhDist),
    pairMotion,
  };
}

/**
 * Score the smoothness of a guide tone path (0-1).
 * Higher = smoother (common tones and step motion preferred).
 */
export function guideToneSmoothnessScore(path: GuideTonePath): number {
  const motionScore = { common: 1.0, step: 0.8, leap: 0.3, none: 0.5 };
  const pairScore = { contrary: 1.0, oblique: 0.9, similar: 0.5, parallel: 0.3 };

  const thirdScore = motionScore[path.thirdMotion];
  const seventhScore = motionScore[path.seventhMotion];
  const pair = pairScore[path.pairMotion];

  return (thirdScore * 0.35 + seventhScore * 0.35 + pair * 0.30);
}

/** Per-mood preference for guide tone smoothness (affects voicing choices) */
const SMOOTHNESS_WEIGHT: Record<Mood, number> = {
  lofi:      0.60,   // jazz — smooth voice leading essential
  avril:     0.55,   // intimate — gentle inner voices
  downtempo: 0.50,   // smooth — flowing lines
  flim:      0.45,   // delicate — careful movement
  xtal:      0.40,   // dreamy — gentle voices
  blockhead: 0.35,   // hip-hop — some smoothness
  disco:     0.30,   // funk — rhythmic harmony
  trance:    0.20,   // EDM — block chord movement
  syro:      0.25,   // IDM — angular by design
  ambient:   0.35,   // drone — smooth when voices exist,
  plantasia: 0.35,
};

/**
 * Get the guide tone smoothness weight for a mood.
 */
export function guideToneWeight(mood: Mood): number {
  return SMOOTHNESS_WEIGHT[mood];
}

/**
 * Suggest an octave for a guide tone pitch class that creates
 * the smoothest connection from a previous note.
 *
 * @param pc          Target pitch class (0-11)
 * @param prevNoteMidi Previous guide tone MIDI note (for continuity)
 * @param minOct      Minimum octave
 * @param maxOct      Maximum octave
 * @returns Suggested MIDI note number
 */
export function smoothGuideToneOctave(
  pc: number,
  prevNoteMidi: number,
  minOct: number = 3,
  maxOct: number = 5
): number {
  let bestMidi = -1;
  let bestDist = Infinity;

  for (let oct = minOct; oct <= maxOct; oct++) {
    const midi = (oct + 1) * 12 + pc;
    const dist = Math.abs(midi - prevNoteMidi);
    if (dist < bestDist) {
      bestDist = dist;
      bestMidi = midi;
    }
  }

  return bestMidi >= 0 ? bestMidi : (4 * 12 + pc);
}
