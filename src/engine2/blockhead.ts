/**
 * BlockheadComposer — Blockhead / J Dilla territory. Dusty hip-hop instrumental
 * with gritty Rhodes, upright bass, muted trumpet lead, boom-bap drums.
 *
 * 82-96 BPM. Minor/dorian leaning. Loose, swung hat feel. Blue notes on
 * 3rd and 7th. Distinct from lofi: heavier kick, snare behind the beat.
 */

import type { NoteName, ScaleType } from '../types';
import type { Voicing, Motif, SectionShape, SectionType, CadenceType, PulsePattern } from './types';
import type { MoodComposer, Progression } from './mood-composer';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const BLOCKHEAD_ROOTS: readonly NoteName[] = ['C', 'F', 'Bb', 'Eb', 'G', 'A', 'D'];

const BLOCKHEAD_PROGRESSIONS: readonly Progression[] = [
  // i-IV-ii-V (minor jazz turnaround)
  { degrees: [0, 3, 1, 4], qualities: ['min7', 'dom7', 'min7', 'dom7'], barsPerChord: 1 },
  // vi-ii-I-V (jazz comp)
  { degrees: [5, 1, 0, 4], qualities: ['min7', 'min7', 'maj7', 'dom7'], barsPerChord: 1 },
  // i-iv-V-i
  { degrees: [0, 3, 4, 0], qualities: ['min7', 'min7', 'dom7', 'min9'], barsPerChord: 1 },
  // Imaj7-VIImaj7 slow (2 bars each) — modal dorian feel
  { degrees: [0, 6],       qualities: ['maj7', 'maj7'],                 barsPerChord: 2 },
  // ii-V vamp held 2 bars each
  { degrees: [1, 4],       qualities: ['min9', 'dom7'],                 barsPerChord: 2 },
];

export class BlockheadComposer implements MoodComposer {
  name = 'blockhead';

  pickKey(): { root: NoteName; scaleType: ScaleType } {
    const root = pick(BLOCKHEAD_ROOTS);
    // Dorian bias for jazz-modal feel; minor second; major rare
    const r = Math.random();
    const scaleType: ScaleType = r < 0.50 ? 'dorian' : r < 0.85 ? 'minor' : 'major';
    return { root, scaleType };
  }

  pickTempo(): number {
    return 82 + Math.random() * 14;  // 82-96 BPM
  }

  pickVoicing(): Voicing {
    return {
      bass: {
        sound: 'gm_acoustic_bass',
        attack: 0.01,
        decay: 0.45,
        sustain: 0.2,
        release: 0.3,
        lpf: 700,
        gain: 0.30,
        pan: 0.5,
        octaveOffset: -2,
      },
      chord: {
        sound: 'gm_epiano2',
        attack: 0.01,
        decay: 1.4,
        sustain: 0.3,
        release: 0.9,
        lpf: 2200,
        gain: 0.20,
        room: 0.45,
        pan: 0.5,
        octaveOffset: -1,
      },
      lead: {
        sound: 'gm_muted_trumpet',
        attack: 0.04,
        decay: 0.25,
        sustain: 0.5,
        release: 0.6,
        lpf: 2400,
        gain: 0.17,
        room: 0.35,
        delay: 0.15,
        pan: 0.55,
        octaveOffset: 0,
      },
      color: {
        // Kalimba — African thumb piano gives J Dilla-adjacent texture; frees vibraphone for lofi's signature
        sound: 'gm_kalimba',
        attack: 0.005,
        release: 1.2,
        lpf: 3400,
        gain: 0.09,
        room: 0.5,
        pan: 0.45,
        octaveOffset: 1,
      },
      pulse: {
        kick: {
          sound: 'bd',
          attack: 0.001,
          release: 0.28,
          lpf: 1800,
          gain: 0.68,                 // heavier than lofi
          pan: 0.5,
        },
        snare: {
          sound: 'sd',
          attack: 0.002,
          release: 0.20,
          lpf: 2800,
          gain: 0.35,
          pan: 0.5,
          room: 0.35,
        },
        hat: {
          sound: 'hh',
          attack: 0.001,
          release: 0.06,
          gain: 0.16,
          pan: 0.55,
        },
        perc: {
          // Rim clicks — ghost-snare skitter, J Dilla trademark
          sound: 'rim',
          attack: 0.001,
          release: 0.08,
          lpf: 4000,
          gain: 0.22,
          pan: 0.48,
        },
      },
    };
  }

  buildProgression(_scaleType: ScaleType): Progression {
    return pick(BLOCKHEAD_PROGRESSIONS);
  }

  buildMotif(_scaleType: ScaleType): Motif {
    // Bluesy — lean on b3/b7 (positions 1 and 3 of min7/dom7 chord tones).
    // Include triplet-simulation rhythms for a shuffled feel.
    const cellPool = [
      { pitches: [3, 1, 0],       rhythm: [0.33, 0.33, 0.34] },     // 7-3-1 triplet fall
      { pitches: [1, 3, 1, 0],    rhythm: [0.5, 0.5, 0.5, 1.5] },   // 3-7-3-1 gesture
      { pitches: [0, 1, 3, 1],    rhythm: [0.5, 0.5, 0.5, 1.0] },   // 1-3-7-3
      { pitches: [3, 2, 1, 0],    rhythm: [0.5, 0.5, 0.5, 1.0] },   // 7-5-3-1 descent
      { pitches: [1, 0, 3],       rhythm: [0.33, 0.33, 0.34] },     // 3-1-7 blue triplet
      { pitches: [0, 3, 1, 2],    rhythm: [0.5, 0.5, 0.5, 0.75] },  // 1-7-3-5 zigzag
    ];
    const cell = pick(cellPool);
    return { pitches: [...cell.pitches], rhythm: [...cell.rhythm], length: cell.rhythm.reduce((a, b) => a + b, 0) };
  }

  sectionShape(type: SectionType): SectionShape {
    switch (type) {
      case 'intro':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                     intensity: 0.40 };
      case 'build':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color', 'pulse']),            intensity: 0.60 };
      case 'peak':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color', 'pulse']),    intensity: 0.75 };
      case 'breakdown':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color']),                     intensity: 0.45 };
      case 'groove':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color', 'pulse']),    intensity: 0.65 };
    }
  }

  motifSlots(bars: number): boolean[] {
    // Call-response — lead on odd bars mostly, letting chords speak between
    if (bars === 4) return [true, false, true, true];
    if (bars === 8) return [true, false, true, true, false, true, false, true];
    return Array.from({ length: bars }, (_, i) => i % 2 === 0 || i === bars - 1);
  }

  cadenceFor(sectionType: SectionType, phraseIdx: number, totalPhrases: number): CadenceType {
    const isLast = phraseIdx === totalPhrases - 1;
    if (isLast && sectionType === 'peak') return 'closed';
    if (isLast) return 'half';
    return 'open';
  }

  buildPulse(sectionType: SectionType, _phraseIdx: number, _totalPhrases: number): PulsePattern | null {
    if (sectionType === 'intro' || sectionType === 'breakdown') return null;
    // Boom-bap: kick on 1 + "and" of 2 + 3; snare on 2 and 4 (pushed back
    // slightly via gap); swung hats; rim ghost-clicks between snares.
    return {
      kick:  'bd ~ ~ bd bd ~ ~ ~',       // 1 + and-of-2 + 3
      snare: '~ ~ sd ~ ~ ~ sd ~',        // 2 and 4
      hat:   'hh hh ~ hh hh ~ hh hh',    // swung, double-hit feel
      perc:  '~ rim ~ ~ rim ~ rim ~',    // ghost-snare skitter
    };
  }
}
