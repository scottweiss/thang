/**
 * AmbientComposer — Eno/Budd territory. Very slow, very sparse, no drums,
 * no sharp melody. A held chord is a statement. Phrases are 4 bars but
 * one chord may span all 4.
 */

import type { NoteName, ScaleType } from '../types';
import type { Voicing, Motif, SectionShape, SectionType, CadenceType } from './types';
import type { MoodComposer, Progression } from './mood-composer';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const AMBIENT_ROOTS: readonly NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'];

const AMBIENT_SCALES: readonly ScaleType[] = ['lydian', 'major', 'dorian'];

/**
 * Ambient "progressions" are really chord pairs that oscillate — or one
 * chord that holds the whole phrase. `barsPerChord: 4` means one chord per
 * full phrase; `barsPerChord: 2` means two chords over 4 bars.
 */
const AMBIENT_PROGRESSIONS: readonly Progression[] = [
  // single-chord drones (4 bars of one chord)
  { degrees: [0],        qualities: ['sus2'],                       barsPerChord: 4 },
  { degrees: [0],        qualities: ['maj7'],                       barsPerChord: 4 },
  { degrees: [3],        qualities: ['sus2'],                       barsPerChord: 4 },  // held IV for lydian lift
  // slow two-chord oscillations (2 bars each)
  { degrees: [0, 5],     qualities: ['sus2', 'min7'],               barsPerChord: 2 },
  { degrees: [0, 3],     qualities: ['maj7', 'maj7'],               barsPerChord: 2 },
  { degrees: [0, 1],     qualities: ['sus2', 'min7'],               barsPerChord: 2 },  // Isus-ii for modal drift
];

export class AmbientComposer implements MoodComposer {
  name = 'ambient';

  pickKey(): { root: NoteName; scaleType: ScaleType } {
    return { root: pick(AMBIENT_ROOTS), scaleType: pick(AMBIENT_SCALES) };
  }

  pickTempo(): number {
    // 62-78 BPM — Eno-slow. Tempo almost doesn't matter at this pace but it
    // still affects phrase length (longer phrases at slower tempos).
    return 62 + Math.random() * 16;
  }

  pickVoicing(): Voicing {
    return {
      bass: {
        sound: 'sine',
        attack: 2.0,
        release: 4.0,
        lpf: 400,
        gain: 0.22,
        pan: 0.5,
        octaveOffset: -2,
      },
      chord: {
        sound: 'gm_pad_halo',
        attack: 1.5,
        release: 3.5,
        lpf: 1800,
        gain: 0.12,
        room: 0.7,
        pan: 0.5,
        octaveOffset: -1,
      },
      // no lead — ambient doesn't chase melody
      color: {
        sound: 'gm_fx_crystal',
        attack: 0.05,
        release: 2.5,
        lpf: 3800,
        gain: 0.06,
        room: 0.8,
        pan: 0.45,
        octaveOffset: 1,
      },
    };
  }

  buildProgression(_scaleType: ScaleType): Progression {
    return pick(AMBIENT_PROGRESSIONS);
  }

  buildMotif(_scaleType: ScaleType): Motif {
    // Even though there's no 'lead' role active, the MoodComposer contract
    // requires a motif. A degenerate one-note "motif" covers the case — it
    // just never gets rendered because lead isn't in any ambient section.
    return { pitches: [0], rhythm: [1], length: 1 };
  }

  sectionShape(type: SectionType): SectionShape {
    switch (type) {
      case 'intro':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord']),                intensity: 0.25 };
      case 'build':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),        intensity: 0.40 };
      case 'peak':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'color']),        intensity: 0.55 };
      case 'breakdown':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord']),                intensity: 0.30 };
      case 'groove':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'color']),        intensity: 0.50 };
    }
  }

  motifSlots(bars: number): boolean[] {
    // No lead ever fires — this field is irrelevant for ambient.
    return Array.from({ length: bars }, () => false);
  }

  cadenceFor(_sectionType: SectionType, _phraseIdx: number, _totalPhrases: number): CadenceType {
    return 'open';
  }
}
