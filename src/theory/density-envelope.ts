/**
 * Dynamic density envelopes for musical breathing.
 *
 * Instead of treating density as a flat parameter, this module creates
 * wave-like density curves that make music breathe naturally. Density
 * swells and recedes on multiple timescales:
 *
 * - Fast pulse (4-8 bars): creates breathing room within sections
 * - Medium wave (16-32 bars): builds and releases across phrases
 * - Slow tide (entire section): the macro shape of the section
 *
 * The combination creates the kind of natural ebb and flow that makes
 * generative music feel alive rather than static.
 */

/**
 * Compute a density modifier based on elapsed time and section.
 * Returns a multiplier (0.7 - 1.3) that modulates the base density.
 *
 * @param elapsed       Total elapsed time in seconds
 * @param sectionStart  When the current section started (seconds)
 * @param tempo         Current CPS (cycles per second)
 * @returns Density multiplier (0.7 - 1.3)
 */
export function densityEnvelope(
  elapsed: number,
  sectionStart: number,
  tempo: number
): number {
  const sectionTime = elapsed - sectionStart;

  // Fast pulse: breathe every ~4 bars (at current tempo)
  // 4 bars = 4 cycles, so period = 4/tempo seconds
  const fastPeriod = 4 / Math.max(0.1, tempo);
  const fastPhase = (sectionTime % fastPeriod) / fastPeriod;
  const fastWave = Math.sin(fastPhase * Math.PI * 2) * 0.08;

  // Medium wave: ~16 bars
  const medPeriod = 16 / Math.max(0.1, tempo);
  const medPhase = (sectionTime % medPeriod) / medPeriod;
  const medWave = Math.sin(medPhase * Math.PI * 2) * 0.12;

  // Slow section arc: build up over first 40%, sustain 40%, relax last 20%
  // (sectionTime is relative so this auto-scales to section length)
  const maxSectionTime = 60; // assume ~60s sections for normalization
  const sectionProgress = Math.min(1, sectionTime / maxSectionTime);
  let sectionArc: number;
  if (sectionProgress < 0.4) {
    sectionArc = sectionProgress / 0.4 * 0.1;  // ramp up
  } else if (sectionProgress < 0.8) {
    sectionArc = 0.1;  // sustain
  } else {
    sectionArc = 0.1 * (1 - (sectionProgress - 0.8) / 0.2);  // ramp down
  }

  return 1 + fastWave + medWave + sectionArc;
}

/**
 * Apply density envelope to a base density value.
 * Clamps result to valid range [0.1, 1.0].
 */
export function modulatedDensity(
  baseDensity: number,
  elapsed: number,
  sectionStart: number,
  tempo: number
): number {
  const mod = densityEnvelope(elapsed, sectionStart, tempo);
  return Math.max(0.1, Math.min(1.0, baseDensity * mod));
}
