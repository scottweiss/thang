/**
 * Drum fill patterns for section transitions.
 *
 * Provides one-bar fill patterns that signal musical transitions between
 * sections. Different transitions get different fill characters:
 *
 * - build→peak: snare roll into crash (energy climax)
 * - peak→breakdown: strip-down to single kick (energy drop)
 * - breakdown→groove: kick rebuilds (momentum restart)
 * - groove→build: mixed tom roll (tension ramp)
 *
 * Fills are suppressed for delicate moods (ambient, avril, xtal) and
 * intro transitions. Per-mood gain scaling and complexity variations
 * keep fills stylistically appropriate.
 */

import type { Mood, Section } from '../types';

/** Moods too delicate for drum fills */
const DELICATE_MOODS: ReadonlySet<Mood> = new Set(['ambient', 'avril', 'xtal']);

/** Transitions that warrant a fill */
const FILL_TRANSITIONS: ReadonlySet<string> = new Set([
  'build→peak',
  'peak→breakdown',
  'breakdown→groove',
  'groove→build',
]);

/** Moods that get louder fills */
const LOUD_MOODS: ReadonlySet<Mood> = new Set(['trance', 'disco']);

/** Moods that get softer fills */
const SOFT_MOODS: ReadonlySet<Mood> = new Set(['lofi', 'downtempo']);

/** Moods that get extra hihat complexity */
const COMPLEX_MOODS: ReadonlySet<Mood> = new Set(['syro', 'blockhead']);

/**
 * Whether a drum fill should play during a section transition.
 *
 * Returns false for:
 * - Delicate moods (ambient, avril, xtal)
 * - Transitions from intro
 * - Non-standard transitions (e.g. build→groove)
 */
export function shouldPlayFill(
  fromSection: Section,
  toSection: Section,
  mood: Mood
): boolean {
  if (DELICATE_MOODS.has(mood)) return false;
  if (fromSection === 'intro') return false;
  return FILL_TRANSITIONS.has(`${fromSection}→${toSection}`);
}

interface FillTemplate {
  sounds: string[];
  gains: number[];
}

/** Base fill templates per transition type */
const FILL_TEMPLATES: Record<string, FillTemplate> = {
  'build→peak': {
    sounds: ['sd', 'sd', 'sd', 'sd', 'sd', 'sd', 'sd', 'cp'],
    gains: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  },
  'peak→breakdown': {
    sounds: ['bd', '~', '~', '~', '~', '~', '~', '~'],
    gains: [0.8, 0, 0, 0, 0, 0, 0, 0],
  },
  'breakdown→groove': {
    sounds: ['bd', '~', '~', '~', 'bd', '~', 'bd', 'bd'],
    gains: [0.5, 0, 0, 0, 0.6, 0, 0.7, 0.8],
  },
  'groove→build': {
    sounds: ['bd', 'sd', '~', 'sd', 'bd', 'sd', 'sd', 'cp'],
    gains: [0.4, 0.5, 0.3, 0.6, 0.5, 0.7, 0.8, 1.0],
  },
};

const DEFAULT_TEMPLATE: FillTemplate = {
  sounds: ['cp', '~', '~', '~', '~', '~', '~', '~'],
  gains: [0.7, 0, 0, 0, 0, 0, 0, 0],
};

/**
 * Apply mood-specific complexity to a fill template.
 * For syro/blockhead, intersperse hh between sd hits.
 * If there are no rest slots, alternate some sd hits with hh.
 */
function applyComplexity(template: FillTemplate): FillTemplate {
  const sounds = [...template.sounds];
  const gains = [...template.gains];
  let addedHH = false;

  // First pass: fill rest slots adjacent to sd hits
  for (let i = 0; i < sounds.length; i++) {
    if (sounds[i] === '~' && gains[i] === 0) {
      const prevIsSD = i > 0 && sounds[i - 1] === 'sd';
      const nextIsSD = i < sounds.length - 1 && sounds[i + 1] === 'sd';
      if (prevIsSD || nextIsSD) {
        sounds[i] = 'hh';
        gains[i] = 0.3;
        addedHH = true;
      }
    }
  }

  // Second pass: if no rests were available, alternate some sd hits with hh
  if (!addedHH) {
    for (let i = 0; i < sounds.length; i++) {
      if (sounds[i] === 'sd' && i % 2 === 1) {
        sounds[i] = 'hh';
        gains[i] = Math.max(gains[i] * 0.6, 0.2);
      }
    }
  }

  return { sounds, gains };
}

/**
 * Get the gain multiplier for a mood.
 */
function gainMultiplier(mood: Mood): number {
  if (LOUD_MOODS.has(mood)) return 1.2;
  if (SOFT_MOODS.has(mood)) return 0.7;
  return 1.0;
}

/**
 * Format a fill template into a Strudel pattern string.
 */
function formatPattern(template: FillTemplate, mult: number): string {
  const soundStr = template.sounds.join(' ');
  const gainStr = template.gains
    .map(g => {
      const scaled = Math.round(g * mult * 100) / 100;
      return scaled.toString();
    })
    .join(' ');
  return `sound("${soundStr}").gain("${gainStr}")`;
}

/**
 * Get a one-bar drum fill pattern for a section transition.
 *
 * @param fromSection  Section being left
 * @param toSection    Section being entered
 * @param mood         Current mood
 * @returns Strudel pattern string for the fill
 */
export function getDrumFill(
  fromSection: Section,
  toSection: Section,
  mood: Mood
): string {
  const key = `${fromSection}→${toSection}`;
  let template = FILL_TEMPLATES[key] ?? DEFAULT_TEMPLATE;

  // Apply complexity for syro/blockhead
  if (COMPLEX_MOODS.has(mood)) {
    template = applyComplexity(template);
  }

  const mult = gainMultiplier(mood);
  return formatPattern(template, mult);
}
