/**
 * Phrase-position articulation — note character varies within phrases.
 *
 * A great performer doesn't play every note the same way:
 * - First note: crisp attack (announces the phrase)
 * - Middle notes: legato, smooth (connected, flowing)
 * - Last note: longer release (lets the phrase breathe away)
 * - After rest: slight accent (re-entry after silence)
 *
 * This creates the micro-level expression that makes melodies feel
 * performed rather than sequenced.
 *
 * Returns per-note ADSR multipliers that modify the base articulation.
 */

import type { Mood } from '../types';

export interface ArticulationMultipliers {
  attackMult: number;   // < 1 = crisper, > 1 = softer onset
  decayMult: number;    // > 1 = longer decay (more legato)
  sustainMult: number;  // > 1 = more sustain (connected)
  releaseMult: number;  // > 1 = longer tail
}

/**
 * Compute articulation multipliers for each position in a step array.
 *
 * @param steps      Step array (notes and rests, '~' = rest)
 * @param mood       Current mood (controls expressiveness depth)
 * @param restToken  Token for silence
 * @returns Array of multiplier objects, one per step
 */
export function phraseArticulation(
  steps: string[],
  mood: Mood,
  restToken: string = '~'
): ArticulationMultipliers[] {
  const depth = MOOD_ARTICULATION_DEPTH[mood];
  const result: ArticulationMultipliers[] = [];

  for (let i = 0; i < steps.length; i++) {
    if (steps[i] === restToken) {
      result.push(NEUTRAL);
      continue;
    }

    const position = classifyPosition(steps, i, restToken);
    const raw = POSITION_MULTIPLIERS[position];

    // Scale by mood depth: 0 = flat (no variation), 1 = full expression
    result.push({
      attackMult: 1.0 + (raw.attackMult - 1.0) * depth,
      decayMult: 1.0 + (raw.decayMult - 1.0) * depth,
      sustainMult: 1.0 + (raw.sustainMult - 1.0) * depth,
      releaseMult: 1.0 + (raw.releaseMult - 1.0) * depth,
    });
  }

  return result;
}

/**
 * Convert phrase articulation to Strudel-compatible ADSR multiplier strings.
 * Returns space-separated multiplier values for each ADSR parameter.
 */
export function articulationToGainPattern(
  mults: ArticulationMultipliers[]
): { attack: string; decay: string; sustain: string; release: string } {
  return {
    attack: mults.map(m => m.attackMult.toFixed(3)).join(' '),
    decay: mults.map(m => m.decayMult.toFixed(3)).join(' '),
    sustain: mults.map(m => m.sustainMult.toFixed(3)).join(' '),
    release: mults.map(m => m.releaseMult.toFixed(3)).join(' '),
  };
}

type NotePosition = 'first' | 'middle' | 'last' | 'reentry' | 'solo';

const NEUTRAL: ArticulationMultipliers = {
  attackMult: 1.0,
  decayMult: 1.0,
  sustainMult: 1.0,
  releaseMult: 1.0,
};

/**
 * Position multipliers — how each phrase position modifies the base ADSR.
 */
const POSITION_MULTIPLIERS: Record<NotePosition, ArticulationMultipliers> = {
  first: {
    attackMult: 0.7,    // crisper attack (announces phrase)
    decayMult: 0.9,     // slightly shorter
    sustainMult: 1.0,   // normal
    releaseMult: 0.8,   // tighter (connecting to next note)
  },
  middle: {
    attackMult: 1.2,    // softer onset (legato)
    decayMult: 1.1,     // slightly longer
    sustainMult: 1.3,   // more sustain (connected)
    releaseMult: 0.7,   // short release (flows into next)
  },
  last: {
    attackMult: 1.0,    // normal
    decayMult: 1.3,     // longer decay (lingering)
    sustainMult: 0.8,   // less sustain
    releaseMult: 1.8,   // long release (phrase breathes away)
  },
  reentry: {
    attackMult: 0.6,    // very crisp (attention after silence)
    decayMult: 1.0,     // normal
    sustainMult: 1.0,   // normal
    releaseMult: 1.0,   // normal
  },
  solo: {
    attackMult: 0.8,    // clear attack
    decayMult: 1.2,     // lingers
    sustainMult: 1.0,   // normal
    releaseMult: 1.5,   // breathes out
  },
};

/**
 * Classify a note's position within its phrase.
 */
function classifyPosition(
  steps: string[],
  index: number,
  restToken: string
): NotePosition {
  const prevIsRest = index === 0 || steps[index - 1] === restToken;
  const nextIsRest = index === steps.length - 1 || steps[index + 1] === restToken;

  if (prevIsRest && nextIsRest) return 'solo';
  if (prevIsRest) return index > 0 ? 'reentry' : 'first';
  if (nextIsRest) return 'last';
  return 'middle';
}

/**
 * How deeply phrase articulation affects each mood.
 * Jazz/intimate moods get more expression; electronic moods less.
 */
/**
 * Get per-note gain accents based on phrase position.
 * Returns gain multipliers: first notes are accented, last notes taper.
 */
export function phraseGainAccents(
  steps: string[],
  mood: Mood,
  restToken: string = '~'
): number[] {
  const depth = MOOD_ARTICULATION_DEPTH[mood];
  return steps.map((step, i) => {
    if (step === restToken) return 1.0;
    const pos = classifyPosition(steps, i, restToken);
    const accent = POSITION_GAIN_ACCENT[pos];
    return 1.0 + (accent - 1.0) * depth;
  });
}

const POSITION_GAIN_ACCENT: Record<NotePosition, number> = {
  first:   1.12,   // announce the phrase
  middle:  0.95,   // slightly softer (legato feel)
  last:    0.88,   // taper off
  reentry: 1.15,   // re-entry after silence
  solo:    1.05,   // isolated note, clear
};

const MOOD_ARTICULATION_DEPTH: Record<Mood, number> = {
  avril:     0.8,    // most expressive — intimate piano
  flim:      0.7,    // delicate expression
  lofi:      0.6,    // jazzy touch
  downtempo: 0.5,    // moderate expression
  xtal:      0.5,    // dreamy expression
  blockhead: 0.5,    // hip-hop dynamics
  ambient:   0.3,    // gentle — sustained tones need less variation,
  plantasia: 0.3,
  syro:      0.4,    // some expression, mostly mechanical
  disco:     0.3,    // groove-focused, less phrase variation
  trance:    0.2,    // mechanical by design
};
