/**
 * DowntempoComposer — trip-hop adjacent. Slow, smoky, halftime drums, warm
 * pads, deep sub bass. Bonobo / Massive Attack / Emancipator territory.
 *
 * 70-90 BPM. Minor-leaning. Two-bar chord holds. Sparse lead gestures,
 * halftime kick-on-1/snare-on-3 pocket.
 */

import type { NoteName, ScaleType } from '../types';
import type { Voicing, Motif, SectionShape, SectionType, CadenceType, PulsePattern } from './types';
import type { MoodComposer, Progression } from './mood-composer';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const DOWNTEMPO_ROOTS: readonly NoteName[] = ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'];

const DOWNTEMPO_PROGRESSIONS: readonly Progression[] = [
  // i-VI-IV-V minor loop, 1 bar each
  { degrees: [0, 5, 3, 4], qualities: ['min7', 'maj7', 'maj7', 'min7'], barsPerChord: 1 },
  // I-iii-IV-I slow hover, 2 bars each (8-bar phrase over 4 chords in 4 bars via loop)
  { degrees: [0, 2, 3, 0], qualities: ['maj7', 'min7', 'maj7', 'maj7'], barsPerChord: 1 },
  // i-iv held long, 2 bars per chord
  { degrees: [0, 3],       qualities: ['min9', 'min7'],                 barsPerChord: 2 },
  // I-IV oscillation, slow
  { degrees: [0, 3],       qualities: ['maj7', 'maj7'],                 barsPerChord: 2 },
  // i-VI half-time
  { degrees: [0, 5],       qualities: ['min7', 'maj7'],                 barsPerChord: 2 },
];

export class DowntempoComposer implements MoodComposer {
  name = 'downtempo';

  pickKey(): { root: NoteName; scaleType: ScaleType } {
    const root = pick(DOWNTEMPO_ROOTS);
    const scaleType: ScaleType = Math.random() < 0.70 ? 'minor' : 'major';
    return { root, scaleType };
  }

  pickTempo(): number {
    return 70 + Math.random() * 20;  // 70-90 BPM
  }

  pickVoicing(): Voicing {
    return {
      bass: {
        sound: 'gm_synth_bass_2',
        attack: 0.01,
        decay: 0.6,
        sustain: 0.4,
        release: 0.6,
        lpf: 700,
        gain: 0.30,
        pan: 0.5,
        octaveOffset: -2,
      },
      chord: {
        sound: 'gm_pad_warm',
        attack: 0.6,
        release: 2.5,
        lpf: 2000,
        gain: 0.18,
        room: 0.45,
        pan: 0.5,
        octaveOffset: -1,
      },
      lead: {
        sound: 'gm_muted_trumpet',
        attack: 0.05,
        decay: 0.3,
        sustain: 0.4,
        release: 0.8,
        lpf: 2400,
        gain: 0.15,
        room: 0.5,
        delay: 0.20,
        pan: 0.52,
        octaveOffset: 0,
      },
      color: {
        // Metallic pad — trip-hop edge; frees pad_halo for ambient's spacious identity
        sound: 'gm_pad_metallic',
        attack: 0.8,
        release: 2.8,
        lpf: 2600,
        gain: 0.08,
        room: 0.55,
        pan: 0.48,
        octaveOffset: 1,
      },
      pulse: {
        kick: {
          sound: 'bd',
          attack: 0.001,
          release: 0.30,
          lpf: 1600,
          gain: 0.60,
          pan: 0.5,
        },
        snare: {
          sound: 'sd',
          attack: 0.002,
          release: 0.22,
          lpf: 2800,
          gain: 0.28,
          pan: 0.5,
          room: 0.4,
        },
        hat: {
          sound: 'hh',
          attack: 0.001,
          release: 0.06,
          gain: 0.14,
          pan: 0.55,
        },
      },
    };
  }

  buildProgression(_scaleType: ScaleType): Progression {
    return pick(DOWNTEMPO_PROGRESSIONS);
  }

  buildMotif(_scaleType: ScaleType): Motif {
    // Slow, falling gestures — 2 to 3 long notes per cell.
    // Chord-tone indices: 0=root, 1=3rd, 2=5th, 3=7th.
    const cellPool = [
      { pitches: [2, 1, 0],       rhythm: [1.0, 1.0, 1.0] },       // 5-3-1 descent
      { pitches: [3, 2, 1],       rhythm: [1.0, 1.0, 1.5] },       // 7-5-3 long
      { pitches: [0, 2, 1],       rhythm: [0.75, 0.75, 1.0] },     // 1-5-3 hover
      { pitches: [1, 0],          rhythm: [1.5, 1.5] },            // 3-1 fall
      { pitches: [0, 3, 2, 1],    rhythm: [0.5, 0.5, 0.75, 1.0] }, // 1-7-5-3 lazy arp
    ];
    const cell = pick(cellPool);
    return { pitches: [...cell.pitches], rhythm: [...cell.rhythm], length: cell.rhythm.reduce((a, b) => a + b, 0) };
  }

  sectionShape(type: SectionType): SectionShape {
    switch (type) {
      case 'intro':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                     intensity: 0.30 };
      case 'build':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color', 'pulse']),            intensity: 0.50 };
      case 'peak':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color', 'pulse']),    intensity: 0.70 };
      case 'breakdown':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                     intensity: 0.35 };
      case 'groove':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color', 'pulse']),    intensity: 0.60 };
    }
  }

  motifSlots(bars: number): boolean[] {
    // Sparse lead — once every 4 bars in 4, twice in 8
    if (bars === 4) return [false, true, false, true];
    if (bars === 8) return [false, true, false, false, false, true, false, true];
    return Array.from({ length: bars }, (_, i) => i % 4 === 1);
  }

  cadenceFor(sectionType: SectionType, phraseIdx: number, totalPhrases: number): CadenceType {
    const isLast = phraseIdx === totalPhrases - 1;
    if (sectionType === 'peak' && isLast) return 'closed';
    if (isLast) return 'half';
    return 'open';
  }

  buildPulse(sectionType: SectionType, _phraseIdx: number, _totalPhrases: number): PulsePattern | null {
    if (sectionType === 'intro' || sectionType === 'breakdown') return null;
    // Halftime: kick on 1, snare on 3 (instead of 2/4). Sparse hats on quarters.
    return {
      kick:  'bd ~ ~ ~ ~ ~ ~ ~',       // kick on beat 1 only (bar = 8 eighth steps)
      snare: '~ ~ ~ ~ sd ~ ~ ~',       // snare on beat 3 (halftime feel)
      hat:   'hh ~ hh ~ hh ~ hh ~',    // quarter-note hats, soft
    };
  }
}
