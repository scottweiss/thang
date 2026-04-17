/**
 * LofiComposer — warm jazz-pop with extended chord voicings and lazy drums.
 *
 * Conventions: Rhodes electric piano chords (maj7/min7/add9/dom7),
 * walking or stepwise acoustic bass, sparse jazz-guitar comping, hip-hop
 * pocket drums (sd on 2 & 4, relaxed hat), occasional vibraphone sparkle.
 * 75-92 BPM. Major keys predominate; relative minor for wistful pieces.
 */

import type { NoteName, ScaleType } from '../types';
import type { Voicing, Motif, SectionShape, SectionType, CadenceType, PulsePattern } from './types';
import type { MoodComposer, Progression } from './mood-composer';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Warm keys — lofi lives in C/F/Bb/Eb major territory, plus A minor for color */
const LOFI_ROOTS: readonly NoteName[] = ['C', 'F', 'Bb', 'Eb', 'D', 'G', 'A'];

// Weighted: major more common than minor for canonical lofi
function pickLofiKey(): { root: NoteName; scaleType: ScaleType } {
  const root = pick(LOFI_ROOTS);
  const scaleType: ScaleType = Math.random() < 0.75 ? 'major' : 'minor';
  return { root, scaleType };
}

/**
 * Jazz-flavored progressions. Extended qualities land consonantly because
 * Performer resolves motif pitches against the current chord root. Over
 * min9/maj7, the motif's 0/2/4/6 pitches are root/3rd/5th/7th of that
 * chord — all chord tones.
 */
const LOFI_PROGRESSIONS: readonly Progression[] = [
  // ii-V-I-vi turnaround, one chord per bar
  { degrees: [1, 4, 0, 5], qualities: ['min7',  'dom7', 'maj7', 'min7'], barsPerChord: 1 },
  // I-vi-ii-V classic jazz loop
  { degrees: [0, 5, 1, 4], qualities: ['maj7',  'min7', 'min7', 'dom7'], barsPerChord: 1 },
  // Imaj7 - IVmaj7 oscillation, each chord holds 2 bars (slower lofi groove)
  { degrees: [0, 3],       qualities: ['maj7',  'maj7'],                 barsPerChord: 2 },
  // I-iii-IV-V with warmer add9
  { degrees: [0, 2, 3, 4], qualities: ['add9',  'min7', 'maj7', 'dom7'], barsPerChord: 1 },
  // ii-V-I (half-time feel): each 2 bars
  { degrees: [1, 4],       qualities: ['min9',  'dom7'],                 barsPerChord: 2 },
];

export class LofiComposer implements MoodComposer {
  name = 'lofi';

  pickKey(): { root: NoteName; scaleType: ScaleType } {
    return pickLofiKey();
  }

  pickTempo(): number {
    return 75 + Math.random() * 17;  // 75-92 BPM
  }

  pickVoicing(): Voicing {
    return {
      bass: {
        sound: 'gm_acoustic_bass',
        attack: 0.01,
        decay: 0.5,
        sustain: 0.25,
        release: 0.35,
        lpf: 800,
        gain: 0.28,
        pan: 0.5,
        octaveOffset: -2,
      },
      chord: {
        sound: 'gm_epiano1',
        attack: 0.01,
        decay: 1.2,
        sustain: 0.35,
        release: 0.8,
        lpf: 2400,
        gain: 0.20,
        room: 0.40,
        pan: 0.5,
        octaveOffset: -1,
      },
      lead: {
        sound: 'gm_electric_guitar_jazz',
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.5,
        lpf: 2600,
        gain: 0.16,
        room: 0.3,
        pan: 0.55,
        octaveOffset: 0,
      },
      color: {
        sound: 'gm_vibraphone',
        attack: 0.01,
        release: 1.8,
        lpf: 3400,
        gain: 0.07,
        room: 0.6,
        pan: 0.45,
        octaveOffset: 1,
      },
      pulse: {
        kick: {
          sound: 'bd',
          attack: 0.001,
          release: 0.25,
          lpf: 2000,
          gain: 0.55,
          pan: 0.5,
        },
        snare: {
          sound: 'sd',
          attack: 0.002,
          release: 0.18,
          lpf: 3000,
          gain: 0.30,
          pan: 0.5,
          room: 0.3,
        },
        hat: {
          sound: 'hh',
          attack: 0.001,
          release: 0.05,
          gain: 0.18,
          pan: 0.55,
        },
      },
    };
  }

  buildProgression(_scaleType: ScaleType): Progression {
    return pick(LOFI_PROGRESSIONS);
  }

  buildMotif(_scaleType: ScaleType): Motif {
    // Lofi lead noodles — chord-tone arpeggios (1-3-5-7 style).
    // Chord-tone indices: 0=root, 1=3rd, 2=5th, 3=7th, 4=root+oct, 5=3rd+oct.
    const cellPool = [
      [2, 1, 0, 1],       // 5-3-1-3 descending
      [0, 1, 2, 3],       // 1-3-5-7 ascending (sublime on maj7)
      [1, 2, 1, 0],       // 3-5-3-1 gentle
      [3, 2, 1, 0],       // 7-5-3-1 falling (classic jazz motion)
      [0, 2, 1, 2],       // 1-5-3-5 bouncing
    ];
    const pitches = pick(cellPool);
    // Laid-back eighths — Strudel-level swing would require explicit triplets;
    // v1 leans on timbre (Rhodes + acoustic bass) for the lofi feel.
    const rhythm = pitches.map(() => 0.5);
    return { pitches: [...pitches], rhythm, length: pitches.length * 0.5 };
  }

  sectionShape(type: SectionType): SectionShape {
    switch (type) {
      case 'intro':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                     intensity: 0.35 };
      case 'build':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color', 'pulse']),            intensity: 0.55 };
      case 'peak':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color', 'pulse']),    intensity: 0.70 };
      case 'breakdown':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                     intensity: 0.40 };
      case 'groove':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color', 'pulse']),    intensity: 0.60 };
    }
  }

  motifSlots(bars: number): boolean[] {
    // Lead plays on bars 1, 3, 5, 7 — sparse, conversational (call-response feel)
    if (bars === 4) return [true, false, true, false];
    if (bars === 8) return [true, false, true, false, true, false, true, true];
    return Array.from({ length: bars }, (_, i) => i % 2 === 0);
  }

  cadenceFor(sectionType: SectionType, phraseIdx: number, totalPhrases: number): CadenceType {
    const isLast = phraseIdx === totalPhrases - 1;
    if (isLast && sectionType === 'peak') return 'closed';
    if (isLast) return 'half';
    return 'open';
  }

  buildPulse(sectionType: SectionType, _phraseIdx: number, _totalPhrases: number): PulsePattern | null {
    if (sectionType === 'intro' || sectionType === 'breakdown') return null;
    // Hip-hop pocket: kick on 1 and the "and" of 2 or on 3; snare on 2 and 4;
    // hat steady eighths. Slightly loose feel comes from the laid-back tempo.
    return {
      kick:  'bd ~ ~ ~ bd ~ ~ ~',      // kick on 1 and 3 (8-step pattern = 1 bar of eighths)
      snare: '~ ~ sd ~ ~ ~ sd ~',      // snare on 2 and 4
      hat:   'hh ~ hh ~ hh ~ hh ~',    // hats on each quarter (sparser than trance)
    };
  }
}
