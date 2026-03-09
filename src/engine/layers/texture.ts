import { CachingLayer } from '../caching-layer';
import { GenerativeState, Section } from '../../types';
import { randomChoice } from '../random';
import { evolveDrumPattern } from '../../theory/drum-evolution';
import { applyDrumDynamics, TRANCE_VELOCITIES, AVRIL_VELOCITIES } from '../../theory/drum-dynamics';
import { addIntelligentGhosts, moodGhostDensity } from '../../theory/ghost-notes';
import { shouldApplyAdditive, selectGrouping, additiveAccentMask } from '../../theory/additive-rhythm';
import { shouldApplyDNA, selectDNACell, dnaAccentMask } from '../../theory/rhythmic-dna';

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

// Xtal breakbeat patterns — Amen break style but slower, warmer
// Ambient breakbeats: loose, swung, tape-saturated
const XTAL_PATTERNS = [
  'bd ~ hh ~ sd ~ hh bd ~ hh bd ~ sd ~ hh ~',       // classic amen feel
  'bd ~ ~ hh sd ~ hh ~ bd ~ hh ~ sd ~ ~ hh',        // broken amen
  'bd hh ~ ~ sd ~ ~ hh bd ~ hh ~ sd ~ hh ~',        // shuffled break
  'bd ~ hh ~ sd ~ hh ~ ~ hh bd ~ sd ~ hh ~',        // rolling break
  'bd ~ ~ hh ~ ~ sd ~ bd hh ~ ~ sd ~ hh ~',          // sparse amen
];

const XTAL_VELOCITIES = [
  '1 0.3 0.4 0.5 0.9 0.3 0.4 0.6 0.8 0.3 0.5 0.3 0.9 0.3 0.4 0.3',  // warm swing
  '0.9 0.3 0.5 0.4 1 0.3 0.3 0.7 0.8 0.4 0.4 0.3 1 0.3 0.5 0.3',    // lazy feel
];

// Syro polyrhythmic patterns — complex, detailed, ghost notes everywhere
// IDM percussion: precise, glitchy, odd-time accents
const SYRO_PATTERNS = [
  'bd hh hh cp bd hh sd hh bd hh hh cp sd hh hh hh', // dense 16th grid
  'bd hh sd hh hh bd hh sd hh hh bd sd hh hh sd hh', // polyrhythmic
  'bd hh hh hh sd hh hh bd hh sd hh hh bd hh sd hh', // rolling complex
  'bd cp hh hh bd hh sd hh hh bd hh hh sd hh cp hh', // accented poly
  'hh bd hh sd hh hh bd hh sd hh bd hh hh sd hh bd', // offset grid
];

const SYRO_VELOCITIES = [
  '1 0.3 0.4 0.8 0.9 0.3 1 0.3 0.5 0.4 0.8 0.3 1 0.3 0.4 0.6',     // machine groove
  '0.9 0.4 0.3 0.5 1 0.3 0.9 0.4 0.3 0.5 0.7 0.3 1 0.4 0.3 0.8',   // glitchy feel
];

// Blockhead hip-hop patterns — heavy kicks, snares on 2 and 4, ghost hats, swing feel
// Instrumental hip-hop: chunky, warm, cinematic drums
const BLOCKHEAD_PATTERNS = [
  'bd ~ hh ~ sd ~ hh bd ~ hh bd ~ sd ~ hh ~',   // classic hip-hop break
  'bd ~ ~ hh sd ~ hh ~ bd hh ~ ~ sd ~ hh ~',    // syncopated swing
  'bd hh ~ ~ sd ~ hh bd ~ ~ bd hh sd ~ ~ hh',   // ghost hat groove
  'bd ~ hh ~ sd ~ ~ hh bd ~ hh ~ sd ~ hh ~',    // bouncy swing
  'bd ~ ~ bd sd ~ hh ~ ~ hh bd ~ sd ~ hh ~',    // double kick swing
];

const BLOCKHEAD_VELOCITIES = [
  '1 0.3 0.4 0.5 1 0.3 0.5 0.7 0.9 0.4 0.6 0.3 1 0.3 0.4 0.5',    // chunky swing
  '1 0.4 0.3 0.6 0.9 0.3 0.4 0.8 1 0.3 0.5 0.4 0.9 0.4 0.5 0.3',  // laid back groove
];

// Flim gentle glitchy beats — soft taps, light hats, delicate percussion
// IDM finger-drumming: restrained, detailed, tender
const FLIM_PATTERNS = [
  '~ ~ hh ~ ~ ~ hh ~ ~ hh ~ ~ ~ ~ hh ~',       // sparse taps
  'hh ~ ~ ~ ~ hh ~ ~ hh ~ ~ ~ ~ hh ~ ~',       // gentle rhythm
  '~ ~ hh ~ hh ~ ~ ~ ~ ~ hh ~ ~ ~ ~ hh',       // delicate detail
  '~ hh ~ ~ ~ ~ hh ~ ~ ~ ~ hh ~ ~ hh ~',       // quiet pulse
  'hh ~ ~ hh ~ ~ ~ ~ hh ~ ~ ~ ~ hh ~ ~',       // subtle pattern
];

const FLIM_VELOCITIES = [
  '0.5 0.3 0.4 0.3 0.4 0.3 0.5 0.3 0.4 0.3 0.4 0.3 0.5 0.3 0.3 0.3', // very gentle
  '0.4 0.3 0.5 0.3 0.3 0.4 0.3 0.3 0.5 0.3 0.3 0.4 0.4 0.3 0.5 0.3', // soft detail
];

// Disco patterns — kick on beats 1&3, clap on beats 2&4, hats on upbeats
// 16 steps: 0,4,8,12 = beats 1,2,3,4; 2,6,10,14 = upbeats ("and")
const DISCO_PATTERNS = [
  'bd ~ hh ~ cp ~ hh ~ bd ~ hh ~ cp ~ hh ~',     // classic disco — clean
  'bd ~ hh ~ cp ~ hh hh bd ~ hh ~ cp ~ hh hh',   // busy upbeat hats
  'bd hh hh ~ cp ~ hh ~ bd hh hh ~ cp ~ hh ~',   // 16th hat run into clap
  'bd ~ hh ~ cp hh hh ~ bd ~ hh ~ cp hh hh ~',   // hat flurry after clap
  'bd ~ hh ~ cp ~ hh ~ bd ~ hh hh cp ~ hh hh',   // rolling ending
];

// Velocities aligned to beat structure: strong on 0,4,8,12; medium on hats; ghost on 16ths
const DISCO_VELOCITIES = [
  '1 0.3 0.6 0.3 0.9 0.3 0.6 0.3 1 0.3 0.6 0.3 0.9 0.3 0.6 0.3',   // tight groove
  '1 0.4 0.5 0.4 1 0.4 0.5 0.5 0.9 0.3 0.6 0.4 1 0.4 0.5 0.4',     // swinging
  '0.9 0.3 0.7 0.3 1 0.3 0.5 0.4 1 0.4 0.6 0.3 0.9 0.3 0.7 0.3',   // accented hats
];

export class TextureLayer extends CachingLayer {
  name = 'texture';
  orbit = 3;

  protected shouldRegenerate(state: GenerativeState): boolean {
    if (state.mood === 'ambient') return true;
    if (this.moodChanged(state)) return true;
    if (state.scaleChanged) return true;
    if (state.sectionChanged) return true;

    const loopTicks = { downtempo: 8, lofi: 8, trance: 6, avril: 12, xtal: 10, syro: 4, blockhead: 8, flim: 10, disco: 6 }[state.mood] ?? 8;
    if (this.ticksSinceLastGeneration(state) >= loopTicks) return true;

    return false;
  }

  // Stored per buildPattern call for applyVelocity and evolveForSection to use
  private _section: Section = 'intro';
  private _tension = 0.5;
  private _sectionProgress = 0;
  private _tick = 0;
  private _mood: import('../../types').Mood = 'ambient';

  protected buildPattern(state: GenerativeState): string {
    const density = state.params.density;
    const mood = state.mood;
    const tension = state.tension?.overall ?? 0.5;
    this._section = state.section;
    this._tension = tension;
    this._sectionProgress = state.sectionProgress ?? 0;
    this._tick = state.tick;
    this._mood = mood;
    // Tension brightens drums, dries reverb, adds presence
    const gain = 0.3 * density * (0.9 + tension * 0.15);
    const room = (0.3 + state.params.spaciousness * 0.3) * (1.1 - tension * 0.2);
    const brightness = state.params.brightness * (0.85 + tension * 0.3);

    // Play a transition fill on section changes (not for ambient/avril/xtal)
    if (state.sectionChanged && mood !== 'ambient' && mood !== 'avril' && mood !== 'xtal' && mood !== 'flim') {
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
        return this.buildDowntempoPattern(density, gain * 0.8, room, brightness, state.section, state.tick);

      case 'lofi':
        return this.buildLofiPattern(density, gain, room * 0.7, brightness, state.section, state.tick);

      case 'trance':
        return this.buildTrancePattern(density, gain * 1.2, room * 0.5, brightness, state.section);

      case 'avril':
        return this.buildAvrilPattern(density, gain, room, brightness);

      case 'xtal':
        return this.buildXtalPattern(density, gain, room, brightness, state.section, state.tick);

      case 'syro':
        return this.buildSyroPattern(density, gain * 1.1, room * 0.4, brightness, state.section, state.tick);

      case 'blockhead':
        return this.buildBlockheadPattern(density, gain, room * 0.7, brightness, state.section, state.tick);

      case 'flim':
        return this.buildFlimPattern(density, gain * 0.6, room, brightness, state.section);

      case 'disco':
        return this.buildDiscoPattern(density, gain * 1.1, room * 0.5, brightness, state.section, state.tick);
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
    brightness: number, section: Section, tick: number = 0
  ): string {
    let pattern = randomChoice(DOWNTEMPO_PATTERNS);

    if (section === 'breakdown') {
      pattern = this.thinPattern(pattern, 0.4);
    }
    if (density > 0.3) {
      pattern = addIntelligentGhosts(pattern, 'downtempo', moodGhostDensity('downtempo') * density);
    }
    pattern = this.evolveForSection(pattern, section, tick);

    // Downtempo: spacious, organic — more reverb, delay, wider stereo, gentle LPF
    const dtGainPattern = this.applyVelocity(gain, randomChoice(DOWNTEMPO_VELOCITIES));
    return `sound("${pattern}")
      .slow(1)
      .gain("${dtGainPattern}")
      .lpf(${(1800 + brightness * 3000).toFixed(0)})
      .pan(sine.range(0.3, 0.7).slow(5))
      .room(${(room * 0.85).toFixed(2)})
      .roomsize(3)
      .delay(0.2)
      .delaytime(0.375)
      .delayfeedback(0.15)
      .orbit(${this.orbit})`;
  }

  private buildLofiPattern(
    density: number, gain: number, room: number,
    brightness: number, section: Section, tick: number = 0
  ): string {
    let pattern = randomChoice(LOFI_PATTERNS);

    if (section === 'breakdown') {
      pattern = this.thinPattern(pattern, 0.4);
    }
    if (density > 0.3) {
      pattern = addIntelligentGhosts(pattern, 'lofi', moodGhostDensity('lofi') * density);
    }
    pattern = this.evolveForSection(pattern, section, tick);

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

    // Trance: punchy, tight, bright — minimal reverb, high LPF, velocity accents
    const tranceGainPattern = this.applyVelocity(gain, randomChoice(TRANCE_VELOCITIES));
    return `sound("${pattern}")
      .slow(1)
      .gain("${tranceGainPattern}")
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

    const avrilGainPattern = this.applyVelocity(gain * 0.15, randomChoice(AVRIL_VELOCITIES));
    return `sound("${steps.join(' ')}")
      .slow(4)
      .gain("${avrilGainPattern}")
      .hpf(${(4000 + brightness * 2000).toFixed(0)})
      .lpf(${(8000 + brightness * 3000).toFixed(0)})
      .room(${(room * 0.8).toFixed(2)})
      .roomsize(3)
      .orbit(${this.orbit})`;
  }

  private buildXtalPattern(
    density: number, gain: number, room: number,
    brightness: number, section: Section, tick: number = 0
  ): string {
    let pattern = randomChoice(XTAL_PATTERNS);

    if (section === 'breakdown') {
      pattern = this.thinPattern(pattern, 0.35);
    }
    if (density > 0.3) {
      pattern = addIntelligentGhosts(pattern, 'xtal', moodGhostDensity('xtal') * density);
    }
    pattern = this.evolveForSection(pattern, section, tick);

    // Xtal: warm, saturated breakbeats — heavy reverb, tape-like
    const xtalGainPattern = this.applyVelocity(gain * 0.7, randomChoice(XTAL_VELOCITIES));
    return `sound("${pattern}")
      .slow(2)
      .gain("${xtalGainPattern}")
      .lpf(${(1200 + brightness * 1500).toFixed(0)})
      .hpf(60)
      .pan(sine.range(0.3, 0.7).slow(7))
      .room(${(room * 1.0).toFixed(2)})
      .roomsize(3.5)
      .delay(0.2)
      .delaytime(0.5)
      .delayfeedback(0.2)
      .orbit(${this.orbit})`;
  }

  private buildSyroPattern(
    density: number, gain: number, room: number,
    brightness: number, section: Section, tick: number = 0
  ): string {
    let pattern = randomChoice(SYRO_PATTERNS);

    if (section === 'breakdown') {
      pattern = this.thinPattern(pattern, 0.5);
    }
    // Always add ghost hats for density — syro is busy
    pattern = addIntelligentGhosts(pattern, 'syro', moodGhostDensity('syro') * (0.5 + density * 0.5));
    pattern = this.evolveForSection(pattern, section, tick);

    // Syro: tight, dry, precise — minimal reverb, bright, crisp
    const syroGainPattern = this.applyVelocity(gain, randomChoice(SYRO_VELOCITIES));
    return `sound("${pattern}")
      .slow(1)
      .gain("${syroGainPattern}")
      .hpf(50)
      .lpf(${(5000 + brightness * 6000).toFixed(0)})
      .crush(${(12 + brightness * 3).toFixed(0)})
      .room(${(room * 0.3).toFixed(2)})
      .roomsize(0.5)
      .orbit(${this.orbit})`;
  }

  private buildBlockheadPattern(
    density: number, gain: number, room: number,
    brightness: number, section: Section, tick: number = 0
  ): string {
    let pattern = randomChoice(BLOCKHEAD_PATTERNS);

    if (section === 'breakdown') {
      pattern = this.thinPattern(pattern, 0.4);
    }
    if (density > 0.3) {
      pattern = addIntelligentGhosts(pattern, 'blockhead', moodGhostDensity('blockhead') * density);
    }
    pattern = this.evolveForSection(pattern, section, tick);

    // Blockhead: warm, punchy hip-hop — moderate reverb, bit of crush, swing feel
    const bhGainPattern = this.applyVelocity(gain, randomChoice(BLOCKHEAD_VELOCITIES));
    return `sound("${pattern}")
      .slow(1)
      .gain("${bhGainPattern}")
      .lpf(${(1800 + brightness * 3000).toFixed(0)})
      .hpf(60)
      .pan(sine.range(0.35, 0.65).slow(5))
      .room(${(room * 0.8).toFixed(2)})
      .roomsize(2)
      .orbit(${this.orbit})`;
  }

  private buildFlimPattern(
    density: number, gain: number, room: number,
    brightness: number, section: Section
  ): string {
    let pattern = randomChoice(FLIM_PATTERNS);

    if (section === 'breakdown') {
      pattern = this.thinPattern(pattern, 0.3);
    }

    // Flim: soft, delicate, gentle — lots of reverb, quiet, detailed
    const flimGainPattern = this.applyVelocity(gain, randomChoice(FLIM_VELOCITIES));
    return `sound("${pattern}")
      .slow(2)
      .gain("${flimGainPattern}")
      .hpf(${(3000 + brightness * 2000).toFixed(0)})
      .lpf(${(7000 + brightness * 4000).toFixed(0)})
      .pan(sine.range(0.25, 0.75).slow(7))
      .room(${(room * 0.9).toFixed(2)})
      .roomsize(3)
      .delay(0.15)
      .delaytime(0.5)
      .delayfeedback(0.2)
      .orbit(${this.orbit})`;
  }

  private buildDiscoPattern(
    density: number, gain: number, room: number,
    brightness: number, section: Section, tick: number = 0
  ): string {
    let pattern: string;

    if (section === 'intro' || section === 'breakdown') {
      // Sparse four-on-the-floor — kick on every beat, minimal hats
      pattern = 'bd ~ ~ ~ bd ~ ~ ~ bd ~ ~ ~ bd ~ ~ ~';
      if (density > 0.3) {
        pattern = 'bd ~ hh ~ bd ~ hh ~ bd ~ hh ~ bd ~ hh ~';
      }
    } else {
      pattern = randomChoice(DISCO_PATTERNS);
      if (density > 0.3) {
        pattern = addIntelligentGhosts(pattern, 'disco', moodGhostDensity('disco') * density);
      }
    }
    pattern = this.evolveForSection(pattern, section, tick);

    // Disco: punchy, bright, tight — moderate reverb, open filter
    const discoGainPattern = this.applyVelocity(gain, randomChoice(DISCO_VELOCITIES));
    return `sound("${pattern}")
      .slow(1)
      .gain("${discoGainPattern}")
      .hpf(40)
      .lpf(${(4000 + brightness * 5000).toFixed(0)})
      .room(${(room * 0.5).toFixed(2)})
      .roomsize(1)
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
  // Applies section-responsive dynamics and additive rhythm accents
  private applyVelocity(baseGain: number, velocityTemplate: string): string {
    const template = applyDrumDynamics(velocityTemplate, this._section, this._tension);
    const gains = template.split(' ').map(v => parseFloat(v) * baseGain);

    // Rhythmic DNA: apply mood-characteristic rhythmic fingerprint
    if (shouldApplyDNA(this._tick, this._mood, this._section)) {
      const cell = selectDNACell(this._mood, this._tick);
      const dnaMask = dnaAccentMask(cell, gains.length, 0.6);
      for (let i = 0; i < gains.length && i < dnaMask.length; i++) {
        gains[i] *= dnaMask[i];
      }
    }

    // Additive rhythm: apply asymmetric accent mask for lopsided groove
    if (shouldApplyAdditive(this._tick, this._mood, this._section)) {
      const steps = gains.length as 8 | 16;
      const safeSteps = steps === 8 || steps === 16 ? steps : 16;
      const grouping = selectGrouping(safeSteps, this._mood, this._tick);
      const accentMask = additiveAccentMask(grouping, 1.0, 0.6);
      for (let i = 0; i < gains.length && i < accentMask.length; i++) {
        gains[i] *= accentMask[i];
      }
    }

    return gains.map(v => v.toFixed(3)).join(' ');
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

  // Evolve pattern based on section — builds add, breakdowns thin
  private evolveForSection(pattern: string, section: Section, _tick: number): string {
    const progress = this._sectionProgress;
    switch (section) {
      case 'build':
        return evolveDrumPattern(pattern, progress, 'build', 0.6);
      case 'breakdown':
        return evolveDrumPattern(pattern, progress, 'thin', 0.5);
      default:
        return pattern;
    }
  }
}
