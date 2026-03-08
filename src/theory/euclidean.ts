/**
 * Euclidean rhythm generator using the Bresenham/bucket method.
 * Distributes `pulses` hits as evenly as possible across `steps` slots.
 *
 * This produces maximally-even rhythms — the mathematical foundation
 * behind many world music traditions:
 *   E(3,8)  = tresillo (Cuban)
 *   E(5,8)  = cinquillo (West African)
 *   E(5,16) = bossa nova
 *   E(7,12) = West African bell
 *   E(7,16) = Afro-Cuban
 */
export function euclidean(pulses: number, steps: number): boolean[] {
  if (pulses >= steps) return new Array(steps).fill(true);
  if (pulses <= 0) return new Array(steps).fill(false);

  const result: boolean[] = [];
  let bucket = 0;
  for (let i = 0; i < steps; i++) {
    bucket += pulses;
    if (bucket >= steps) {
      bucket -= steps;
      result.push(true);
    } else {
      result.push(false);
    }
  }
  return result;
}

/** Rotate a boolean pattern by `offset` steps. */
export function rotatePattern(pattern: boolean[], offset: number): boolean[] {
  const len = pattern.length;
  if (len === 0) return [];
  const norm = ((offset % len) + len) % len;
  return [...pattern.slice(norm), ...pattern.slice(0, norm)];
}

/**
 * Generate fill positions from a Euclidean rhythm.
 * Returns array of step indices where pulses land.
 */
export function euclideanFillPositions(
  pulses: number, steps: number, rotation: number = 0
): number[] {
  const pattern = rotatePattern(euclidean(pulses, steps), rotation);
  return pattern
    .map((hit, i) => hit ? i : -1)
    .filter(i => i >= 0);
}
