/**
 * DiscoComposer — four-on-the-floor funk with slap bass, brass stabs,
 * clavinet chicken-scratch, and iconic disco hi-hats (closed on beats,
 * open on offbeats).
 *
 * Character: bright major keys, 112-125 BPM, dom7-heavy vamps, rhythmic
 * density on the off-beats. Strings swell at peaks.
 */

import type { NoteName, ScaleType } from '../types';
import type { Voicing, Motif, SectionShape, SectionType, CadenceType, PulsePattern } from './types';
import type { MoodComposer, Progression } from './mood-composer';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const DISCO_ROOTS: readonly NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'];

const DISCO_PROGRESSIONS: readonly Progression[] = [
  // I7-IV7-V7-IV7 funk vamp
  { degrees: [0, 3, 4, 3], qualities: ['dom7', 'dom7', 'dom7', 'dom7'], barsPerChord: 1 },
  // Im7-IV7 half-bar oscillation — 2 bars per chord for a slower feel
  { degrees: [0, 3],       qualities: ['min7', 'dom7'],                 barsPerChord: 2 },
  // I-vi-IV-V (classic pop with dom7 on V)
  { degrees: [0, 5, 3, 4], qualities: ['maj',  'min7', 'maj',  'dom7'], barsPerChord: 1 },
  // ii-V-I-IV jazz insert (funk + jazz crossover)
  { degrees: [1, 4, 0, 3], qualities: ['min7', 'dom7', 'maj7', 'dom7'], barsPerChord: 1 },
];

export class DiscoComposer implements MoodComposer {
  name = 'disco';

  pickKey(): { root: NoteName; scaleType: ScaleType } {
    return { root: pick(DISCO_ROOTS), scaleType: 'major' };
  }

  pickTempo(): number {
    return 112 + Math.random() * 13;  // 112-125 BPM
  }

  pickVoicing(): Voicing {
    return {
      bass: {
        sound: 'gm_slap_bass_1',
        attack: 0.003,
        decay: 0.18,
        sustain: 0.15,
        release: 0.08,
        lpf: 1800,
        gain: 0.32,
        pan: 0.5,
        octaveOffset: -2,
      },
      chord: {
        sound: 'gm_brass_section',
        attack: 0.02,
        decay: 0.4,
        sustain: 0.3,
        release: 0.35,
        lpf: 3000,
        gain: 0.22,
        room: 0.2,
        pan: 0.5,
        octaveOffset: -1,
      },
      lead: {
        sound: 'gm_clavinet',
        attack: 0.003,
        decay: 0.12,
        sustain: 0.2,
        release: 0.08,
        lpf: 3200,
        gain: 0.18,
        room: 0.15,
        pan: 0.55,
        octaveOffset: 0,
      },
      color: {
        // String pad swells between the brass stabs
        sound: 'gm_string_ensemble_1',
        attack: 0.8,
        release: 1.5,
        lpf: 2800,
        gain: 0.08,
        room: 0.4,
        pan: 0.5,
        octaveOffset: 0,
      },
      pulse: {
        kick: {
          sound: 'bd',
          attack: 0.001,
          release: 0.2,
          lpf: 3000,
          gain: 0.80,
          pan: 0.5,
        },
        snare: {
          sound: 'sd',
          attack: 0.002,
          release: 0.18,
          lpf: 4800,
          gain: 0.42,
          pan: 0.5,
          room: 0.18,
        },
        hat: {
          // Closed hat on quarters — the "chick" half of chick-cha
          sound: 'hh',
          attack: 0.001,
          release: 0.04,
          gain: 0.32,
          pan: 0.55,
        },
        perc: {
          // Open hat on offbeats — the "cha" half; disco's defining sound
          sound: 'oh',
          attack: 0.001,
          release: 0.22,
          gain: 0.28,
          pan: 0.52,
        },
      },
    };
  }

  buildProgression(_scaleType: ScaleType): Progression {
    return pick(DISCO_PROGRESSIONS);
  }

  buildMotif(_scaleType: ScaleType): Motif {
    // Disco lead: rhythmic chord-tone stabs, syncopated.
    // Chord-tone indices: 0=root, 1=3rd, 2=5th, 3=7th (if present), 4=root+oct.
    const hooks = [
      [0, 2, 1, 0],        // 1-5-3-1 classic
      [1, 2, 3, 2],        // 3-5-7-5 funky upper structure (7th chords)
      [0, 1, 2, 1],        // 1-3-5-3
      [2, 1, 0, 1],        // 5-3-1-3
      [0, 3, 2, 1],        // 1-7-5-3 descending 7th arp (jazz-funk)
      [0, 4, 2, 1],        // 1-root+oct-5-3 with octave leap
    ];
    const pitches = pick(hooks);
    // Eighth notes — snappy and on-time
    const rhythm = pitches.map(() => 0.5);
    return { pitches: [...pitches], rhythm, length: pitches.length * 0.5 };
  }

  sectionShape(type: SectionType): SectionShape {
    switch (type) {
      case 'intro':
        return { bars: 4,  activeRoles: new Set(['bass', 'pulse']),                              intensity: 0.45 };
      case 'build':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'pulse', 'color']),            intensity: 0.65 };
      case 'peak':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'pulse', 'color']),    intensity: 0.95 };
      case 'breakdown':
        return { bars: 4,  activeRoles: new Set(['bass', 'chord', 'pulse']),                     intensity: 0.55 };
      case 'groove':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'pulse', 'color']),    intensity: 0.85 };
    }
  }

  motifSlots(bars: number): boolean[] {
    // Disco clav/guitar chops every bar — the rhythm IS the lead
    return Array.from({ length: bars }, () => true);
  }

  cadenceFor(sectionType: SectionType, phraseIdx: number, totalPhrases: number): CadenceType {
    const isLast = phraseIdx === totalPhrases - 1;
    if (isLast && sectionType === 'peak') return 'closed';
    if (isLast) return 'half';
    return 'open';
  }

  buildPulse(sectionType: SectionType, _phraseIdx: number, _totalPhrases: number): PulsePattern | null {
    // Even the intro has drums — disco rides the kick from bar 1.
    // All sections use the same core pattern; the voicing decides presence.
    if (sectionType === 'breakdown') {
      // Breakdown drops the kick, leaving snare + hats for tension
      return {
        snare: '~ sd ~ sd',
        hat:   'hh hh hh hh hh hh hh hh',
      };
    }
    return {
      kick:  'bd bd bd bd',                              // four-on-the-floor
      snare: '~ sd ~ sd',                                // backbeat
      hat:   'hh ~ hh ~ hh ~ hh ~',                      // closed hat on beats
      perc:  '~ oh ~ oh ~ oh ~ oh',                      // open hat on offbeats — THE disco sound
    };
  }
}
