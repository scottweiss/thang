import { Layer } from './layer';
import { GenerativeState, Mood } from '../types';
import { stereoWidth } from '../theory/stereo-field';

export abstract class CachingLayer implements Layer {
  abstract name: string;
  abstract orbit: number;

  private cachedPattern: string | null = null;
  private lastGeneratedAtTick = -1;
  protected lastMood: Mood | null = null;

  generate(state: GenerativeState): string {
    if (!this.cachedPattern || this.shouldRegenerate(state)) {
      this.cachedPattern = this.buildPattern(state);
      this.lastGeneratedAtTick = state.tick;
      this.lastMood = state.mood;
    }

    let result = this.cachedPattern;

    // Dynamic stereo field: modulate pan range based on section/tension
    result = this.modulateStereo(result, state);

    // Apply layer gain multiplier for smooth section transitions
    const multiplier = state.layerGainMultipliers[this.name] ?? 1.0;
    if (multiplier < 1.0) {
      return this.applyGainMultiplier(result, multiplier);
    }
    return result;
  }

  private applyGainMultiplier(pattern: string, multiplier: number): string {
    // Replace .gain(X) with .gain(X * multiplier)
    return pattern.replace(
      /\.gain\(([^)]+)\)/,
      (match, gainExpr) => {
        // If gain is a simple number, multiply it
        const num = parseFloat(gainExpr);
        if (!isNaN(num)) {
          return `.gain(${(num * multiplier).toFixed(4)})`;
        }
        // If gain is a quoted string (velocity pattern), scale each value
        const quotedMatch = gainExpr.match(/^"([^"]+)"$/);
        if (quotedMatch) {
          const scaled = quotedMatch[1].split(' ')
            .map((v: string) => (parseFloat(v) * multiplier).toFixed(4))
            .join(' ');
          return `.gain("${scaled}")`;
        }
        // Otherwise wrap in expression
        return `.gain((${gainExpr}) * ${multiplier.toFixed(4)})`;
      }
    );
  }

  protected abstract buildPattern(state: GenerativeState): string;
  protected abstract shouldRegenerate(state: GenerativeState): boolean;

  protected ticksSinceLastGeneration(state: GenerativeState): number {
    if (this.lastGeneratedAtTick < 0) return Infinity;
    return state.tick - this.lastGeneratedAtTick;
  }

  /**
   * Scale the pan LFO range based on section and tension.
   * Peaks spread wide, intros/breakdowns narrow toward center.
   * Applied every tick so pan evolves smoothly with section changes.
   */
  private modulateStereo(pattern: string, state: GenerativeState): string {
    const width = stereoWidth(state.section, state.tension?.overall ?? 0.5);
    return pattern.replace(
      /\.pan\(sine\.range\(([0-9.]+),\s*([0-9.]+)\)\.slow\(([^)]+)\)\)/,
      (_match, minStr, maxStr, speed) => {
        const moodMin = parseFloat(minStr);
        const moodMax = parseFloat(maxStr);
        const center = (moodMin + moodMax) / 2;
        const halfRange = (moodMax - moodMin) / 2;
        const scaledHalf = halfRange * width;
        const min = Math.max(0, center - scaledHalf).toFixed(2);
        const max = Math.min(1, center + scaledHalf).toFixed(2);
        return `.pan(sine.range(${min}, ${max}).slow(${speed}))`;
      }
    );
  }

  protected moodChanged(state: GenerativeState): boolean {
    return this.lastMood !== null && this.lastMood !== state.mood;
  }
}
