/**
 * Velocity evolution — per-note gain patterns that morph with section progress.
 *
 * Static velocity patterns (accent14, flat, etc.) sound mechanical over time.
 * By blending between velocity curves based on section progress, we create
 * dynamic energy shifts at the note level:
 *
 * - **Build**: flat → crescendo (gradually intensifying accents)
 * - **Peak**: strong accents, slight randomization (human energy)
 * - **Breakdown**: decrescendo → flat (energy dissipating)
 * - **Groove**: steady accents with slight variation (pocket feel)
 * - **Intro**: very flat, minimal accents (establishing)
 *
 * Applied by generating a gain multiplier array that can be combined
 * with existing velocity patterns.
 */

import type { Section } from '../types';

/**
 * Generate an array of velocity multipliers that evolve with section progress.
 *
 * @param steps     Number of steps in the pattern
 * @param section   Current section type
 * @param progress  0-1 position within section
 * @param intensity Base intensity (0-1, typically 0.5-1.0)
 * @returns Array of multipliers (0.6-1.2) to apply to existing gain values
 */
export function evolvedVelocity(
  steps: number,
  section: Section,
  progress: number,
  intensity: number = 0.8
): number[] {
  if (steps <= 0) return [];
  const p = Math.max(0, Math.min(1, progress));
  const result: number[] = [];

  for (let i = 0; i < steps; i++) {
    const beatPhase = i / steps; // 0-1 position within the bar
    let v: number;

    switch (section) {
      case 'build':
        v = buildVelocity(beatPhase, p, intensity);
        break;
      case 'peak':
        v = peakVelocity(beatPhase, i, intensity);
        break;
      case 'breakdown':
        v = breakdownVelocity(beatPhase, p, intensity);
        break;
      case 'groove':
        v = grooveVelocity(beatPhase, i, intensity);
        break;
      case 'intro':
        v = introVelocity(beatPhase, p, intensity);
        break;
      default:
        v = 1.0;
    }

    result.push(Math.max(0.6, Math.min(1.2, v)));
  }

  return result;
}

/**
 * Build: energy ramps up. Early in section → gentle, late → driving accents.
 * Accents on beats 1 and 3 get stronger as the build progresses.
 */
function buildVelocity(beatPhase: number, progress: number, intensity: number): number {
  // Beat accent strength increases with progress
  const accentStrength = 0.05 + progress * 0.15 * intensity;
  const isOnBeat = beatPhase % 0.25 < 0.01 || beatPhase < 0.01;

  // Crescendo within the bar that increases with section progress
  const barCrescendo = beatPhase * progress * 0.1;

  return isOnBeat
    ? 1.0 + accentStrength + barCrescendo
    : 1.0 - accentStrength * 0.5 + barCrescendo;
}

/**
 * Peak: strong driving accents with slight humanization.
 * Maximum contrast between on-beat and off-beat.
 */
function peakVelocity(beatPhase: number, stepIndex: number, intensity: number): number {
  const isDownbeat = beatPhase < 0.01;
  const isBackbeat = Math.abs(beatPhase - 0.5) < 0.01;
  // Deterministic pseudo-random humanization
  const humanize = ((stepIndex * 7 + 3) % 11) / 55; // 0 to ~0.18

  if (isDownbeat) return 1.15 * intensity + humanize * 0.05;
  if (isBackbeat) return 1.1 * intensity + humanize * 0.05;
  return (0.85 + humanize * 0.1) * intensity;
}

/**
 * Breakdown: energy dissipates. Accents soften, dynamics flatten.
 */
function breakdownVelocity(beatPhase: number, progress: number, intensity: number): number {
  // Accents weaken as breakdown progresses
  const accentStrength = (1.0 - progress) * 0.1 * intensity;
  const isOnBeat = beatPhase % 0.25 < 0.01 || beatPhase < 0.01;

  // Decrescendo that deepens with progress
  const fade = progress * 0.08;

  return isOnBeat
    ? 1.0 + accentStrength - fade
    : 1.0 - accentStrength * 0.3 - fade;
}

/**
 * Groove: steady pocket with subtle swing-like accents.
 * Consistent energy, beats 1 and 3 slightly accented.
 */
function grooveVelocity(beatPhase: number, stepIndex: number, intensity: number): number {
  const beat = Math.round(beatPhase * 4);
  const humanize = ((stepIndex * 13 + 5) % 9) / 90; // tiny variation

  switch (beat) {
    case 0: return 1.05 * intensity + humanize; // downbeat
    case 2: return 1.0 * intensity + humanize;  // beat 3
    default: return 0.9 * intensity + humanize; // off-beats
  }
}

/**
 * Intro: very even dynamics, slowly introducing subtle accents.
 */
function introVelocity(beatPhase: number, progress: number, intensity: number): number {
  // Minimal accent that grows slightly
  const accentStrength = progress * 0.05 * intensity;
  const isDownbeat = beatPhase < 0.01;

  return isDownbeat
    ? 1.0 + accentStrength
    : 1.0 - accentStrength * 0.3;
}

/**
 * Apply evolved velocity to an existing gain pattern string.
 * Multiplies each gain value by the corresponding velocity multiplier.
 *
 * @param gainPattern  Space-separated gain values (e.g., "0.12 0.084 0.12")
 * @param velocities   Array of multipliers from evolvedVelocity()
 * @returns Modified gain pattern string
 */
export function applyVelocityEvolution(
  gainPattern: string,
  velocities: number[]
): string {
  const values = gainPattern.split(' ').map(parseFloat);
  if (values.some(isNaN)) return gainPattern;

  const result = values.map((v, i) => {
    const mult = velocities[i % velocities.length];
    return (v * mult).toFixed(4);
  });

  return result.join(' ');
}
