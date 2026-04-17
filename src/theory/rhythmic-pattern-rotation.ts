import type { Mood } from '../types';

/**
 * Rhythmic pattern rotation — accent patterns rotate their position
 * over time, creating evolving grooves that prevent stagnation.
 * The rotation is slow enough to maintain groove coherence.
 */

const moodRotationSpeed: Record<Mood, number> = {
  ambient: 0.15,
  plantasia: 0.15,
  downtempo: 0.25,
  lofi: 0.30,
  trance: 0.10,
  avril: 0.30,
  xtal: 0.40,
  syro: 0.55,
  blockhead: 0.35,
  flim: 0.40,
  disco: 0.15,
};

/**
 * Gain multiplier from rotating accent pattern.
 * tick: current tick
 * beatPosition: 0-15 grid position
 * The accent peak rotates slowly around the bar.
 */
export function patternRotationGain(
  tick: number,
  beatPosition: number,
  mood: Mood,
): number {
  const speed = moodRotationSpeed[mood];
  // Slowly rotating accent position
  const accentPos = (tick * speed * 0.3) % 16;
  const pos = beatPosition % 16;
  // Distance from accent position (circular)
  const dist = Math.min(Math.abs(pos - accentPos), 16 - Math.abs(pos - accentPos));
  // Bell curve around accent
  const emphasis = Math.exp(-(dist * dist) / 8);
  const adjustment = (emphasis - 0.3) * 0.04;
  return Math.max(0.97, Math.min(1.03, 1.0 + adjustment));
}

/** Per-mood rotation speed for testing */
export function rotationSpeed(mood: Mood): number {
  return moodRotationSpeed[mood];
}
