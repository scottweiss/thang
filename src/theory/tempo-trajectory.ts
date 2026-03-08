/**
 * Tempo trajectory — gradual tempo evolution within sections.
 *
 * Beyond moment-to-moment rubato, real performances have longer-range
 * tempo shifts:
 * - **Builds**: slight accelerando — increasing excitement
 * - **Breakdowns**: slight ritardando — expansive breathing
 * - **Peaks**: steady tempo — maximum energy, no wavering
 * - **Groove**: very slight push — forward momentum
 *
 * The shifts are subtle (±3% typically) but create a living, breathing
 * feel that static tempo lacks. Combined with per-tick rubato, the
 * tempo feels human rather than machine-locked.
 */

import type { Mood, Section } from '../types';

interface TempoTrajectoryConfig {
  /** Target tempo multiplier at the end of the section (1.0 = no change) */
  target: number;
  /** Easing curve: 'linear' | 'ease-in' | 'ease-out' */
  curve: 'linear' | 'ease-in' | 'ease-out';
}

const SECTION_TEMPO: Record<Section, TempoTrajectoryConfig> = {
  intro:     { target: 1.0,  curve: 'linear' },     // steady
  build:     { target: 1.03, curve: 'ease-in' },     // slight accelerando
  peak:      { target: 1.01, curve: 'linear' },      // nearly steady, slight push
  breakdown: { target: 0.97, curve: 'ease-out' },    // ritardando
  groove:    { target: 1.01, curve: 'linear' },      // gentle push
};

/**
 * Per-mood sensitivity to tempo trajectory.
 * Ambient/dreamy moods have more tempo freedom; driving moods stay tighter.
 */
const MOOD_TEMPO_SENSITIVITY: Record<Mood, number> = {
  ambient:   1.5,   // most fluid
  avril:     1.3,
  xtal:      1.2,
  flim:      1.1,
  downtempo: 1.0,
  lofi:      0.9,
  blockhead: 0.8,
  disco:     0.5,   // fairly rigid
  trance:    0.4,   // very rigid
  syro:      0.6,
};

/**
 * Compute the tempo multiplier based on section progress.
 *
 * @param section   Current section
 * @param progress  Section progress (0-1)
 * @param mood      Current mood (scales the effect)
 * @returns Tempo multiplier (typically 0.97-1.03)
 */
export function tempoTrajectoryMultiplier(
  section: Section,
  progress: number,
  mood: Mood
): number {
  const config = SECTION_TEMPO[section];
  const sensitivity = MOOD_TEMPO_SENSITIVITY[mood] ?? 1.0;

  // The deviation from 1.0
  const maxDeviation = (config.target - 1.0) * sensitivity;

  // Apply easing curve
  let t: number;
  switch (config.curve) {
    case 'ease-in':
      t = progress * progress; // slow start, accelerates
      break;
    case 'ease-out':
      t = 1 - (1 - progress) * (1 - progress); // fast start, decelerates
      break;
    default:
      t = progress;
  }

  return 1.0 + maxDeviation * t;
}

/**
 * Get the mood sensitivity for tempo trajectory.
 */
export function moodTempoSensitivity(mood: Mood): number {
  return MOOD_TEMPO_SENSITIVITY[mood] ?? 1.0;
}
