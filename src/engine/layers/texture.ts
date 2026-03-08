import { CachingLayer } from '../caching-layer';
import { GenerativeState, Section } from '../../types';
import { randomChoice } from '../random';

// Curated pattern templates per genre
// 16 steps: bd=kick, sd=snare, cp=clap, hh=hi-hat, ~=rest

// Velocity templates — per-step gain multipliers for human feel
// Values are relative: 1.0 = full accent, 0.5 = ghost note
const LOFI_VELOCITIES = [
  '1 0.4 0.3 0.5 1 0.3 0.4 0.7 0.9 0.3 0.5 0.4 1 0.3 0.4 0.5',   // classic swing
  '1 0.3 0.5 0.6 1 0.4 0.3 0.8 1 0.3 0.6 0.3 1 0.5 0.3 0.4',     // J Dilla feel
  '0.9 0.4 0.4 0.7 1 0.3 0.5 0.5 0.8 0.4 0.3 0.6 1 0.4 0.5 0.3', // laid back
];

const DOWNTEMPO_VELOCITIES = [
  '1 0.3 0.2 0.3 0.9 0.2 0.3 0.4 0.8 0.2 0.3 0.3 0.7 0.2 0.3 0.2', // spacious
  '0.9 0.2 0.3 0.5 1 0.3 0.2 0.6 0.8 0.3 0.2 0.4 0.9 0.2 0.3 0.3', // breathing
];

// Lofi boom-bap patterns — J Dilla / Nujabes inspired
// Syncopated kicks, snare on 2&4, ghost hats
const LOFI_PATTERNS = [
  'bd ~ ~ ~ sd ~ ~ bd ~ ~ bd ~ sd ~ ~ ~',    // classic boom-bap
  'bd ~ ~ bd ~ ~ sd ~ ~ ~ bd ~ sd ~ hh ~',   // syncopated kick
  'bd ~ hh ~ sd ~ ~ ~ bd ~ ~ hh sd ~ ~ ~',   // ghost hat
  'bd ~ ~ ~ sd ~ hh ~ ~ bd ~ ~ sd ~ ~ hh',   // offbeat hat
  'bd ~ bd ~ sd ~ ~ ~ ~ ~ bd ~ sd ~ hh ~',   // double kick
  'bd hh ~ ~ sd ~ ~ bd ~ hh ~ ~ sd ~ ~ ~',   // hat groove
];

// Downtempo broken beat — Bonobo / Boards of Canada inspired
// Sparse, spacious, organic feel
const DOWNTEMPO_PATTERNS = [
  'bd ~ ~ ~ ~ ~ sd ~ ~ ~ ~ ~ ~ ~ ~ ~',       // minimal
  'bd ~ ~ ~ ~ ~ cp ~ ~ ~ bd ~ ~ ~ ~ ~',      // clap variant
  'bd ~ ~ ~ sd ~ ~ ~ ~ ~ ~ ~ bd ~ ~ ~',      // wide kick
  'bd ~ hh ~ ~ ~ sd ~ ~ ~ ~ hh ~ ~ ~ ~',     // sparse hat
  'bd ~ ~ ~ ~ ~ cp ~ bd ~ ~ ~ ~ ~ hh ~',     // broken
  '~ ~ ~ ~ sd ~ ~ ~ bd ~ ~ ~ ~ ~ cp ~',      // offset
];

// Trance 4/4 patterns — solid and driving
const TRANCE_PATTERNS_PEAK = [
  'bd ~ hh ~ bd ~ hh ~ bd ~ hh ~ bd ~ hh ~', // classic 4/4 + offbeat hat
  'bd ~ hh cp bd ~ hh ~ bd ~ hh cp bd ~ hh ~', // with clap
  'bd hh ~ hh bd hh ~ hh bd hh ~ hh bd hh ~ hh', // busy hat
];

// Trance build patterns — rolling hats, building tension
const TRANCE_PATTERNS_BUILD = [
  'hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh', // 16th hat roll
  'bd ~ hh hh ~ hh hh hh bd ~ hh hh hh hh hh hh',     // accelerating
  '~ ~ hh ~ ~ hh hh ~ ~ hh hh hh hh hh hh hh',        // building roll
];

// Trance breakdown — minimal
const TRANCE_PATTERNS_BREAK = [
  '~ ~ ~ ~ cp ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~',        // just a clap
  '~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cp ~ ~ ~',        // sparse clap
  'hh ~ ~ ~ ~ ~ ~ ~ hh ~ ~ ~ ~ ~ ~ ~',       // sparse hat
];

// Transition fills — played for one cycle when entering a new section
const FILLS_INTO_PEAK = [
  'bd ~ sd hh bd hh sd hh bd hh sd hh sd sd sd sd', // building snare roll
  'hh hh hh hh sd hh sd hh sd sd sd sd bd sd bd sd', // accelerating roll
  'bd ~ ~ sd ~ sd sd ~ bd sd bd sd sd sd sd cp',     // classic fill into drop
];

const FILLS_INTO_BREAKDOWN = [
  'bd ~ ~ ~ sd ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ cp',             // sparse exit
  '~ ~ ~ ~ ~ ~ ~ ~ bd ~ ~ ~ ~ ~ ~ ~',               // single thud
  'hh ~ hh ~ hh ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~',             // hat fade out
];

const FILLS_INTO_BUILD = [
  '~ ~ hh ~ ~ ~ hh ~ ~ ~ hh hh ~ hh hh hh',        // hat ramp up
  'bd ~ ~ ~ ~ ~ ~ ~ hh ~ hh ~ hh hh hh hh',        // kick + accelerating hats
];

const FILLS_INTO_GROOVE = [
  'bd ~ hh sd ~ hh bd hh sd ~ bd hh sd hh bd cp',   // funky fill
  'bd ~ ~ ~ sd ~ bd ~ sd hh ~ ~ sd ~ hh cp',        // groovy entrance
];

export class TextureLayer extends CachingLayer {
  name = 'texture';
  orbit = 3;

  protected shouldRegenerate(state: GenerativeState): boolean {
    if (state.mood === 'ambient') return true;
    if (this.moodChanged(state)) return true;
    if (state.scaleChanged) return true;
    if (state.sectionChanged) return true;

    const loopTicks = { downtempo: 8, lofi: 8, trance: 6, avril: 12 }[state.mood] ?? 8;
    if (this.ticksSinceLastGeneration(state) >= loopTicks) return true;

    return false;
  }

  protected buildPattern(state: GenerativeState): string {
    const density = state.params.density;
    const mood = state.mood;
    const gain = 0.3 * density;
    const room = 0.3 + state.params.spaciousness * 0.3;
    const brightness = state.params.brightness;

    // Play a transition fill on section changes (not for ambient/avril)
    if (state.sectionChanged && mood !== 'ambient' && mood !== 'avril') {
      const fill = this.getTransitionFill(state.section);
      if (fill) {
        const fillGain = gain * (mood === 'trance' ? 1.2 : 0.8);
        return `sound("${fill}")
          .slow(1)
          .gain(${fillGain.toFixed(3)})
          .lpf(${(2000 + brightness * 4000).toFixed(0)})
          .room(${(room * 0.6).toFixed(2)})
          .roomsize(2)
          .orbit(${this.orbit})`;
      }
    }

    switch (mood) {
      case 'ambient':
        return this.buildAmbientPattern(density, gain, room, brightness);

      case 'downtempo':
        return this.buildDowntempoPattern(density, gain * 0.8, room, brightness, state.section);

      case 'lofi':
        return this.buildLofiPattern(density, gain, room * 0.7, brightness, state.section);

      case 'trance':
        return this.buildTrancePattern(density, gain * 1.2, room * 0.5, brightness, state.section);

      case 'avril':
        return this.buildAvrilPattern(density, gain, room, brightness);
    }
  }

  private buildAmbientPattern(
    density: number, gain: number, room: number, brightness: number
  ): string {
    // Ambient stays random and sparse
    const steps: string[] = [];
    for (let i = 0; i < 16; i++) {
      if (Math.random() < density * 0.12) {
        steps.push('hh');
      } else {
        steps.push('~');
      }
    }

    return `sound("${steps.join(' ')}")
      .slow(3)
      .gain(${(gain * 0.4).toFixed(3)})
      .lpf(${(2500 + brightness * 3000).toFixed(0)})
      .room(${room.toFixed(2)})
      .roomsize(3)
      .orbit(${this.orbit})`;
  }

  private buildDowntempoPattern(
    density: number, gain: number, room: number,
    brightness: number, section: Section
  ): string {
    let pattern = randomChoice(DOWNTEMPO_PATTERNS);

    if (section === 'breakdown') {
      pattern = this.thinPattern(pattern, 0.4);
    }
    if (density > 0.5) {
      pattern = this.addGhostHats(pattern, (density - 0.5) * 0.25);
    }

    // Downtempo: spacious, organic — more reverb, delay, wider stereo, gentle LPF
    const dtGainPattern = this.applyVelocity(gain, randomChoice(DOWNTEMPO_VELOCITIES));
    return `sound("${pattern}")
      .slow(1)
      .gain("${dtGainPattern}")
      .lpf(${(1800 + brightness * 3000).toFixed(0)})
      .pan(sine.range(0.3, 0.7).slow(5))
      .room(${(room * 1.2).toFixed(2)})
      .roomsize(3)
      .delay(0.2)
      .delaytime(0.375)
      .delayfeedback(0.15)
      .orbit(${this.orbit})`;
  }

  private buildLofiPattern(
    density: number, gain: number, room: number,
    brightness: number, section: Section
  ): string {
    let pattern = randomChoice(LOFI_PATTERNS);

    if (section === 'breakdown') {
      pattern = this.thinPattern(pattern, 0.4);
    }
    if (density > 0.5) {
      pattern = this.addGhostHats(pattern, (density - 0.5) * 0.3);
    }

    // Lofi: warm, crunchy — bit crush, heavy LPF, tight room, velocity groove
    const lofiGainPattern = this.applyVelocity(gain, randomChoice(LOFI_VELOCITIES));
    return `sound("${pattern}")
      .slow(1)
      .gain("${lofiGainPattern}")
      .crush(${(10 + brightness * 4).toFixed(0)})
      .lpf(${(1500 + brightness * 2500).toFixed(0)})
      .hpf(80)
      .room(${(room * 0.5).toFixed(2)})
      .roomsize(1)
      .orbit(${this.orbit})`;
  }

  private buildTrancePattern(
    density: number, gain: number, room: number, brightness: number, section: Section
  ): string {
    let patterns: string[];

    switch (section) {
      case 'intro':
      case 'breakdown':
        patterns = TRANCE_PATTERNS_BREAK;
        break;
      case 'build':
        patterns = TRANCE_PATTERNS_BUILD;
        break;
      default:
        patterns = TRANCE_PATTERNS_PEAK;
    }

    const pattern = randomChoice(patterns);

    // Trance: punchy, tight, bright — minimal reverb, high LPF, slight compression via gain
    return `sound("${pattern}")
      .slow(1)
      .gain(${gain.toFixed(3)})
      .hpf(40)
      .lpf(${(3500 + brightness * 5000).toFixed(0)})
      .room(${(room * 0.3).toFixed(2)})
      .roomsize(0.5)
      .orbit(${this.orbit})`;
  }

  private buildAvrilPattern(
    density: number, gain: number, room: number, brightness: number
  ): string {
    // Near-silent sparse pops — like tape crackle, barely audible
    const steps: string[] = [];
    for (let i = 0; i < 16; i++) {
      if (Math.random() < density * 0.06) {
        steps.push('hh');
      } else {
        steps.push('~');
      }
    }

    return `sound("${steps.join(' ')}")
      .slow(4)
      .gain(${(gain * 0.15).toFixed(3)})
      .hpf(${(4000 + brightness * 2000).toFixed(0)})
      .lpf(${(8000 + brightness * 3000).toFixed(0)})
      .room(${(room * 0.8).toFixed(2)})
      .roomsize(3)
      .orbit(${this.orbit})`;
  }

  // Pick a fill pattern based on which section we're entering
  private getTransitionFill(section: Section): string | null {
    switch (section) {
      case 'peak': return randomChoice(FILLS_INTO_PEAK);
      case 'breakdown': return randomChoice(FILLS_INTO_BREAKDOWN);
      case 'build': return randomChoice(FILLS_INTO_BUILD);
      case 'groove': return randomChoice(FILLS_INTO_GROOVE);
      default: return null; // no fill into intro
    }
  }

  // Multiply base gain by velocity template values to create per-step gain pattern
  private applyVelocity(baseGain: number, velocityTemplate: string): string {
    return velocityTemplate.split(' ').map(v => (parseFloat(v) * baseGain).toFixed(3)).join(' ');
  }

  // Remove some hits from a pattern (for breakdowns)
  private thinPattern(pattern: string, keepProb: number): string {
    return pattern.split(' ').map(step => {
      if (step === '~' || step === 'bd') return step; // keep rests and kicks
      return Math.random() < keepProb ? step : '~';
    }).join(' ');
  }

  // Add ghost hi-hats in empty slots
  private addGhostHats(pattern: string, prob: number): string {
    return pattern.split(' ').map(step => {
      if (step !== '~') return step;
      return Math.random() < prob ? 'hh' : '~';
    }).join(' ');
  }
}
