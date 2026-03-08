import { GenerativeState, Mood } from '../types';
import { evaluate, hush } from '../strudel/bridge';
import { buildScaleState, getRelatedScales, getScaleNotes } from '../theory/scales';
import { pickContextualScale } from '../theory/scale-color';
import { ProgressionGenerator } from '../theory/progressions';
import { smoothVoicing } from '../theory/voice-leading';
import { computeTension } from './tension';
import { getCadentialTarget, cadenceUrgency } from '../theory/cadence';
import { getBorrowedChords } from '../theory/modal-interchange';
import { chordTension } from '../theory/chord-tension';
import { getChordNotesWithOctave, getChordSymbol } from '../theory/chords';
import { EvolutionManager } from './evolution';
import { SectionManager } from './section-manager';
import { shouldLayerAcceptChordChange } from '../theory/staggered-changes';
import { rubatoMultiplier, cadentialRubato } from '../theory/rubato';
import { shouldInsertSilence, silenceGainMultiplier } from '../theory/strategic-silence';
import { TensionMemory } from '../theory/tension-memory';
import { randomChoice } from './random';
import { Layer } from './layer';
import { DroneLayer } from './layers/drone';
import { HarmonyLayer } from './layers/harmony';
import { MelodyLayer } from './layers/melody';
import { TextureLayer } from './layers/texture';
import { ArpLayer } from './layers/arp';
import { AtmosphereLayer } from './layers/atmosphere';

const TICK_INTERVAL = 2000; // ms between evolution ticks

// CPS ≈ BPM / 240 for 4-beat cycles
const MOOD_TEMPOS: Record<Mood, number> = {
  ambient: 0.25,    // ~60 BPM
  downtempo: 0.375, // ~90 BPM
  lofi: 0.35,       // ~84 BPM
  trance: 0.55,     // ~132 BPM
  avril: 0.27,      // ~65 BPM
  xtal: 0.44,       // ~105 BPM
  syro: 0.58,       // ~140 BPM
  blockhead: 0.37,  // ~88 BPM
  flim: 0.40,       // ~95 BPM
  disco: 0.50,      // ~120 BPM
};

export class GenerativeController {
  private state: GenerativeState;
  private progression: ProgressionGenerator;
  private evolution: EvolutionManager;
  private sections: SectionManager;
  private layers: Layer[];
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private onStateChange?: (state: GenerativeState) => void;
  private prevSection: 'intro' | 'build' | 'peak' | 'breakdown' | 'groove' = 'intro';
  private silenceActive = false;
  private ticksSinceSilence = 0;
  private tensionMemory = new TensionMemory();

  constructor() {
    const initialScale = buildScaleState('C', 'minor');
    const mood: Mood = 'downtempo';

    this.progression = new ProgressionGenerator(initialScale, mood);
    this.evolution = new EvolutionManager();
    this.sections = new SectionManager();

    this.state = {
      scale: initialScale,
      currentChord: this.progression.current(),
      chordHistory: [],
      progressionIndex: 0,
      mood,
      params: {
        tempo: MOOD_TEMPOS[mood],
        density: 0.5,
        brightness: 0.5,
        spaciousness: 0.8,
      },
      elapsed: 0,
      lastChordChange: 0,
      lastScaleChange: 0,
      tick: 0,
      chordChanged: false,
      scaleChanged: false,
      section: 'intro',
      sectionChanged: false,
      activeLayers: new Set(['drone', 'atmosphere']),
      layerGainMultipliers: {
        drone: 1.0, harmony: 0.0, melody: 0.0,
        texture: 0.0, arp: 0.0, atmosphere: 1.0,
      },
      tension: { structural: 0.15, harmonic: 0, rhythmic: 0.5, overall: 0.2 },
      layerCenterPitches: {},
      ticksSinceChordChange: 0,
      layerPhraseDensity: {},
      layerStepPattern: {},
      sectionProgress: 0,
    };

    this.layers = [
      new DroneLayer(),
      new HarmonyLayer(),
      new MelodyLayer(),
      new TextureLayer(),
      new ArpLayer(),
      new AtmosphereLayer(),
    ];
  }

  setStateChangeCallback(cb: (state: GenerativeState) => void): void {
    this.onStateChange = cb;
  }

  async start(): Promise<void> {
    await this.rebuildAll();
    this.tickTimer = setInterval(() => this.tick(), TICK_INTERVAL);
  }

  stop(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    hush();
  }

  setMood(mood: Mood): void {
    this.state.mood = mood;
    this.state.params.tempo = MOOD_TEMPOS[mood];
    this.progression.setMood(mood);
    this.evolution.resetTimings(mood);
    this.sections.reset(mood);
    this.tensionMemory.clear();
    this.state.section = 'intro';
    this.state.sectionChanged = true;
    // Reset gain multipliers to intro state
    const introLayers = new Set(this.sections.getIntroLayers(mood));
    this.state.activeLayers = introLayers;
    this.state.layerGainMultipliers = {
      drone: introLayers.has('drone') ? 1.0 : 0.0,
      harmony: introLayers.has('harmony') ? 1.0 : 0.0,
      melody: introLayers.has('melody') ? 1.0 : 0.0,
      texture: introLayers.has('texture') ? 1.0 : 0.0,
      arp: introLayers.has('arp') ? 1.0 : 0.0,
      atmosphere: introLayers.has('atmosphere') ? 1.0 : 0.0,
    };
    this.rebuildAll();
    this.onStateChange?.(this.state);
  }

  setDensity(v: number): void { this.state.params.density = v; }
  setBrightness(v: number): void { this.state.params.brightness = v; }
  setSpaciousness(v: number): void { this.state.params.spaciousness = v; }

  forceNextChord(): void {
    this.advanceChord();
    this.state.chordChanged = true;
    this.rebuildAll();
    this.onStateChange?.(this.state);
  }

  forceNextSection(): void {
    this.state.sectionChanged = true;
    // Trigger section advance by setting elapsed past duration
    this.sections.forceAdvance(this.state);
    // Kick-start gain interpolation immediately so new layers aren't silent
    this.sections.evolve(this.state, 0);
    this.rebuildAll();
    this.onStateChange?.(this.state);
  }

  getState(): GenerativeState {
    return this.state;
  }

  private async tick(): Promise<void> {
    const dt = TICK_INTERVAL / 1000;
    const { chordChange, scaleChange } = this.evolution.evolve(this.state, dt);

    this.state.chordChanged = false;
    this.state.scaleChanged = false;
    this.state.sectionChanged = false;

    if (scaleChange) {
      this.modulateScale();
      this.state.scaleChanged = true;
    }

    if (chordChange) {
      this.advanceChord();
      this.state.chordChanged = true;
      this.state.ticksSinceChordChange = 0;
    }

    // Evolve sections (steers density/brightness, manages transitions)
    this.sections.evolve(this.state, dt);
    this.state.sectionProgress = this.sections.getSectionProgress();

    // Strategic silence: brief drop before climactic sections
    if (this.state.sectionChanged) {
      if (shouldInsertSilence(this.state.section, true, this.prevSection)) {
        this.silenceActive = true;
        this.ticksSinceSilence = 0;
      }
      this.prevSection = this.state.section;
    }
    if (this.silenceActive) {
      this.ticksSinceSilence++;
      if (this.ticksSinceSilence > 2) {
        this.silenceActive = false;
      }
    }

    // Compute tension arc from current state
    // Use chord-tension module for musically accurate harmonic tension
    const harmonicDistance = chordTension(
      this.state.currentChord.degree,
      this.state.currentChord.quality
    );
    this.state.tension = computeTension(
      this.state.section,
      this.state.params.density,
      this.state.params.brightness,
      harmonicDistance,
    );

    // Tension memory: longer-form arcs — nudge tension to avoid plateaus
    this.tensionMemory.record(this.state.tension.overall);
    const tensionMod = this.tensionMemory.suggestModification();
    if (tensionMod !== 0) {
      this.state.tension.overall = Math.max(0, Math.min(1, this.state.tension.overall + tensionMod));
    }

    this.state.ticksSinceChordChange++;
    this.state.tick++;

    await this.rebuildAll();
    this.onStateChange?.(this.state);
  }

  private modulateScale(): void {
    const tension = this.state.tension?.overall ?? 0.5;
    const sectionProgress = this.sections.getSectionProgress();
    const newScaleType = pickContextualScale(
      this.state.mood,
      tension,
      sectionProgress,
      this.state.scale.type
    );

    // Only modulate if we're actually changing scale type
    if (newScaleType !== this.state.scale.type) {
      this.state.scale = buildScaleState(this.state.scale.root, newScaleType);
      this.progression.setScale(this.state.scale);
    } else {
      // Same scale type - try changing root instead (relative modulation)
      const related = getRelatedScales(this.state.scale);
      if (related.length > 0) {
        const candidates = related.slice(0, 3);
        const chosen = randomChoice(candidates);
        this.state.scale = buildScaleState(chosen.root, chosen.type);
        this.progression.setScale(this.state.scale);
      }
    }
  }

  private advanceChord(): void {
    const prevNotes = this.state.currentChord.notes;

    // Check for cadential steering near section boundaries
    const sectionProgress = this.sections.getSectionProgress();
    const urgency = cadenceUrgency(sectionProgress);
    const cadentialTarget = getCadentialTarget(
      this.progression.getCurrentDegree(), urgency
    );

    // Either force a cadential target or let Markov decide
    let nextChord = cadentialTarget !== null
      ? this.progression.forceToDegree(cadentialTarget)
      : this.progression.next();

    // Modal interchange: occasionally borrow a chord from a parallel mode.
    // Higher tension increases borrow probability (up to 25% at max tension).
    // Skip when cadential steering is active — don't disrupt cadences.
    const tension = this.state.tension?.overall ?? 0.5;
    const borrowProbability = tension * 0.25;
    if (Math.random() < borrowProbability && cadentialTarget === null) {
      const borrowed = getBorrowedChords(this.state.scale.type);
      if (borrowed.length > 0) {
        // Prefer a borrowed chord matching the current degree; fall back to random
        const matching = borrowed.filter(b => b.degree === nextChord.degree);
        const pick = matching.length > 0
          ? matching[0]
          : borrowed[Math.floor(Math.random() * borrowed.length)];

        // Rebuild notes from scratch for the borrowed quality
        const scaleNotes = getScaleNotes(this.state.scale.root, this.state.scale.type);
        const chordRoot = scaleNotes[pick.degree % scaleNotes.length];
        nextChord = {
          symbol: getChordSymbol(chordRoot, pick.quality),
          root: chordRoot,
          quality: pick.quality,
          notes: getChordNotesWithOctave(chordRoot, pick.quality, 3),
          degree: pick.degree,
        };
      }
    }

    nextChord.notes = smoothVoicing(prevNotes, nextChord.notes);

    this.state.chordHistory.push(this.state.currentChord);
    if (this.state.chordHistory.length > 16) {
      this.state.chordHistory.shift();
    }
    this.state.currentChord = nextChord;
    this.state.progressionIndex++;

    // Set hint for next chord (melody can use for anticipation)
    this.state.nextChordHint = this.progression.peekNext();
  }

  private async rebuildAll(): Promise<void> {
    // Include layers that are active OR still fading out (multiplier > threshold)
    const FADE_THRESHOLD = 0.01;
    const activeLayers = this.layers.filter(layer =>
      this.state.activeLayers.has(layer.name) ||
      (this.state.layerGainMultipliers[layer.name] ?? 0) > FADE_THRESHOLD
    );
    if (activeLayers.length === 0) return;

    const layerResults: { name: string; code: string }[] = [];

    for (const layer of activeLayers) {
      try {
        // Stagger chord changes: some layers see the previous chord
        let stateForLayer = this.state;
        if (this.state.chordHistory.length > 0 &&
            !shouldLayerAcceptChordChange(layer.name, this.state.mood, this.state.ticksSinceChordChange)) {
          // Temporarily use previous chord for this layer
          stateForLayer = { ...this.state, currentChord: this.state.chordHistory[this.state.chordHistory.length - 1] };
        }
        const code = layer.generate(stateForLayer);
        if (this.validateLayerCode(code, layer.name)) {
          layerResults.push({ name: layer.name, code });
        }
      } catch (e) {
        console.warn(`[${layer.name}] generate() threw:`, e);
      }
    }

    if (layerResults.length === 0) return;

    // Strategic silence: apply near-zero gain during drop moments
    if (this.silenceActive) {
      const silenceMult = silenceGainMultiplier(this.ticksSinceSilence, 1);
      if (silenceMult < 1.0) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (match, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * silenceMult).toFixed(4)})`;
              return `.gain((${expr}) * ${silenceMult.toFixed(4)})`;
            }
          );
        }
      }
    }

    const layerCodes = layerResults.map(r => r.code);
    // Apply rubato: subtle tempo variation based on section and tension
    const rubato = rubatoMultiplier(this.state.mood, this.state.section, this.state.tension?.overall ?? 0.5);
    // Cadential rubato: brief tempo dip at resolution points (V→I, etc.)
    const prevChord = this.state.chordHistory.length >= 2
      ? this.state.chordHistory[this.state.chordHistory.length - 2]
      : null;
    const cadRubato = prevChord
      ? cadentialRubato(
          this.state.currentChord.degree,
          prevChord.degree,
          prevChord.quality,
          this.state.ticksSinceChordChange,
          this.state.mood
        )
      : 1.0;
    const effectiveTempo = this.state.params.tempo * rubato * cadRubato;
    const fullCode = `setCps(${effectiveTempo.toFixed(4)})\nstack(\n${layerCodes.join(',\n')}\n)`;

    try {
      await evaluate(fullCode);
    } catch (e) {
      console.warn('Full stack evaluation failed, trying layers individually:', e);
      // Fall back to evaluating layers one at a time to isolate the broken one
      const workingCodes: string[] = [];
      for (const result of layerResults) {
        const singleCode = `setCps(${this.state.params.tempo})\n${result.code}`;
        try {
          await evaluate(singleCode);
          workingCodes.push(result.code);
        } catch (layerErr) {
          console.warn(`[${result.name}] individual evaluation failed:`, layerErr);
        }
      }
      // Re-evaluate all working layers as a stack
      if (workingCodes.length > 0) {
        const fallbackCode = `setCps(${this.state.params.tempo})\nstack(\n${workingCodes.join(',\n')}\n)`;
        try {
          await evaluate(fallbackCode);
        } catch (finalErr) {
          console.warn('Fallback stack evaluation also failed:', finalErr);
        }
      }
    }
  }

  private validateLayerCode(code: string, layerName: string): boolean {
    // Check for empty note patterns
    if (/note\(\s*""\s*\)/.test(code)) {
      console.warn(`[${layerName}] empty note pattern`);
      return false;
    }
    // Check for all-rest patterns
    if (/note\(\s*"(~\s*)+"\s*\)/.test(code)) {
      console.warn(`[${layerName}] all-rest note pattern`);
      return false;
    }
    // Check for NaN or undefined in the code string
    if (/\bNaN\b/.test(code) || /\bundefined\b/.test(code)) {
      console.warn(`[${layerName}] NaN or undefined in generated code`);
      return false;
    }
    return true;
  }
}
