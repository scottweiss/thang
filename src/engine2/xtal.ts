/**
 * XtalComposer — Aphex Twin *xtal* / *Selected Ambient Works 85-92* —
 * crystalline synth pads, mixolydian/lydian color, subtle acid undertone,
 * gentle breakbeat drums.
 *
 * 100-118 BPM. Modal (mixolydian/lydian-forward). Climbing arpeggio motifs,
 * shimmering poly pad, glass color.
 */

import type { NoteName, ScaleType } from '../types';
import type { Voicing, Motif, SectionShape, SectionType, CadenceType, PulsePattern } from './types';
import type { MoodComposer, Progression } from './mood-composer';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const XTAL_ROOTS: readonly NoteName[] = ['E', 'A', 'D', 'F#', 'G', 'C', 'Bb'];

const XTAL_PROGRESSIONS: readonly Progression[] = [
  // I-bVII-vi-V — mixolydian color (bVII = degree 6 flattened, but using
  // the 7th scale degree which is the flat-seven in mixolydian naturally)
  { degrees: [0, 6, 5, 4], qualities: ['maj7', 'maj7', 'min7', 'maj7'], barsPerChord: 1 },
  // I-V-IV-I lydian-ish
  { degrees: [0, 4, 3, 0], qualities: ['maj7', 'dom7', 'maj7', 'maj7'], barsPerChord: 1 },
  // I-iii-IV-V (gentle lift)
  { degrees: [0, 2, 3, 4], qualities: ['add9', 'min7', 'maj7', 'dom7'], barsPerChord: 1 },
  // I-IV oscillation — 2 bars each, holds the shimmer
  { degrees: [0, 3],       qualities: ['maj7', 'maj7'],                 barsPerChord: 2 },
  // I-vi-IV-V modal
  { degrees: [0, 5, 3, 4], qualities: ['add9', 'min7', 'maj7', 'dom7'], barsPerChord: 1 },
];

export class XtalComposer implements MoodComposer {
  name = 'xtal';

  pickKey(): { root: NoteName; scaleType: ScaleType } {
    const root = pick(XTAL_ROOTS);
    // Mixolydian / lydian primary; major fallback
    const r = Math.random();
    const scaleType: ScaleType = r < 0.45 ? 'mixolydian' : r < 0.80 ? 'lydian' : 'major';
    return { root, scaleType };
  }

  pickTempo(): number {
    return 100 + Math.random() * 18;  // 100-118 BPM
  }

  pickVoicing(): Voicing {
    return {
      bass: {
        // Fretless bass — warmer, more organic than synth_bass_1 (which trance owns)
        sound: 'gm_fretless_bass',
        attack: 0.02,
        decay: 0.4,
        sustain: 0.35,
        release: 0.4,
        lpf: 1100,
        gain: 0.28,
        pan: 0.5,
        octaveOffset: -2,
      },
      chord: {
        sound: 'gm_pad_polysynth',
        attack: 0.3,
        release: 1.8,
        lpf: 2800,
        gain: 0.18,
        room: 0.50,
        pan: 0.5,
        octaveOffset: -1,
      },
      lead: {
        sound: 'gm_synth_strings_1',
        attack: 0.08,
        decay: 0.2,
        sustain: 0.65,
        release: 0.5,
        lpf: 3400,
        gain: 0.19,
        room: 0.45,
        delay: 0.30,
        pan: 0.55,
        octaveOffset: 0,
      },
      color: {
        sound: 'gm_glockenspiel',
        attack: 0.005,
        release: 1.4,
        lpf: 4200,
        gain: 0.09,
        room: 0.60,
        pan: 0.45,
        octaveOffset: 1,
      },
      pulse: {
        kick: {
          sound: 'bd',
          attack: 0.001,
          release: 0.22,
          lpf: 2400,
          gain: 0.55,
          pan: 0.5,
        },
        snare: {
          sound: 'sd',
          attack: 0.002,
          release: 0.15,
          lpf: 3200,
          gain: 0.28,
          pan: 0.5,
          room: 0.3,
        },
        hat: {
          sound: 'hh',
          attack: 0.001,
          release: 0.05,
          gain: 0.22,
          pan: 0.55,
        },
      },
    };
  }

  buildProgression(_scaleType: ScaleType): Progression {
    return pick(XTAL_PROGRESSIONS);
  }

  buildMotif(_scaleType: ScaleType): Motif {
    // Climbing arpeggios with occasional 5th-root-5th bounce. Even eighths
    // give xtal its shimmery cascade feel.
    // Chord-tone indices: 0=root, 1=3rd, 2=5th, 3=7th, 4=root+oct.
    const cellPool = [
      [0, 2, 4, 2],     // 1-5-1oct-5 bounce
      [0, 1, 2, 4],     // 1-3-5-root+oct ascending
      [2, 4, 2, 0],     // 5-root+oct-5-1 descending
      [0, 2, 1, 4],     // 1-5-3-root+oct zigzag
      [0, 1, 2, 3],     // 1-3-5-7 arp
      [4, 2, 1, 0],     // root+oct-5-3-1 cascade
    ];
    const pitches = pick(cellPool);
    // Even eighths
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
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color', 'pulse']),    intensity: 0.80 };
      case 'breakdown':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                     intensity: 0.40 };
      case 'groove':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color', 'pulse']),    intensity: 0.70 };
    }
  }

  motifSlots(bars: number): boolean[] {
    // xtal arps feel continuous — lead on almost every bar once it arrives
    if (bars === 4) return [true, true, false, true];
    if (bars === 8) return [true, true, true, false, true, true, false, true];
    return Array.from({ length: bars }, () => true);
  }

  cadenceFor(sectionType: SectionType, phraseIdx: number, totalPhrases: number): CadenceType {
    const isLast = phraseIdx === totalPhrases - 1;
    if (sectionType === 'peak' && isLast) return 'closed';
    if (isLast) return 'half';
    return 'open';
  }

  buildPulse(sectionType: SectionType, _phraseIdx: number, _totalPhrases: number): PulsePattern | null {
    if (sectionType === 'intro' || sectionType === 'breakdown') return null;
    // Gentle breakbeat — kick on 1 and 3, light snare on 2, hats on all eighths
    return {
      kick:  'bd ~ ~ ~ bd ~ ~ ~',         // 1 and 3
      snare: '~ ~ sd ~ ~ ~ sd ~',          // 2 and 4 (light)
      hat:   'hh hh hh hh hh hh hh hh',    // eighth-note hats — the xtal shimmer
    };
  }
}
