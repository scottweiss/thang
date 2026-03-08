/**
 * Register evolution — melodies naturally climb in register during builds
 * (creating excitement) and descend during breakdowns (releasing tension).
 *
 * This is one of the most universal principles in music: higher pitches
 * create more energy. By shifting the octave and pitch center of gravity
 * based on section type and progress, we get natural-feeling rises and
 * falls without explicitly composing them.
 */

import type { Mood, Section } from '../types';

/**
 * Returns an adjusted octave (integer) based on section type and progress.
 *
 * @param section         Current section type
 * @param sectionProgress 0-1, how far through the current section we are
 * @param baseOctave      Default octave for the layer (e.g. 4 for melody)
 * @returns Integer octave clamped to [2, 6]
 */
export function registerShift(
  section: Section,
  sectionProgress: number,
  baseOctave: number
): number {
  let octave: number;

  switch (section) {
    case 'build':
      // Gradually shift up over the section
      octave = baseOctave + sectionProgress;
      break;
    case 'peak':
      // Stay high
      octave = baseOctave + 1;
      break;
    case 'breakdown':
      // Descend from high to low over the section
      octave = baseOctave + 1 - sectionProgress * 2;
      break;
    case 'intro':
      octave = baseOctave;
      break;
    case 'groove':
      octave = baseOctave;
      break;
    default:
      octave = baseOctave;
  }

  return Math.max(2, Math.min(6, Math.round(octave)));
}

/**
 * Returns a MIDI note number (0-127) representing the "center of gravity"
 * for the melody. More continuous than registerShift — used for pitch
 * targeting rather than discrete octave selection.
 *
 * @param section         Current section type
 * @param sectionProgress 0-1, how far through the current section we are
 * @param tension         Current tension level (0-1)
 * @returns MIDI note number clamped to [36, 84]
 */
export function registerTarget(
  section: Section,
  sectionProgress: number,
  tension: number
): number {
  let note: number;

  switch (section) {
    case 'build':
      // Climb an octave over the section
      note = 60 + sectionProgress * 12;
      break;
    case 'peak':
      // High register, tension pushes even higher
      note = 72 + tension * 6;
      break;
    case 'breakdown':
      // Descend from high to low
      note = 72 - sectionProgress * 18;
      break;
    case 'intro':
      // Slight upward drift
      note = 58 + sectionProgress * 4;
      break;
    case 'groove':
      // Stable but tension adds brightness
      note = 60 + tension * 8;
      break;
    default:
      note = 60;
  }

  return Math.max(36, Math.min(84, note));
}

/**
 * Whether a mood benefits from register evolution. Some moods sound
 * better with dynamic register shifts; others are more static/meditative
 * and prefer a stable register.
 */
export function shouldShiftRegister(mood: Mood): boolean {
  switch (mood) {
    case 'trance':
    case 'syro':
    case 'blockhead':
    case 'disco':
    case 'downtempo':
    case 'lofi':
      return true;
    case 'ambient':
    case 'xtal':
    case 'avril':
    case 'flim':
      return false;
    default:
      return false;
  }
}
