/**
 * Drum pattern evolution — patterns that breathe and build.
 *
 * Static drum patterns get boring after a few bars. Real producers
 * evolve patterns by:
 * - Adding ghost notes as a section progresses
 * - Removing elements during breakdowns
 * - Intensifying hi-hat patterns approaching peaks
 * - Creating variations on the base pattern every N bars
 *
 * This module provides functions to evolve a base drum pattern
 * based on time position within a section.
 */

/**
 * Evolve a drum pattern by adding or removing elements based on
 * section progress.
 *
 * @param pattern      Base pattern string (space-separated: "bd ~ hh ~ sd ~")
 * @param progress     Progress through section (0 = start, 1 = end)
 * @param direction    'build' = add elements, 'thin' = remove elements
 * @param intensity    How much to evolve (0-1)
 * @returns Evolved pattern string
 */
export function evolveDrumPattern(
  pattern: string,
  progress: number,
  direction: 'build' | 'thin',
  intensity: number
): string {
  const steps = pattern.split(' ');

  if (direction === 'build') {
    // Gradually add ghost hi-hats in empty slots
    const addProb = progress * intensity * 0.3;
    return steps.map(step => {
      if (step !== '~') return step;
      return Math.random() < addProb ? 'hh' : '~';
    }).join(' ');
  }

  // Thin: gradually remove non-essential elements
  const keepProb = 1.0 - progress * intensity * 0.6;
  return steps.map(step => {
    if (step === '~' || step === 'bd') return step; // always keep rests and kick
    return Math.random() < keepProb ? step : '~';
  }).join(' ');
}

/**
 * Create a pattern variation by shifting accents and swapping instruments.
 *
 * @param pattern   Base pattern
 * @param variation How much to vary (0 = identical, 1 = very different)
 * @returns Varied pattern
 */
export function varyDrumPattern(
  pattern: string,
  variation: number
): string {
  const steps = pattern.split(' ');

  return steps.map(step => {
    if (step === '~' || Math.random() >= variation * 0.3) return step;

    // Swap instruments occasionally
    if (step === 'hh' && Math.random() < 0.3) return 'cp';
    if (step === 'sd' && Math.random() < 0.2) return 'cp';
    if (step === 'cp' && Math.random() < 0.3) return 'sd';

    return step;
  }).join(' ');
}

/**
 * Calculate section progress from tick and section duration.
 * Returns 0 at start, 1 at end.
 */
export function sectionProgress(
  ticksSinceSectionChange: number,
  estimatedSectionTicks: number
): number {
  if (estimatedSectionTicks <= 0) return 0;
  return Math.min(1.0, ticksSinceSectionChange / estimatedSectionTicks);
}
