/**
 * SyroComposer — Aphex Twin *SYRO* — IDM chaos rendered through engine2's
 * phrase-first constraint. Engine2 can't do tick-level variation cheaply,
 * so we lean on:
 *   - jagged motif intervals (wide chord-tone leaps, asymmetric rhythms)
 *   - fast harmonic rhythm (1 bar per chord; unpredictable progressions)
 *   - polyrhythmic / non-4-on-the-floor drum patterns
 *   - four drum voices including perc (clap/rim)
 *
 * Expect syro to sound a bit more constrained than v1's tick-chaos version;
 * that's the architectural trade-off.
 *
 * 118-140 BPM. Phrygian / dorian / minor modes.
 */

import type { NoteName, ScaleType } from '../types';
import type { Voicing, Motif, SectionShape, SectionType, CadenceType, PulsePattern } from './types';
import type { MoodComposer, Progression } from './mood-composer';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SYRO_ROOTS: readonly NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'];

const SYRO_PROGRESSIONS: readonly Progression[] = [
  // Unpredictable hops — no tonal rest points
  { degrees: [0, 3, 5, 1], qualities: ['min7', 'dim',  'min7', 'sus4'], barsPerChord: 1 },
  { degrees: [0, 6, 2, 4], qualities: ['min9', 'dom7', 'min',  'maj7'], barsPerChord: 1 },
  { degrees: [0, 1, 5, 4], qualities: ['min',  'min7', 'dim',  'dom7'], barsPerChord: 1 },
  { degrees: [0, 4, 1, 5], qualities: ['sus2', 'min7', 'maj7', 'dim'],  barsPerChord: 1 },
  { degrees: [0, 2, 3, 6], qualities: ['min9', 'sus4', 'min7', 'dom7'], barsPerChord: 1 },
  // Fast oscillation — chord change every 2 beats simulated via 2x the chords in 4 bars
  // (barsPerChord: 1 with 4 entries = 1 chord/bar; engine2 doesn't support sub-bar changes)
];

export class SyroComposer implements MoodComposer {
  name = 'syro';

  pickKey(): { root: NoteName; scaleType: ScaleType } {
    const root = pick(SYRO_ROOTS);
    const r = Math.random();
    const scaleType: ScaleType = r < 0.40 ? 'phrygian' : r < 0.75 ? 'dorian' : 'minor';
    return { root, scaleType };
  }

  pickTempo(): number {
    return 118 + Math.random() * 22;  // 118-140 BPM
  }

  pickVoicing(): Voicing {
    return {
      bass: {
        sound: 'gm_synth_bass_2',
        attack: 0.005,
        decay: 0.15,
        sustain: 0.2,
        release: 0.12,
        lpf: 1400,
        gain: 0.30,
        pan: 0.5,
        octaveOffset: -2,
      },
      chord: {
        sound: 'gm_pad_choir',
        attack: 0.25,
        release: 1.2,
        lpf: 2400,
        gain: 0.16,
        room: 0.35,
        pan: 0.5,
        octaveOffset: -1,
      },
      lead: {
        sound: 'gm_lead_7_fifths',
        attack: 0.01,
        decay: 0.18,
        sustain: 0.4,
        release: 0.2,
        lpf: 3200,
        gain: 0.20,
        room: 0.25,
        delay: 0.22,
        pan: 0.53,
        octaveOffset: 0,
      },
      color: {
        sound: 'gm_tinkle_bell',
        attack: 0.005,
        release: 0.8,
        lpf: 4000,
        gain: 0.08,
        room: 0.45,
        pan: 0.47,
        octaveOffset: 1,
      },
      pulse: {
        kick: {
          sound: 'bd',
          attack: 0.001,
          release: 0.18,
          lpf: 2800,
          gain: 0.70,
          pan: 0.5,
        },
        snare: {
          sound: 'sd',
          attack: 0.002,
          release: 0.15,
          lpf: 4200,
          gain: 0.38,
          pan: 0.5,
          room: 0.2,
        },
        hat: {
          sound: 'hh',
          attack: 0.001,
          release: 0.04,
          gain: 0.26,
          pan: 0.55,
        },
        perc: {
          sound: 'cp',                    // clap — syro's defining skitter
          attack: 0.001,
          release: 0.12,
          lpf: 5000,
          gain: 0.24,
          pan: 0.48,
        },
      },
    };
  }

  buildProgression(_scaleType: ScaleType): Progression {
    return pick(SYRO_PROGRESSIONS);
  }

  buildMotif(_scaleType: ScaleType): Motif {
    // Jagged chord-tone leaps + asymmetric rhythms. 5-note cells mixing
    // durations to prevent any groove lock. Chord-tone indices: 0=root,
    // 1=3rd, 2=5th, 3=7th, 4=root+oct, 5=3rd+oct.
    const cellPool = [
      { pitches: [0, 3, 1, 5, 2],    rhythm: [0.25, 0.5, 0.75, 0.5, 1.0] },    // zigzag asymmetric
      { pitches: [4, 0, 3, 1, 2],    rhythm: [0.5, 0.25, 0.75, 0.5, 0.5] },    // fragmented
      { pitches: [0, 5, 2, 4],       rhythm: [0.25, 0.75, 0.5, 0.5] },         // leap-down-leap
      { pitches: [2, 0, 4, 1, 3],    rhythm: [0.5, 0.25, 0.5, 0.25, 1.0] },    // IDM skitter
      { pitches: [0, 4, 3, 5, 1],    rhythm: [0.33, 0.67, 0.5, 0.5, 1.0] },    // polymetric feel
      { pitches: [3, 0, 2],          rhythm: [0.75, 0.25, 1.0] },              // fragmented short
      { pitches: [0, 3, 5, 1, 4, 2], rhythm: [0.25, 0.25, 0.5, 0.5, 0.5, 0.5] }, // dense scramble
    ];
    const cell = pick(cellPool);
    return { pitches: [...cell.pitches], rhythm: [...cell.rhythm], length: cell.rhythm.reduce((a, b) => a + b, 0) };
  }

  sectionShape(type: SectionType): SectionShape {
    switch (type) {
      case 'intro':
        // Short intro — chaos enters sooner
        return { bars: 4,  activeRoles: new Set(['bass', 'chord', 'color']),                     intensity: 0.45 };
      case 'build':
        return { bars: 8,  activeRoles: new Set(['bass', 'chord', 'color', 'pulse']),            intensity: 0.65 };
      case 'peak':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color', 'pulse']),    intensity: 0.90 };
      case 'breakdown':
        return { bars: 8,  activeRoles: new Set(['chord', 'lead', 'color']),                     intensity: 0.50 };
      case 'groove':
        return { bars: 16, activeRoles: new Set(['bass', 'chord', 'lead', 'color', 'pulse']),    intensity: 0.80 };
    }
  }

  motifSlots(bars: number): boolean[] {
    // Irregular — on every bar when lead is active; density gives syro character
    return Array.from({ length: bars }, () => true);
  }

  cadenceFor(sectionType: SectionType, phraseIdx: number, totalPhrases: number): CadenceType {
    const isLast = phraseIdx === totalPhrases - 1;
    // syro mostly refuses resolution — "open" everywhere except final peak phrase
    if (sectionType === 'peak' && isLast) return 'half';
    return 'open';
  }

  buildPulse(sectionType: SectionType, phraseIdx: number, _totalPhrases: number): PulsePattern | null {
    if (sectionType === 'intro') return null;
    if (sectionType === 'breakdown') {
      // Breakdown strips to clap + hat skitter only
      return {
        hat:   'hh ~ hh hh ~ hh ~ hh',
        perc:  '~ ~ cp ~ ~ cp ~ ~',
      };
    }
    // Rotate between two polyrhythmic patterns across phrases to add variety
    const patterns: PulsePattern[] = [
      {
        kick:  'bd ~ bd ~ ~ bd ~ ~',          // unusual kick placement
        snare: '~ ~ sd ~ ~ ~ sd ~',           // 2 and 4 still anchor
        hat:   'hh hh hh ~ hh ~ hh hh',       // polyrhythmic 3-over-4 feel
        perc:  '~ cp ~ ~ cp ~ ~ cp',          // clap accents off-beat
      },
      {
        kick:  'bd ~ ~ bd ~ ~ bd ~',          // 3-against-8 kick
        snare: '~ ~ sd ~ sd ~ ~ sd',          // asymmetric snare
        hat:   'hh ~ hh hh ~ hh hh ~',        // broken hat
        perc:  'cp ~ ~ cp ~ ~ cp ~',          // 3-against-8 clap
      },
    ];
    return patterns[phraseIdx % patterns.length];
  }
}
