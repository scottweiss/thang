/**
 * Cadential patterns for phrase-level harmonic closure.
 *
 * Near section boundaries, the progression should resolve toward tonic (I)
 * using standard cadential formulas. This creates the sense of "arrival"
 * that makes section transitions feel intentional rather than arbitrary.
 */

/**
 * Given a current degree and a cadence urgency (0-1), return a target degree
 * that steers toward a cadential resolution.
 *
 * Urgency 0 = no steering (return null to let Markov decide)
 * Urgency 0.5+ = strongly favor pre-dominant/dominant degrees
 * Urgency 0.9+ = force resolution to tonic
 *
 * @param currentDegree  Current chord degree (0-6)
 * @param urgency        How close we are to needing resolution (0-1)
 * @returns Target degree, or null if no steering needed
 */
export function getCadentialTarget(
  currentDegree: number, urgency: number
): number | null {
  // No steering below threshold
  if (urgency < 0.4) return null;

  // Random check — even at high urgency, allow some freedom
  if (Math.random() > urgency) return null;

  if (urgency >= 0.9) {
    // Final resolution: land on I (degree 0)
    return 0;
  }

  if (urgency >= 0.7) {
    // Dominant preparation: move to V (degree 4) or V/IV approach
    if (currentDegree === 4) return 0; // V → I
    if (currentDegree === 0) return 0; // stay on I if already there
    return 4; // move to V
  }

  // Pre-dominant zone: favor ii (1), IV (3), or vi (5)
  const preDominants = [1, 3, 5];
  // Pick the pre-dominant closest to current position for smooth voice leading
  let best = preDominants[0];
  let bestDist = 7;
  for (const pd of preDominants) {
    const dist = Math.min(
      Math.abs(pd - currentDegree),
      7 - Math.abs(pd - currentDegree)
    );
    if (dist < bestDist) {
      bestDist = dist;
      best = pd;
    }
  }
  return best;
}

/**
 * Compute cadence urgency based on section progress.
 * Returns 0-1 where 1 means "resolve NOW".
 *
 * @param sectionProgress  How far through the section (0-1)
 */
export function cadenceUrgency(sectionProgress: number): number {
  if (sectionProgress < 0.75) return 0;
  // Ramp from 0 to 1 over the last 25% of the section
  return (sectionProgress - 0.75) / 0.25;
}
