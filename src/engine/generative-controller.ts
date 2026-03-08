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
import { shouldApplySymmetric, selectAxisType, suggestSymmetricMove } from '../theory/symmetric-division';
import { shouldApplyUnison, selectUnisonPattern, unisonAccentMask, unisonIntensity } from '../theory/rhythmic-unison';
import { shouldApplySaturation, saturationLevel, motifInjectionCount, selectMotifFragment, saturatedLayers } from '../theory/motivic-saturation';
import { fmIndexMultiplier, cadentialLpf, isResolutionChord } from '../theory/timbral-cadence';
import { isStructuralDownbeat, downbeatGainBoost } from '../theory/structural-downbeat';
import { totalSurprise, surpriseBrightness, surpriseGain } from '../theory/harmonic-surprise';
import { outerIntervalTension, intervalReverb, intervalFmDepth } from '../theory/intervallic-tension-map';
import { shouldApplyGradient, gradientDensityMultiplier } from '../theory/texture-gradient';
import { chordConsonance, updateFatigue, shouldInjectColor, resolutionBonus } from '../theory/consonance-fatigue';
import { estimateCentroid, centroidDeviation, lpfCorrectionMultiplier, shouldCorrectCentroid } from '../theory/spectral-centroid';
import { layerActivity, accompanimentGainResponse, shouldFollowEnvelope, followingLayers } from '../theory/envelope-following';
import { alignedFmh, shouldAlignOvertones } from '../theory/overtone-alignment';
import { speakingLayer, conversationGainMultiplier, shouldApplyConversation } from '../theory/rhythmic-conversation';
import { releasedEnergy, transferBoost, shouldTransferMomentum } from '../theory/momentum-transfer';
import { combinedGain, dynamicRangeMultiplier, shouldApplyDynamicRange } from '../theory/dynamic-range';
import { coupledDecay, shouldCoupleArticulation } from '../theory/articulation-coupling';
import { antiMaskingHpf, antiMaskingLpf, shouldApplyAntiMasking } from '../theory/spectral-masking';
import { energyLevel, energyGainMultiplier, shouldApplyEnergyEnvelope } from '../theory/energy-envelope';
import { detectCadence, cadentialGainBoost, cadentialReverbBoost, shouldApplyCadentialWeight } from '../theory/cadential-weight';
import { TimbralMemoryBank, blendTimbre } from '../theory/timbral-memory';
import { isPhraseEnding, overlapGainBoost, shouldApplyPhraseOverlap } from '../theory/phrase-overlap';
import { elasticTempoMultiplier, shouldApplyElasticity } from '../theory/rhythmic-elasticity';
import { cadentialAccelMultiplier, shouldAccelerate, phraseProgressFromSection } from '../theory/cadential-acceleration';
import { densityWaveMultiplier, shouldApplyDensityWave } from '../theory/density-wave';
import { hocketDensityMultiplier, shouldApplyHocket } from '../theory/rhythmic-hocket';
import { shouldSurpriseTiming, surpriseOffset, shouldApplyTimingSurprise } from '../theory/timing-surprise';
import { gravityDurationMultiplier, shouldApplyHarmonicGravity } from '../theory/harmonic-gravity';
import { closurePressure, tonicBias, shouldApplyClosure } from '../theory/tonal-closure';
import { chordTimingOffset, shouldApplyChordTiming } from '../theory/chord-anticipation-delay';
import { registerLpfMultiplier, registerFmMultiplier, shouldApplyRegisterWarmth } from '../theory/register-warmth';
import { tensionFmColor, tensionDecayColor, shouldApplyTensionColor } from '../theory/harmonic-tension-color';
import { echoDensityFeedback, shouldApplyEchoDensity } from '../theory/echo-density';
import { independenceDensityMult, shouldApplyIndependence } from '../theory/voice-independence';
import { bloomMultiplier, bloomLpfMultiplier, bloomRoomMultiplier, shouldApplyBloom } from '../theory/harmonic-bloom';
import { detectPhase, releaseMultiplier, releaseReverbMultiplier, shouldApplyTensionResolution } from '../theory/tension-resolution-pair';
import { spectralTiltLpf, shouldApplySpectralTilt } from '../theory/spectral-tilt';
import { pivotGainSwell, shouldApplyRhythmicPivot } from '../theory/rhythmic-pivot';
import { bassLayerCount, bassHpfCorrection, bassGainCorrection } from '../theory/bass-weight';
import { totalDensity, densityGainCorrection, densityLpfCorrection, shouldApplyTexturalBalance } from '../theory/textural-density-balance';
import { qualityDecayMultiplier, shouldApplySustainShape } from '../theory/chord-sustain-shape';
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
  /** Structural downbeat state */
  private structuralDownbeatActive = false;
  /** Consonance fatigue tracking */
  private consonanceFatigue = 0;
  /** Energy envelope tracking */
  private prevEnergy = 0.2;
  /** Timbral memory bank */
  private timbralMemory = new TimbralMemoryBank();

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

    // Consonance fatigue: track perceptual consonance over time
    {
      const NOTE_PC: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const chordPcs = this.state.currentChord.notes
        .map(n => NOTE_PC[n.replace(/\d+$/, '')])
        .filter((pc): pc is number => pc !== undefined);
      const consonance = chordConsonance(chordPcs);
      this.consonanceFatigue = updateFatigue(
        this.consonanceFatigue, consonance, this.state.mood, this.state.section
      );
    }

    this.state.ticksSinceChordChange++;
    this.state.tick++;

    // Structural downbeat: detect if we're at a first-note moment
    const gpJustEnded = this.gpActive && this.gpTicksRemaining === 1;
    this.structuralDownbeatActive = isStructuralDownbeat(
      this.state.sectionChanged, gpJustEnded, this.ticksSinceSilence
    );

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
      // Same scale type - try changing root instead

      // Symmetric axis navigation: Coltrane-style geometric key movement
      if (shouldApplySymmetric(this.state.tick, this.state.mood, this.state.section)) {
        const axisType = selectAxisType(this.state.mood, this.state.tick);
        const newRoot = suggestSymmetricMove(this.state.scale.root, axisType, this.state.tick);
        if (newRoot !== this.state.scale.root) {
          this.state.scale = buildScaleState(newRoot, this.state.scale.type);
          this.progression.setScale(this.state.scale);
          this.tonalGravity.record(this.state.scale.root, this.state.scale.type, this.state.tick);
          return;
        }
      }

      // Relative modulation fallback
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
    // Tonal closure: bias toward tonic-compatible chords near section ends
    const closureBias = shouldApplyClosure(this.state.mood)
      ? tonicBias(closurePressure(sectionProgress, this.state.mood, this.state.section))
      : 1.0;
    const combinedBias = phraseBias.map((pb, degree) => {
      let bias = pb * functionalBias(currentDegree, currentQuality, degree, this.state.mood)
         * journeyBias(degree, keyArea, this.state.mood)
         * this.emotionalMemory.chordRecallBias(
             this.state.scale.notes[degree] ?? 'C', degree,
             this.state.mood, this.state.section
           );
      // Boost I, IV, V when closure pressure is high
      if (closureBias > 1.05 && (degree === 0 || degree === 3 || degree === 4)) {
        bias *= closureBias;
      }
      return bias;
    });
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

    // Momentum transfer: boost entering layers with energy from fading layers
    {
      const targets: Record<string, number> = {};
      for (const layer of this.layers) {
        targets[layer.name] = this.state.activeLayers.has(layer.name) ? 1.0 : 0.0;
      }
      if (shouldTransferMomentum(this.state.layerGainMultipliers, targets, this.state.mood)) {
        const released = releasedEnergy(this.state.layerGainMultipliers, targets);
        for (const result of layerResults) {
          const current = this.state.layerGainMultipliers[result.name] ?? 0;
          const target = targets[result.name] ?? 0;
          const boost = transferBoost(result.name, current, target, released, this.state.mood);
          if (boost > 1.01) {
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
      }
    }

    // Texture gradient: smooth density interpolation during section transitions
    if (shouldApplyGradient(this.state.sectionProgress ?? 0, this.state.sectionChanged, this.state.mood)) {
      const densityMult = gradientDensityMultiplier(
        this.prevSection, this.state.section,
        this.state.sectionProgress ?? 0, this.state.mood
      );
      if (Math.abs(densityMult - 1.0) > 0.03) {
        for (const result of layerResults) {
          // Scale gain proportionally to density change (thinner = quieter)
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * densityMult).toFixed(4)})`;
              return `.gain((${expr}) * ${densityMult.toFixed(4)})`;
            }
          );
        }
      }
    }

    // Rhythmic hocket: cross-layer density anticorrelation for clarity
    if (shouldApplyHocket(this.state.mood, this.state.section)) {
      const densities: Record<string, number> = {};
      for (const result of layerResults) {
        densities[result.name] = this.state.layerPhraseDensity?.[result.name] ?? 0.5;
      }
      for (const result of layerResults) {
        if (result.name === 'drone' || result.name === 'atmosphere') continue;
        const otherDens = Object.entries(densities)
          .filter(([n]) => n !== result.name && n !== 'drone' && n !== 'atmosphere')
          .map(([, d]) => d);
        const hMult = hocketDensityMultiplier(
          densities[result.name] ?? 0.5, otherDens, this.state.mood, this.state.section
        );
        if (hMult < 0.97) {
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * hMult).toFixed(4)})`;
              return `.gain((${expr}) * ${hMult.toFixed(4)})`;
            }
          );
        }
      }
    }

    // Motivic saturation: inject motif fragments into non-melody layers as tension builds
    if (this.state.activeMotif && this.state.activeMotif.length >= 3 &&
        shouldApplySaturation(this.state.tick, this.state.mood, this.state.section)) {
      const level = saturationLevel(
        this.state.mood, this.state.section,
        this.state.sectionProgress ?? 0, this.state.tension?.overall ?? 0.5
      );
      const injCount = motifInjectionCount(level, this.state.activeMotif.length);
      if (injCount > 0) {
        const fragment = selectMotifFragment(this.state.activeMotif, injCount, this.state.tick);
        const targetLayers = saturatedLayers(level);
        for (const result of layerResults) {
          if (targetLayers.includes(result.name) && fragment.length > 0) {
            // Inject motif notes into the layer's note pattern (replace some rests)
            result.code = result.code.replace(
              /note\("([^"]+)"\)/,
              (_, notes) => {
                const parts = notes.split(' ');
                let injected = 0;
                for (let i = 0; i < parts.length && injected < fragment.length; i++) {
                  if (parts[i] === '~') {
                    parts[i] = fragment[injected];
                    injected++;
                  }
                }
                return `note("${parts.join(' ')}")`;
              }
            );
          }
        }
      }
    }

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

    // Rhythmic unison: coordinated accent across all layers at climactic moments
    if (shouldApplyUnison(
      this.state.tick, this.state.mood, this.state.section,
      this.state.sectionProgress ?? 0, this.state.tension?.overall ?? 0.5
    )) {
      const uPattern = selectUnisonPattern(this.state.tick, this.state.mood);
      const uIntensity = unisonIntensity(
        this.state.mood, this.state.section, this.state.tension?.overall ?? 0.5
      );
      const mask = unisonAccentMask(uPattern, 16, uIntensity);
      // Apply gain-pattern accent mask to all layers that use note patterns
      for (const result of layerResults) {
        result.code = result.code.replace(
          /\.gain\("([^"]+)"\)/,
          (_, gains) => {
            const parts = gains.split(' ').map(Number);
            const modded = parts.map((g: number, i: number) => (g * mask[i % mask.length]).toFixed(4));
            return `.gain("${modded.join(' ')}")`;
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

    // Timbral cadence: FM parameters resolve at cadence points
    {
      const prevDeg = this.state.chordHistory.length > 0
        ? this.state.chordHistory[this.state.chordHistory.length - 1].degree
        : null;
      const isRes = isResolutionChord(this.state.currentChord.degree, prevDeg);
      const tension = this.state.tension?.overall ?? 0.5;
      const fmMult = fmIndexMultiplier(tension, isRes, this.state.mood);
      if (Math.abs(fmMult - 1.0) > 0.02) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.fm\(([0-9.]+)\)/,
            (_, val) => `.fm(${(parseFloat(val) * fmMult).toFixed(2)})`
          );
        }
      }
      // LPF adjustment
      if (isRes) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(cadentialLpf(parseFloat(val), tension, true, this.state.mood))})`
          );
        }
      }
    }

    // Structural downbeat: emphasize the first note after silence/section change
    if (this.structuralDownbeatActive) {
      const boost = downbeatGainBoost(this.state.mood, this.state.section);
      if (boost > 1.01) {
        for (const result of layerResults) {
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
    }

    // Cadential weight: heavier orchestration at cadence points
    if (this.state.chordChanged && this.state.chordHistory.length > 0) {
      const prevCW = this.state.chordHistory[this.state.chordHistory.length - 1];
      const cadStr = detectCadence(
        prevCW.degree, this.state.currentChord.degree, prevCW.quality
      );
      if (shouldApplyCadentialWeight(cadStr, this.state.mood)) {
        const gBoost = cadentialGainBoost(cadStr, this.state.mood, this.state.section);
        const rBoost = cadentialReverbBoost(cadStr, this.state.mood);
        for (const result of layerResults) {
          if (gBoost > 1.01) {
            result.code = result.code.replace(
              /\.gain\(([^)]+)\)/,
              (_, expr) => {
                const num = parseFloat(expr);
                if (!isNaN(num)) return `.gain(${(num * gBoost).toFixed(4)})`;
                return `.gain((${expr}) * ${gBoost.toFixed(4)})`;
              }
            );
          }
          if (rBoost > 1.01) {
            result.code = result.code.replace(
              /\.room\(([0-9.]+)\)/,
              (_, val) => `.room(${(parseFloat(val) * rBoost).toFixed(2)})`
            );
          }
        }
      }
    }

    // Harmonic surprise: unexpected chords get brightness/gain flash
    if (this.state.chordChanged && this.state.chordHistory.length > 0) {
      const prevChord2 = this.state.chordHistory[this.state.chordHistory.length - 1];
      const surprise = totalSurprise(
        prevChord2.degree, this.state.currentChord.degree,
        this.state.currentChord.quality
      );
      if (surprise > 0.15) {
        const brightMult = surpriseBrightness(surprise, this.state.mood);
        const gainMult = surpriseGain(surprise, this.state.mood);
        for (const result of layerResults) {
          if (brightMult > 1.01) {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * brightMult)})`
            );
          }
          if (gainMult > 1.01) {
            result.code = result.code.replace(
              /\.gain\(([^)]+)\)/,
              (_, expr) => {
                const num = parseFloat(expr);
                if (!isNaN(num)) return `.gain(${(num * gainMult).toFixed(4)})`;
                return `.gain((${expr}) * ${gainMult.toFixed(4)})`;
              }
            );
          }
        }
      }
    }

    // Consonance fatigue: brighten when fatigued, boost resolution after dissonance
    if (shouldInjectColor(this.consonanceFatigue, this.state.mood)) {
      const brightBoost = 1.0 + this.consonanceFatigue * 0.15;
      for (const result of layerResults) {
        result.code = result.code.replace(
          /\.lpf\((\d+(?:\.\d+)?)\)/,
          (_, val) => `.lpf(${Math.round(parseFloat(val) * brightBoost)})`
        );
      }
    }
    {
      const NOTE_PC2: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const chordPcs2 = this.state.currentChord.notes
        .map(n => NOTE_PC2[n.replace(/\d+$/, '')])
        .filter((pc): pc is number => pc !== undefined);
      const resBonus = resolutionBonus(this.consonanceFatigue, chordConsonance(chordPcs2));
      if (resBonus > 0.05) {
        const gainBoost = 1.0 + resBonus * 0.3;
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * gainBoost).toFixed(4)})`;
              return `.gain((${expr}) * ${gainBoost.toFixed(4)})`;
            }
          );
        }
      }
    }

    // Intervallic tension: melody-bass interval colors reverb and FM
    {
      const melodyMotif = this.state.activeMotif;
      const bassNote = this.state.currentChord.notes[0] ?? null;
      const melodyNote = melodyMotif && melodyMotif.length > 0
        ? melodyMotif.find(n => n !== '~') ?? null
        : null;
      const outerTension = outerIntervalTension(melodyNote, bassNote);
      const reverbMult = intervalReverb(outerTension, this.state.mood);
      const fmMult2 = intervalFmDepth(outerTension, this.state.mood);
      if (Math.abs(reverbMult - 1.0) > 0.02) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.room\(([0-9.]+)\)/,
            (_, val) => `.room(${(parseFloat(val) * reverbMult).toFixed(2)})`
          );
        }
      }
      if (Math.abs(fmMult2 - 1.0) > 0.02) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.fm\(([0-9.]+)\)/,
            (_, val) => `.fm(${(parseFloat(val) * fmMult2).toFixed(2)})`
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

    // Envelope following: accompaniment breathes with melody activity
    if (shouldFollowEnvelope(this.state.mood, this.state.section)) {
      const melodyResult = layerResults.find(r => r.name === 'melody');
      if (melodyResult) {
        const noteMatch = melodyResult.code.match(/note\("([^"]+)"\)/);
        const melodyAct = noteMatch ? layerActivity(noteMatch[1]) : 0.5;
        const followers = followingLayers(this.state.mood);
        for (const result of layerResults) {
          if (followers.includes(result.name)) {
            const followMult = accompanimentGainResponse(melodyAct, this.state.mood, this.state.section);
            if (Math.abs(followMult - 1.0) > 0.02) {
              result.code = result.code.replace(
                /\.gain\(([^)]+)\)/,
                (_, expr) => {
                  const num = parseFloat(expr);
                  if (!isNaN(num)) return `.gain(${(num * followMult).toFixed(4)})`;
                  return `.gain((${expr}) * ${followMult.toFixed(4)})`;
                }
              );
            }
          }
        }
      }
    }

    // Phrase overlap: boost non-ending layers when melody is ending
    if (shouldApplyPhraseOverlap(this.state.mood, layerResults.length)) {
      const melodyR2 = layerResults.find(r => r.name === 'melody');
      if (melodyR2) {
        const noteMatch2 = melodyR2.code.match(/note\("([^"]+)"\)/);
        const melodyEnding = noteMatch2 ? isPhraseEnding(noteMatch2[1]) : false;
        if (melodyEnding) {
          for (const result of layerResults) {
            if (result.name === 'melody') continue;
            const boost = overlapGainBoost(this.state.mood, this.state.section, true);
            if (boost > 1.01) {
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
        }
      }
    }

    // Timbral memory: store current FM settings and occasionally recall familiar timbres
    for (const result of layerResults) {
      const fmhMatch = result.code.match(/\.fmh\(([0-9.]+)\)/);
      const fmMatch = result.code.match(/\.fm\(([0-9.]+)\)/);
      const lpfMatch = result.code.match(/\.lpf\((\d+(?:\.\d+)?)\)/);
      if (fmhMatch && fmMatch && lpfMatch) {
        this.timbralMemory.store(this.state.mood, result.name, {
          fmh: parseFloat(fmhMatch[1]),
          fm: parseFloat(fmMatch[1]),
          lpf: parseFloat(lpfMatch[1]),
          section: this.state.section,
          tick: this.state.tick,
        });
        if (this.timbralMemory.shouldRecall(this.state.mood, this.state.tick)) {
          const recalled = this.timbralMemory.recall(this.state.mood, result.name, this.state.section);
          if (recalled) {
            const currentFmh = parseFloat(fmhMatch[1]);
            const blended = blendTimbre(currentFmh, recalled.fmh, this.state.mood);
            if (Math.abs(blended - currentFmh) > 0.05) {
              result.code = result.code.replace(
                /\.fmh\([0-9.]+\)/,
                `.fmh(${blended.toFixed(2)})`
              );
            }
          }
        }
      }
    }

    // Overtone alignment: nudge fmh toward reinforcing ratios between layers
    if (shouldAlignOvertones(this.state.mood, layerResults.length)) {
      const fmhValues: { name: string; fmh: number }[] = [];
      for (const result of layerResults) {
        const match = result.code.match(/\.fmh\(([0-9.]+)\)/);
        if (match) fmhValues.push({ name: result.name, fmh: parseFloat(match[1]) });
      }
      if (fmhValues.length >= 2) {
        for (const result of layerResults) {
          const match = result.code.match(/\.fmh\(([0-9.]+)\)/);
          if (match) {
            const myFmh = parseFloat(match[1]);
            const others = fmhValues
              .filter(f => f.name !== result.name)
              .map(f => f.fmh);
            const aligned = alignedFmh(myFmh, others, this.state.mood, this.state.section);
            if (Math.abs(aligned - myFmh) > 0.01) {
              result.code = result.code.replace(
                /\.fmh\([0-9.]+\)/,
                `.fmh(${aligned.toFixed(2)})`
              );
            }
          }
        }
      }
    }

    // Rhythmic conversation: foreground speaking layer, dip others
    if (shouldApplyConversation(this.state.mood, layerResults.length)) {
      const activeNames = layerResults.map(r => r.name);
      const speaker = speakingLayer(
        activeNames, this.state.tick, this.state.mood, this.state.section
      );
      for (const result of layerResults) {
        const convMult = conversationGainMultiplier(result.name, speaker, this.state.mood);
        if (Math.abs(convMult - 1.0) > 0.01) {
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * convMult).toFixed(4)})`;
              return `.gain((${expr}) * ${convMult.toFixed(4)})`;
            }
          );
        }
      }
    }

    // Articulation coupling: coordinate decay character between layers
    if (shouldCoupleArticulation(this.state.mood, layerResults.length)) {
      const melodyR = layerResults.find(r => r.name === 'melody');
      if (melodyR) {
        const decayMatch = melodyR.code.match(/\.decay\(([0-9.]+)\)/);
        if (decayMatch) {
          const leadDecay = parseFloat(decayMatch[1]);
          for (const result of layerResults) {
            if (result.name === 'melody') continue;
            const followerMatch = result.code.match(/\.decay\(([0-9.]+)\)/);
            if (followerMatch) {
              const baseDecay = parseFloat(followerMatch[1]);
              const coupled = coupledDecay(leadDecay, baseDecay, this.state.mood, this.state.section);
              if (Math.abs(coupled - baseDecay) > 0.01) {
                result.code = result.code.replace(
                  /\.decay\([0-9.]+\)/,
                  `.decay(${coupled.toFixed(3)})`
                );
              }
            }
          }
        }
      }
    }

    // Spectral masking: carve frequency space to prevent layer collisions
    if (shouldApplyAntiMasking(layerResults.length, this.state.mood)) {
      const activeNames = layerResults.map(r => r.name);
      for (const result of layerResults) {
        const hpfOffset = antiMaskingHpf(result.name, activeNames, this.state.mood);
        if (hpfOffset > 5) {
          result.code = result.code.replace(
            /\.hpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.hpf(${Math.round(parseFloat(val) + hpfOffset)})`
          );
        }
        const lpfOffset = antiMaskingLpf(result.name, activeNames, this.state.mood);
        if (lpfOffset < -5) {
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) + lpfOffset)})`
          );
        }
      }
    }

    // Energy envelope: piece-level energy trajectory
    if (shouldApplyEnergyEnvelope(this.state.mood)) {
      const energy = energyLevel(
        this.state.section, this.state.sectionProgress ?? 0, this.state.mood
      );
      const eGainMult = energyGainMultiplier(energy, this.state.mood);
      if (Math.abs(eGainMult - 1.0) > 0.02) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * eGainMult).toFixed(4)})`;
              return `.gain((${expr}) * ${eGainMult.toFixed(4)})`;
            }
          );
        }
      }
      this.prevEnergy = energy;
    }

    // Density wave: rhythmic density breathing within sections
    if (shouldApplyDensityWave(this.state.mood, this.state.section)) {
      const dwMult = densityWaveMultiplier(this.state.tick, this.state.mood, this.state.section);
      if (Math.abs(dwMult - 1.0) > 0.02) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * dwMult).toFixed(4)})`;
              return `.gain((${expr}) * ${dwMult.toFixed(4)})`;
            }
          );
        }
      }
    }

    // Spectral centroid: auto-correct overall brightness balance
    {
      const lpfValues: number[] = [];
      for (const result of layerResults) {
        const match = result.code.match(/\.lpf\((\d+(?:\.\d+)?)\)/);
        if (match) lpfValues.push(parseFloat(match[1]));
      }
      if (lpfValues.length >= 2) {
        const centroid = estimateCentroid(lpfValues);
        const dev = centroidDeviation(centroid, this.state.mood, this.state.section);
        if (shouldCorrectCentroid(dev, this.state.mood)) {
          const correction = lpfCorrectionMultiplier(dev, this.state.mood);
          for (const result of layerResults) {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * correction)})`
            );
          }
        }
      }
    }

    // Tension-resolution pair: coordinated brightness/reverb shift during release
    if (shouldApplyTensionResolution(this.state.mood)) {
      const tension = this.state.tension?.overall ?? 0.5;
      const phase = detectPhase(tension, this.prevEnergy, this.state.mood);
      const relMult = releaseMultiplier(phase, this.state.mood);
      const revMult = releaseReverbMultiplier(phase, this.state.mood);
      if (Math.abs(relMult - 1.0) > 0.03) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * relMult)})`
          );
        }
      }
      if (Math.abs(revMult - 1.0) > 0.03) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.room\(([0-9.]+)\)/,
            (_, val) => `.room(${(parseFloat(val) * revMult).toFixed(4)})`
          );
        }
      }
    }

    // Spectral tilt: global brightness curve across sections
    if (shouldApplySpectralTilt(this.state.mood)) {
      const tiltLpf = spectralTiltLpf(
        this.state.sectionProgress ?? 0, this.state.mood, this.state.section
      );
      if (Math.abs(tiltLpf - 1.0) > 0.03) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * tiltLpf)})`
          );
        }
      }
    }

    // Rhythmic pivot: gain swell approaching section boundaries
    if (shouldApplyRhythmicPivot(this.state.sectionProgress ?? 0, this.state.mood)) {
      const swell = pivotGainSwell(
        this.state.sectionProgress ?? 0, this.state.mood, this.state.section
      );
      if (Math.abs(swell - 1.0) > 0.01) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * swell).toFixed(4)})`;
              return `.gain((${expr}) * ${swell.toFixed(4)})`;
            }
          );
        }
      }
    }

    // Bass weight: prevent bass frequency buildup between layers
    {
      const NOTE_MIDI_BW: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const layerMidis: Record<string, number> = {};
      for (const result of layerResults) {
        const noteMatch = result.code.match(/note\("([^"]+)"\)/);
        if (!noteMatch) continue;
        const notes = noteMatch[1].split(/\s+/).filter(n => n !== '~');
        if (notes.length === 0) continue;
        let sum = 0;
        for (const n of notes) {
          const name = n.replace(/\d+$/, '');
          const oct = parseInt(n.match(/\d+$/)?.[0] ?? '4');
          sum += (NOTE_MIDI_BW[name] ?? 0) + oct * 12;
        }
        layerMidis[result.name] = sum / notes.length;
      }
      const bassCount = bassLayerCount(layerMidis);
      if (bassCount >= 2) {
        for (const result of layerResults) {
          const isMain = result.name === 'drone';
          const hpf = bassHpfCorrection(bassCount, this.state.mood, isMain);
          if (hpf > 5) {
            result.code = result.code.replace(
              /\.hpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.hpf(${Math.round(parseFloat(val) + hpf)})`
            );
          }
          const gCorr = bassGainCorrection(bassCount, this.state.mood, isMain);
          if (gCorr < 0.97) {
            result.code = result.code.replace(
              /\.gain\(([^)]+)\)/,
              (_, expr) => {
                const num = parseFloat(expr);
                if (!isNaN(num)) return `.gain(${(num * gCorr).toFixed(4)})`;
                return `.gain((${expr}) * ${gCorr.toFixed(4)})`;
              }
            );
          }
        }
      }
    }

    // Voice independence: supporting layers thin when melody is active
    if (shouldApplyIndependence(this.state.mood) && this.state.layerStepPattern?.['melody']) {
      const melodyPattern = this.state.layerStepPattern['melody'];
      for (const result of layerResults) {
        if (result.name === 'melody' || result.name === 'drone' || result.name === 'atmosphere') continue;
        const mult = independenceDensityMult(melodyPattern, 0, this.state.mood, this.state.section);
        if (mult < 0.97) {
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * mult).toFixed(4)})`;
              return `.gain((${expr}) * ${mult.toFixed(4)})`;
            }
          );
        }
      }
    }

    // Textural density balance: gain/LPF correction for high total density
    if (shouldApplyTexturalBalance(this.state.mood) && this.state.layerPhraseDensity) {
      const total = totalDensity(this.state.layerPhraseDensity);
      if (total > 3.0) {
        const gainCorr = densityGainCorrection(total, this.state.mood, this.state.section);
        const lpfCorr = densityLpfCorrection(total, this.state.mood);
        if (gainCorr < 0.97) {
          for (const result of layerResults) {
            result.code = result.code.replace(
              /\.gain\(([^)]+)\)/,
              (_, expr) => {
                const num = parseFloat(expr);
                if (!isNaN(num)) return `.gain(${(num * gainCorr).toFixed(4)})`;
                return `.gain((${expr}) * ${gainCorr.toFixed(4)})`;
              }
            );
          }
        }
        if (lpfCorr < 0.97) {
          for (const result of layerResults) {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * lpfCorr)})`
            );
          }
        }
      }
    }

    // Chord sustain shape: decay varies by chord quality
    if (shouldApplySustainShape(this.state.mood)) {
      const decMult = qualityDecayMultiplier(this.state.currentChord.quality, this.state.mood);
      if (Math.abs(decMult - 1.0) > 0.02) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.decay\(([0-9.]+)\)/,
            (_, val) => `.decay(${(parseFloat(val) * decMult).toFixed(4)})`
          );
        }
      }
    }

    // Harmonic bloom: sustained chords open up over time (FM/LPF/room increase)
    if (shouldApplyBloom(this.state.mood) && (this.state.ticksSinceChordChange ?? 0) >= 2) {
      const ticks = this.state.ticksSinceChordChange ?? 0;
      const fmBloom = bloomMultiplier(ticks, this.state.mood, this.state.section);
      const lpfBloom = bloomLpfMultiplier(ticks, this.state.mood);
      const roomBloom = bloomRoomMultiplier(ticks, this.state.mood);
      if (fmBloom > 1.02) {
        for (const result of layerResults) {
          if (result.name === 'texture') continue; // drums don't bloom
          result.code = result.code.replace(
            /\.fm\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.fm(${(parseFloat(val) * fmBloom).toFixed(2)})`
          );
        }
      }
      if (lpfBloom > 1.02) {
        for (const result of layerResults) {
          if (result.name === 'texture') continue;
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * lpfBloom)})`
          );
        }
      }
      if (roomBloom > 1.02) {
        for (const result of layerResults) {
          if (result.name === 'texture') continue;
          result.code = result.code.replace(
            /\.room\(([0-9.]+)\)/,
            (_, val) => `.room(${(parseFloat(val) * roomBloom).toFixed(4)})`
          );
        }
      }
    }

    // Harmonic tension color: FM depth and decay respond to tension level
    if (shouldApplyTensionColor(this.state.mood)) {
      const tension = this.state.tension?.overall ?? 0.5;
      const fmColor = tensionFmColor(tension, this.state.mood);
      const decColor = tensionDecayColor(tension, this.state.mood);
      if (Math.abs(fmColor - 1.0) > 0.03) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.fm\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.fm(${(parseFloat(val) * fmColor).toFixed(2)})`
          );
        }
      }
      if (Math.abs(decColor - 1.0) > 0.03) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.decay\(([0-9.]+)\)/,
            (_, val) => `.decay(${(parseFloat(val) * decColor).toFixed(4)})`
          );
        }
      }
    }

    // Echo density: delay feedback adapts to musical density
    if (shouldApplyEchoDensity(this.state.mood)) {
      for (const result of layerResults) {
        const density = this.state.layerPhraseDensity?.[result.name] ?? 0.5;
        const fbMult = echoDensityFeedback(density, this.state.mood, this.state.section);
        if (Math.abs(fbMult - 1.0) > 0.03) {
          result.code = result.code.replace(
            /\.room\(([0-9.]+)\)/,
            (_, val) => `.room(${(parseFloat(val) * fbMult).toFixed(4)})`
          );
        }
      }
    }

    // Register warmth: LPF/FM respond to pitch register (low=warm, high=bright)
    if (shouldApplyRegisterWarmth(this.state.mood)) {
      const NOTE_MIDI_RW: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      for (const result of layerResults) {
        // Estimate average MIDI from note pattern
        const noteMatch = result.code.match(/note\("([^"]+)"\)/);
        if (!noteMatch) continue;
        const notes = noteMatch[1].split(/\s+/).filter(n => n !== '~');
        if (notes.length === 0) continue;
        let midiSum = 0;
        for (const n of notes) {
          const name = n.replace(/\d+$/, '');
          const oct = parseInt(n.match(/\d+$/)?.[0] ?? '4');
          midiSum += (NOTE_MIDI_RW[name] ?? 0) + oct * 12;
        }
        const avgMidi = midiSum / notes.length;
        const lpfMult = registerLpfMultiplier(avgMidi, this.state.mood);
        const fmMult = registerFmMultiplier(avgMidi, this.state.mood);
        if (Math.abs(lpfMult - 1.0) > 0.03) {
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * lpfMult)})`
          );
        }
        if (Math.abs(fmMult - 1.0) > 0.03) {
          result.code = result.code.replace(
            /\.fm\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.fm(${(parseFloat(val) * fmMult).toFixed(2)})`
          );
        }
      }
    }

    // Dynamic range: soft-limit combined gain to prevent clipping/disappearing
    {
      const gains: number[] = [];
      for (const result of layerResults) {
        const match = result.code.match(/\.gain\(([0-9.]+)\)/);
        if (match) gains.push(parseFloat(match[1]));
      }
      if (gains.length > 0) {
        const total = combinedGain(gains);
        if (shouldApplyDynamicRange(total, this.state.section)) {
          const drMult = dynamicRangeMultiplier(total, this.state.mood, this.state.section);
          if (Math.abs(drMult - 1.0) > 0.02) {
            for (const result of layerResults) {
              result.code = result.code.replace(
                /\.gain\(([^)]+)\)/,
                (_, expr) => {
                  const num = parseFloat(expr);
                  if (!isNaN(num)) return `.gain(${(num * drMult).toFixed(4)})`;
                  return `.gain((${expr}) * ${drMult.toFixed(4)})`;
                }
              );
            }
          }
        }
      }
    }

    // Chord anticipation delay: layers arrive at chord changes at different times
    if (this.state.chordChanged && shouldApplyChordTiming(this.state.mood, this.state.section)) {
      for (const result of layerResults) {
        const offset = chordTimingOffset(result.name, this.state.mood, this.state.section);
        if (Math.abs(offset) > 0.005) {
          const lateVal = Math.max(0.001, offset + 0.05); // shift to positive range
          result.code = result.code.replace(
            /\.orbit\((\d+)\)/,
            (m) => `.late(${lateVal.toFixed(4)})${m}`
          );
        }
      }
    }

    // Timing surprise: rare micro-rhythmic deviations for playful looseness
    if (shouldApplyTimingSurprise(this.state.mood, this.state.section)) {
      for (const result of layerResults) {
        if (result.name === 'drone' || result.name === 'atmosphere') continue;
        if (shouldSurpriseTiming(this.state.tick, 0, this.state.mood, this.state.section)) {
          const offset = surpriseOffset(this.state.tick, 0, this.state.mood);
          if (Math.abs(offset) > 0.005) {
            // Add as .late() offset (positive = late, negative handled via small positive)
            const lateVal = Math.max(0.001, offset + 0.03); // shift to positive range
            result.code = result.code.replace(
              /\.orbit\((\d+)\)/,
              (m) => `.late(${lateVal.toFixed(4)})${m}`
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
    // Rhythmic elasticity: tension-responsive micro-timing
    const elastic = shouldApplyElasticity(this.state.mood, this.state.section)
      ? elasticTempoMultiplier(this.state.tension?.overall ?? 0.5, this.state.mood, this.state.section)
      : 1.0;
    // Cadential acceleration: phrases speed up approaching cadences
    const cadAccel = shouldAccelerate(this.state.mood, this.state.section)
      ? cadentialAccelMultiplier(
          phraseProgressFromSection(this.state.sectionProgress ?? 0),
          this.state.mood,
          this.state.section
        )
      : 1.0;
    const effectiveTempo = this.state.params.tempo * rubato * cadRubato * tempoTraj * tempoFeel * metricMod * elastic * cadAccel;
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
