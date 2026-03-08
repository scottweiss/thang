/**
 * Envelope evolution — full ADSR parameters evolve with section progress.
 *
 * Each ADSR parameter shapes a different aspect of note feel:
 * - Attack: onset speed (short = punchy, long = soft)
 * - Decay: how quickly the note settles from peak to sustain level
 * - Sustain: held volume level (low = percussive pluck, high = organ-like)
 * - Release: tail after note-off (short = tight, long = spacious)
 *
 * During builds: attack/decay shorten, sustain drops → percussive energy.
 * During breakdowns: decay lengthens, sustain rises → flowing pads.
 * Peaks: punchy and immediate. Intros: soft and atmospheric.
 *
 * Applied as multipliers to existing .attack()/.decay()/.sustain()/.release() values.
 * Kept subtle (±30%) to preserve the timbre's character.
 */

import type { Section } from '../types';

interface EnvelopeShape {
  attackStart: number;   // attack multiplier at section start
  attackEnd: number;     // attack multiplier at section end
  decayStart: number;    // decay multiplier at section start
  decayEnd: number;      // decay multiplier at section end
  sustainStart: number;  // sustain multiplier at section start
  sustainEnd: number;    // sustain multiplier at section end
  releaseStart: number;  // release multiplier at section start
  releaseEnd: number;    // release multiplier at section end
}

const SECTION_ENVELOPE: Record<Section, EnvelopeShape> = {
  intro: {
    attackStart: 1.3,  attackEnd: 1.1,    // soft, opening up
    decayStart: 1.2,   decayEnd: 1.1,     // long decay → atmospheric
    sustainStart: 1.15, sustainEnd: 1.05,  // elevated sustain → notes float
    releaseStart: 1.3, releaseEnd: 1.1,
  },
  build: {
    attackStart: 1.1,  attackEnd: 0.75,   // tightening
    decayStart: 1.05,  decayEnd: 0.75,    // decay shortens → percussive energy
    sustainStart: 1.0, sustainEnd: 0.8,   // sustain drops → notes pop then disappear
    releaseStart: 1.1, releaseEnd: 0.8,
  },
  peak: {
    attackStart: 0.8,  attackEnd: 0.85,   // punchy, stable
    decayStart: 0.85,  decayEnd: 0.9,     // short decay → driving
    sustainStart: 0.85, sustainEnd: 0.9,  // low sustain → punchy
    releaseStart: 0.85, releaseEnd: 0.9,
  },
  breakdown: {
    attackStart: 0.9,  attackEnd: 1.3,    // softening
    decayStart: 0.95,  decayEnd: 1.3,     // decay lengthens → notes bloom
    sustainStart: 0.95, sustainEnd: 1.25, // sustain rises → pads sustain
    releaseStart: 0.9, releaseEnd: 1.3,
  },
  groove: {
    attackStart: 0.95, attackEnd: 1.0,    // relaxed pocket
    decayStart: 0.95,  decayEnd: 1.0,     // steady
    sustainStart: 0.95, sustainEnd: 1.0,  // consistent
    releaseStart: 0.95, releaseEnd: 1.0,
  },
};

/**
 * Compute attack time multiplier based on section progress.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Multiplier for .attack() values (typically 0.75-1.3)
 */
export function attackMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_ENVELOPE[section] ?? SECTION_ENVELOPE.groove;
  return shape.attackStart + (shape.attackEnd - shape.attackStart) * p;
}

/**
 * Compute decay time multiplier based on section progress.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Multiplier for .decay() values (typically 0.75-1.3)
 */
export function decayMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_ENVELOPE[section] ?? SECTION_ENVELOPE.groove;
  return shape.decayStart + (shape.decayEnd - shape.decayStart) * p;
}

/**
 * Compute sustain level multiplier based on section progress.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Multiplier for .sustain() values (typically 0.8-1.25)
 */
export function sustainMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_ENVELOPE[section] ?? SECTION_ENVELOPE.groove;
  return shape.sustainStart + (shape.sustainEnd - shape.sustainStart) * p;
}

/**
 * Compute release time multiplier based on section progress.
 */
export function releaseMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_ENVELOPE[section] ?? SECTION_ENVELOPE.groove;
  return shape.releaseStart + (shape.releaseEnd - shape.releaseStart) * p;
}

/**
 * Whether envelope evolution should be applied for this section.
 * Only sections with meaningful envelope change benefit.
 */
export function shouldApplyEnvelopeEvolution(section: Section): boolean {
  const shape = SECTION_ENVELOPE[section];
  const attackDelta = Math.abs(shape.attackEnd - shape.attackStart);
  const decayDelta = Math.abs(shape.decayEnd - shape.decayStart);
  const sustainDelta = Math.abs(shape.sustainEnd - shape.sustainStart);
  const releaseDelta = Math.abs(shape.releaseEnd - shape.releaseStart);
  return attackDelta > 0.12 || decayDelta > 0.12 || sustainDelta > 0.12 || releaseDelta > 0.12;
}
