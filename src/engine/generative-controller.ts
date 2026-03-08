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
import { tempoTrajectoryMultiplier } from '../theory/tempo-trajectory';
import { shouldInsertSilence, silenceGainMultiplier } from '../theory/strategic-silence';
import { TensionMemory } from '../theory/tension-memory';
import { phraseCadenceBias } from '../theory/phrase-harmony';
import { tensionCeiling, trajectoryGainMultiplier, moodFormLength } from '../theory/form-trajectory';
import type { TrajectoryState } from '../theory/form-trajectory';
import { shouldInsertSecondaryDominant, secondaryDominantRoot, secondaryDominantNotes, secondaryDominantSymbol } from '../theory/secondary-dominant';
import { shouldApplyTritoneSub, tritoneSubRoot, tritoneSubNotes } from '../theory/tritone-sub';
import { shouldInsertApproachChord, approachChordRoot, approachChordNotes } from '../theory/chromatic-approach';
import { selectInversion, applyInversion, extractBassNote } from '../theory/chord-inversion';
import { shouldApplyRelativeSub, relativeSubChord } from '../theory/relative-sub';
import { reharmCooldown } from '../theory/reharm-density';
import { functionalBias } from '../theory/functional-harmony';
import { shouldStartCadentialSequence, createCadentialPlan, nextCadentialDegree, advanceCadentialPlan, isCadentialPlanActive } from '../theory/cadential-sequence';
import type { CadentialPlan } from '../theory/cadential-sequence';
import { targetKeyArea, journeyBias, shouldModulate } from '../theory/harmonic-journey';
import { tempoFeelMultiplier, shouldApplyTempoFeel } from '../theory/tempo-feel';
import { EmotionalMemoryBank, isEmotionalLandmark } from '../theory/emotional-memory';
import { shouldApplyNegativeHarmony, negativeRoot } from '../theory/negative-harmony';
import { shouldModulate as shouldMetricModulate, modulationRatio, modulationEnvelope, modulationWindowTicks } from '../theory/metric-modulation';
import { bestPivotChord, shouldUsePivot } from '../theory/pivot-modulation';
import { macroDynamicGain, transitionDynamicAccent, shouldApplyMacroDynamics } from '../theory/macro-dynamics';
import { shouldApplyNR, suggestNRMove } from '../theory/neo-riemannian';
import { shouldGrandPause, gpDuration } from '../theory/grand-pause';
import { randomChoice } from './random';
import { rollSurprise, applyOctaveLeap, applyRegisterShift, brightnessFlashMultiplier } from '../theory/surprise-events';
import type { SurpriseType } from '../theory/surprise-events';
import { headroomScalar, shouldApplyHeadroom } from '../theory/headroom';
import { shouldFireArrival, arrivalGainBoost, shouldForceRoot } from '../theory/arrival-moment';
import { pocketGainMultiplier, isPocketLayer, shouldApplyPocket } from '../theory/harmonic-pocket';
import { TonalGravity } from '../theory/tonal-gravity';
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
  private formTrajectory: TrajectoryState = { ticksElapsed: 0, formLength: 80 };
  private prevBassNote: import('../types').NoteName | null = null;
  private recentReharmCount = 0;
  private cadentialPlan: CadentialPlan | null = null;
  private ticksSinceLastSurprise = 20; // start with cooldown expired
  private arrivalActive = false;
  private tonalGravity = new TonalGravity('C', 'minor');
  private emotionalMemory = new EmotionalMemoryBank();
  private prevTension = 0.5;
  /** Metric modulation state */
  private modulationActive = false;
  private modulationTicksRemaining = 0;
  private modulationTotalTicks = 0;
  private modulationRatioStr: import('../theory/metric-modulation').ModulationRatio = '4:3';
  /** Grand pause state */
  private gpActive = false;
  private gpTicksRemaining = 0;

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
    this.emotionalMemory.clear();
    this.prevTension = 0.5;
    this.tonalGravity.reset(this.state.scale.root, this.state.scale.type);
    this.formTrajectory = { ticksElapsed: 0, formLength: moodFormLength(mood) };
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
    // Structural arrival: coordinated convergence at section landmarks
    if (this.state.sectionChanged) {
      this.cadentialPlan = null; // reset cadential plan for new section
      if (shouldInsertSilence(this.state.section, true, this.prevSection)) {
        this.silenceActive = true;
        this.ticksSinceSilence = 0;
      }
      this.arrivalActive = shouldFireArrival(
        this.prevSection, this.state.section, this.state.mood
      );
      // Metric modulation: rhythmic tempo illusion during transitions
      if (shouldMetricModulate(this.prevSection, this.state.section, this.state.mood, this.state.tick)) {
        this.modulationActive = true;
        this.modulationRatioStr = modulationRatio(this.prevSection, this.state.section, this.state.mood, this.state.tick);
        this.modulationTotalTicks = modulationWindowTicks(this.state.mood);
        this.modulationTicksRemaining = this.modulationTotalTicks;
      }
      this.prevSection = this.state.section;
    } else {
      this.arrivalActive = false; // arrivals last exactly one tick
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

    // Form trajectory: cap tension based on position in the overall arc
    this.formTrajectory.ticksElapsed = this.state.tick;
    const ceiling = tensionCeiling(this.formTrajectory);
    if (this.state.tension.overall > ceiling) {
      this.state.tension.overall = ceiling;
    }

    // Emotional memory: store significant musical moments for later recall
    const landmark = isEmotionalLandmark(
      this.state.tension.overall,
      this.prevTension,
      this.state.sectionChanged,
      this.state.chordChanged,
      false // harmonic surprise — could be detected from chord distance
    );
    if (landmark.isLandmark) {
      this.emotionalMemory.store({
        tick: this.state.tick,
        section: this.state.section,
        tension: this.state.tension.overall,
        chord: {
          root: this.state.currentChord.root,
          quality: this.state.currentChord.quality,
          degree: this.state.currentChord.degree,
        },
        type: landmark.type,
        weight: landmark.weight,
      });
    }
    this.prevTension = this.state.tension.overall;

    this.state.ticksSinceChordChange++;
    this.state.tick++;

    // Grand pause: check for dramatic silence at section boundaries
    if (this.gpActive) {
      this.gpTicksRemaining--;
      if (this.gpTicksRemaining <= 0) this.gpActive = false;
    } else if (shouldGrandPause(
      this.state.tick, this.state.mood, this.state.section,
      this.state.sectionProgress ?? 0
    )) {
      this.gpActive = true;
      this.gpTicksRemaining = gpDuration(this.state.mood);
    }

    await this.rebuildAll();
    this.onStateChange?.(this.state);
  }

  private modulateScale(): void {
    const tension = this.state.tension?.overall ?? 0.5;
    const sectionProgress = this.sections.getSectionProgress();

    // Tonal gravity: if we've wandered too far, pull back home
    if (this.tonalGravity.shouldReturnHome(
      this.state.scale.root, this.state.scale.type, this.state.mood
    )) {
      const home = this.tonalGravity.getHome();
      this.state.scale = buildScaleState(home.root, home.type);
      this.progression.setScale(this.state.scale);
      this.tonalGravity.record(home.root, home.type, this.state.tick);
      return;
    }

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

        // Pivot modulation: set current chord to a pivot before changing key
        if (shouldUsePivot(this.state.tick, this.state.mood, this.state.section)) {
          const pivot = bestPivotChord(this.state.scale.root, chosen.root);
          if (pivot && pivot.quality !== 'dim') {
            this.state.nextChordHint = {
              symbol: `${pivot.root}${pivot.quality === 'min' ? 'm' : ''}`,
              root: pivot.root,
              quality: pivot.quality,
              notes: getChordNotesWithOctave(pivot.root, pivot.quality, 3),
              degree: pivot.fromDegree,
            };
          }
        }

        this.state.scale = buildScaleState(chosen.root, chosen.type);
        this.progression.setScale(this.state.scale);
      }
    }

    // Record the new tonal position
    this.tonalGravity.record(this.state.scale.root, this.state.scale.type, this.state.tick);
  }

  private advanceChord(): void {
    const prevNotes = this.state.currentChord.notes;

    // Check for cadential steering near section boundaries
    const sectionProgress = this.sections.getSectionProgress();
    const currentDegree = this.progression.getCurrentDegree();

    // Cadential sequence planning: multi-chord cadential patterns near section boundaries
    // Takes priority over single-chord urgency-based steering
    let cadentialTarget: number | null = null;
    if (isCadentialPlanActive(this.cadentialPlan)) {
      cadentialTarget = nextCadentialDegree(this.cadentialPlan!);
      advanceCadentialPlan(this.cadentialPlan!);
    } else if (shouldStartCadentialSequence(sectionProgress, this.state.section, this.cadentialPlan)) {
      this.cadentialPlan = createCadentialPlan(this.state.mood, currentDegree);
      if (isCadentialPlanActive(this.cadentialPlan)) {
        cadentialTarget = nextCadentialDegree(this.cadentialPlan!);
        advanceCadentialPlan(this.cadentialPlan!);
      }
    } else {
      // Fall back to single-chord urgency steering
      const urgency = cadenceUrgency(sectionProgress);
      cadentialTarget = getCadentialTarget(currentDegree, urgency);
    }

    // Either force a cadential target or let Markov decide
    // Phrase-level bias steers toward half cadences (antecedent) or tonic (consequent)
    const phraseBias = phraseCadenceBias(this.state.tick, this.state.mood, this.state.section);
    // Functional harmony: bias toward functionally strong progressions (T→S→D→T)
    const currentQuality = this.state.currentChord.quality;
    // Harmonic journey: bias toward chords that serve the target key area
    const keyArea = targetKeyArea(this.state.section, this.state.mood, this.state.tick);
    const combinedBias = phraseBias.map((pb, degree) =>
      pb * functionalBias(currentDegree, currentQuality, degree, this.state.mood)
         * journeyBias(degree, keyArea, this.state.mood)
         * this.emotionalMemory.chordRecallBias(
             this.state.scale.notes[degree] ?? 'C', degree,
             this.state.mood, this.state.section
           )
    );
    let nextChord = cadentialTarget !== null
      ? this.progression.forceToDegree(cadentialTarget)
      : this.progression.next(combinedBias);

    // Reharmonization density: scale down substitution probability when
    // too many consecutive reharms have occurred (prevents harmonic fatigue)
    const reharmGate = reharmCooldown(this.recentReharmCount, this.state.mood);
    let wasReharmonized = false;

    const preReharmRoot = nextChord.root;
    const preReharmQuality = nextChord.quality;

    // Modal interchange: occasionally borrow a chord from a parallel mode.
    // Higher tension increases borrow probability (up to 25% at max tension).
    // Skip when cadential steering is active — don't disrupt cadences.
    const tension = this.state.tension?.overall ?? 0.5;
    const borrowProbability = tension * 0.25 * reharmGate;
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

    // Relative substitution: replace major→relative minor or vice versa
    // (e.g., C major → A minor for wistful color)
    if (cadentialTarget === null &&
        shouldApplyRelativeSub(nextChord.degree, nextChord.quality, this.state.mood, this.state.section)) {
      const sub = relativeSubChord(nextChord.root, nextChord.quality, 3);
      nextChord = {
        symbol: getChordSymbol(sub.root, sub.quality),
        root: sub.root,
        quality: sub.quality,
        notes: sub.notes,
        degree: nextChord.degree,
      };
    }

    // Secondary dominant: occasionally insert V/X before the next chord
    // Creates chromatic pull (e.g., D7 → G instead of direct jump to G)
    const sectionProg = this.sections.getSectionProgress();
    if (cadentialTarget === null &&
        shouldInsertSecondaryDominant(nextChord.degree, this.state.mood, this.state.section, sectionProg)) {
      const secDomRoot = secondaryDominantRoot(nextChord.root);
      nextChord = {
        symbol: secondaryDominantSymbol(nextChord.root),
        root: secDomRoot,
        quality: 'dom7',
        notes: secondaryDominantNotes(nextChord.root, 3),
        degree: nextChord.degree, // keep target degree for resolution tracking
      };
    }

    // Negative harmony: mirror the chord root around the tonal axis
    // for an emotionally "inverted" substitution (bright → dark, tense → relaxed)
    if (cadentialTarget === null &&
        shouldApplyNegativeHarmony(this.state.tick, this.state.mood, this.state.section) &&
        Math.random() < reharmGate) {
      const mirroredRoot = negativeRoot(nextChord.root, this.state.scale.root);
      if (mirroredRoot !== nextChord.root) {
        // Mirror quality: major → minor, minor → major
        const mirroredQuality = nextChord.quality === 'maj' ? 'min'
          : nextChord.quality === 'min' ? 'maj'
          : nextChord.quality === 'maj7' ? 'min7'
          : nextChord.quality === 'min7' ? 'maj7'
          : nextChord.quality; // keep dom7/sus/dim as-is
        nextChord = {
          symbol: getChordSymbol(mirroredRoot, mirroredQuality),
          root: mirroredRoot,
          quality: mirroredQuality,
          notes: getChordNotesWithOctave(mirroredRoot, mirroredQuality, 3),
          degree: nextChord.degree,
        };
      }
    }

    // Neo-Riemannian navigation: geometric P/R/L transformations
    // for smooth, non-functional chord movement (dreamy/ambient sections)
    if (cadentialTarget === null &&
        shouldApplyNR(this.state.tick, this.state.mood, this.state.section) &&
        Math.random() < reharmGate) {
      const move = suggestNRMove(nextChord.root, nextChord.quality, this.state.mood, this.state.tick);
      nextChord = {
        symbol: getChordSymbol(move.result.root, move.result.quality),
        root: move.result.root,
        quality: move.result.quality,
        notes: getChordNotesWithOctave(move.result.root, move.result.quality, 3),
        degree: nextChord.degree,
      };
    }

    // Tritone substitution: replace dominant chords with ♭II7 for
    // chromatic bass motion (e.g., Dm → Db7 → C instead of Dm → G7 → C)
    if (shouldApplyTritoneSub(nextChord.degree, nextChord.quality, this.state.mood, this.state.section)) {
      const subRoot = tritoneSubRoot(nextChord.root);
      nextChord = {
        symbol: getChordSymbol(subRoot, 'dom7'),
        root: subRoot,
        quality: 'dom7',
        notes: tritoneSubNotes(nextChord.root, 3),
        degree: nextChord.degree, // keep original degree for resolution tracking
      };
    }

    // Chromatic approach: insert a passing dim7 chord before the target
    // (e.g., C → C#dim7 → Dm for ascending chromatic bass)
    if (cadentialTarget === null &&
        shouldInsertApproachChord(this.state.currentChord.root, nextChord.root, this.state.mood, this.state.section)) {
      const appRoot = approachChordRoot(this.state.currentChord.root, nextChord.root);
      nextChord = {
        symbol: `${appRoot}dim7`,
        root: appRoot,
        quality: 'dim',
        notes: approachChordNotes(appRoot, 3),
        degree: nextChord.degree, // keep target degree for resolution
      };
    }

    nextChord.notes = smoothVoicing(prevNotes, nextChord.notes);

    // Chord inversion: select inversion for smooth bass motion
    const chordNoteNames = nextChord.notes.map(
      n => n.replace(/\d+$/, '')
    ) as import('../types').NoteName[];
    const sectionProg2 = this.sections.getSectionProgress();
    const inversion = selectInversion(
      chordNoteNames, this.prevBassNote,
      nextChord.degree, this.state.mood, this.state.section, sectionProg2
    );
    if (inversion !== 0) {
      nextChord.notes = applyInversion(nextChord.notes, inversion);
    }
    this.prevBassNote = extractBassNote(nextChord.notes);

    // Track reharmonization density for cooldown
    wasReharmonized = nextChord.root !== preReharmRoot || nextChord.quality !== preReharmQuality;
    if (wasReharmonized) {
      this.recentReharmCount++;
    } else {
      // Diatonic chord resets the counter (relief from chromaticism)
      this.recentReharmCount = Math.max(0, this.recentReharmCount - 1);
    }

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

    // Grand pause: near-zero gain across all layers for dramatic silence
    if (this.gpActive) {
      const gpMult = 0.01; // near-silent, not completely zero (avoids audio glitch)
      for (const result of layerResults) {
        result.code = result.code.replace(
          /\.gain\(([^)]+)\)/,
          (_, expr) => {
            const num = parseFloat(expr);
            if (!isNaN(num)) return `.gain(${(num * gpMult).toFixed(4)})`;
            return `.gain((${expr}) * ${gpMult.toFixed(4)})`;
          }
        );
      }
    }

    // Form trajectory gain: gentle overall dynamic arc across the piece
    const trajGain = trajectoryGainMultiplier(this.formTrajectory);
    if (Math.abs(trajGain - 1.0) > 0.02) {
      for (const result of layerResults) {
        result.code = result.code.replace(
          /\.gain\(([^)]+)\)/,
          (_, expr) => {
            const num = parseFloat(expr);
            if (!isNaN(num)) return `.gain(${(num * trajGain).toFixed(4)})`;
            return `.gain((${expr}) * ${trajGain.toFixed(4)})`;
          }
        );
      }
    }

    // Headroom management: reduce gain when many layers are sounding
    if (shouldApplyHeadroom(layerResults.length)) {
      const hrScalar = headroomScalar(layerResults.length);
      for (const result of layerResults) {
        result.code = result.code.replace(
          /\.gain\(([^)]+)\)/,
          (_, expr) => {
            const num = parseFloat(expr);
            if (!isNaN(num)) return `.gain(${(num * hrScalar).toFixed(4)})`;
            return `.gain((${expr}) * ${hrScalar.toFixed(4)})`;
          }
        );
      }
    }

    // Macro dynamics: overall loudness contour across the piece
    if (shouldApplyMacroDynamics(this.state.mood)) {
      const macroGain = macroDynamicGain(
        this.state.section, this.state.sectionProgress ?? 0, this.state.mood
      );
      const transAccent = transitionDynamicAccent(
        this.state.section, this.state.sectionChanged ? 0 : 3
      );
      const macroMult = macroGain * transAccent;
      if (Math.abs(macroMult - 1.0) > 0.01) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * macroMult).toFixed(4)})`;
              return `.gain((${expr}) * ${macroMult.toFixed(4)})`;
            }
          );
        }
      }
    }

    // Structural arrival: coordinated surge at section landmarks
    if (this.arrivalActive) {
      for (const result of layerResults) {
        const boost = arrivalGainBoost(result.name);
        if (boost > 1.0) {
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * boost).toFixed(4)})`;
              return `.gain((${expr}) * ${boost.toFixed(4)})`;
            }
          );
        }
      }
      // Force melody to land on chord root for convergence
      if (shouldForceRoot()) {
        const melody = layerResults.find(r => r.name === 'melody');
        if (melody) {
          const root = this.state.currentChord.root;
          melody.code = melody.code.replace(
            /note\("([^"]+)"\)/,
            (_, notes) => {
              const parts = notes.split(' ');
              const firstNote = parts.findIndex((n: string) => n !== '~');
              if (firstNote >= 0) {
                const octMatch = parts[firstNote].match(/\d+$/);
                const oct = octMatch ? octMatch[0] : '4';
                parts[firstNote] = `${root}${oct}`;
              }
              return `note("${parts.join(' ')}")`;
            }
          );
        }
      }
    }

    // Surprise events: rare, joyful moments that break expectations
    this.ticksSinceLastSurprise++;
    const surprise = rollSurprise(this.state.mood, this.state.section, this.ticksSinceLastSurprise);
    if (surprise !== 'none') {
      this.ticksSinceLastSurprise = 0;
      this.applySurprise(surprise, layerResults);
    }

    // Harmonic pocket: briefly thin non-essential layers on chord changes
    if (shouldApplyPocket(this.state.mood, this.state.section)) {
      const pocketMult = pocketGainMultiplier(
        this.state.ticksSinceChordChange, this.state.mood, this.state.section
      );
      if (pocketMult < 0.98) {
        for (const result of layerResults) {
          if (isPocketLayer(result.name)) {
            result.code = result.code.replace(
              /\.gain\(([^)]+)\)/,
              (_, expr) => {
                const num = parseFloat(expr);
                if (!isNaN(num)) return `.gain(${(num * pocketMult).toFixed(4)})`;
                return `.gain((${expr}) * ${pocketMult.toFixed(4)})`;
              }
            );
          }
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
    // Tempo trajectory: gradual tempo evolution within sections
    const tempoTraj = tempoTrajectoryMultiplier(
      this.state.section, this.state.sectionProgress ?? 0, this.state.mood
    );
    // Tempo feel: subtle phrase-level tempo breathing for organic rhythm
    const tempoFeel = shouldApplyTempoFeel(this.state.mood)
      ? tempoFeelMultiplier(this.state.tick, this.state.mood, this.state.section)
      : 1.0;
    // Metric modulation: rhythmic tempo illusion during section transitions
    let metricMod = 1.0;
    if (this.modulationActive && this.modulationTicksRemaining > 0) {
      const progress = 1.0 - (this.modulationTicksRemaining / this.modulationTotalTicks);
      metricMod = modulationEnvelope(progress, this.modulationRatioStr);
      this.modulationTicksRemaining--;
      if (this.modulationTicksRemaining <= 0) this.modulationActive = false;
    }
    const effectiveTempo = this.state.params.tempo * rubato * cadRubato * tempoTraj * tempoFeel * metricMod;
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

  private applySurprise(
    type: SurpriseType,
    results: { name: string; code: string }[]
  ): void {
    switch (type) {
      case 'octave-leap': {
        const melody = results.find(r => r.name === 'melody');
        if (melody) {
          melody.code = melody.code.replace(
            /note\("([^"]+)"\)/,
            (_, notes) => `note("${applyOctaveLeap(notes)}")`
          );
        }
        break;
      }
      case 'register-shift': {
        const arp = results.find(r => r.name === 'arp');
        if (arp) {
          const dir = Math.random() < 0.6 ? 'up' : 'down';
          arp.code = arp.code.replace(
            /note\("([^"]+)"\)/,
            (_, notes) => `note("${applyRegisterShift(notes, dir)}")`
          );
        }
        break;
      }
      case 'unison': {
        // Arp borrows melody's first non-rest note
        const melody = results.find(r => r.name === 'melody');
        const arp = results.find(r => r.name === 'arp');
        if (melody && arp && this.state.activeMotif && this.state.activeMotif.length > 0) {
          const unisonNote = this.state.activeMotif[0];
          // Replace first note in arp with unison note
          arp.code = arp.code.replace(
            /note\("([^"]+)"\)/,
            (_, notes) => {
              const parts = notes.split(' ');
              const firstNoteIdx = parts.findIndex((n: string) => n !== '~');
              if (firstNoteIdx >= 0) parts[firstNoteIdx] = unisonNote;
              return `note("${parts.join(' ')}")`;
            }
          );
        }
        break;
      }
      case 'brightness-flash': {
        const flashMult = brightnessFlashMultiplier();
        // Apply to harmony and melody
        for (const result of results) {
          if (result.name === 'harmony' || result.name === 'melody') {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * flashMult)})`
            );
          }
        }
        break;
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
