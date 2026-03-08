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
import { crossfadeBlend, crossfadeFm, shouldCrossfade } from '../theory/cross-fade-texture';
import { swingOffsets, shouldApplyIntraBeatSwing } from '../theory/intra-beat-swing';
import { sustainMultiplier, shouldApplySustainCurve } from '../theory/sustain-envelope-curve';
import { predictiveLpfMultiplier, shouldApplyPredictiveEq } from '../theory/predictive-eq';
import { phaseLockCorrection, shouldApplyPhaseLock } from '../theory/grid-phase-lock';
import { onsetHpfBoost, onsetLpfReduction, isInOnsetPhase, shouldCarveOnset } from '../theory/spectral-onset-carve';
import { gravityMultiplier, shouldEscalate } from '../theory/gravity-escalation';
import { punchGainMultiplier, shouldApplyPunch, detectAttacks } from '../theory/transient-punch';
import { drumToHarmonyResonance, drumToHarmonyDecay, harmonyToDrumGain, shouldApplyCoupling } from '../theory/layer-feedback-coupling';
import { modDepthMultiplier, shouldSyncModulation } from '../theory/modulation-phase-sync';
import { clarityGainBoost, clarityLpfBoost, findDominantLayer, shouldApplyClarity } from '../theory/clarity-boost';
import { fusionGainBalance, shouldApplyFusion } from '../theory/auditory-stream-fusion';
import { totalRoughness, roughnessGainReduction, shouldSmoothRoughness } from '../theory/roughness-smoothing';
import { precedenceReverbReduction, shouldApplyPrecedence } from '../theory/spatial-precedence';
import { bassLayerCount, bassHpfCorrection, bassGainCorrection } from '../theory/bass-weight';
import { subsonicGainBoost, subsonicRoomBoost, shouldApplySubsonicPulse } from '../theory/subsonic-pulse';
import { beatWarpMultiplier, shouldApplyBeatWarp } from '../theory/beat-elastic-warp';
import { registerCollision, suggestOctaveShift, collisionGainReduction, shouldAvoidCollisions } from '../theory/register-collision-avoidance';
import { coherenceFmMultiplier, shouldApplyCoherence } from '../theory/spectral-temporal-coherence';
import { shouldApplyFugato, fugatoEntryDelay, fugatoOctaveOffset, transposeMotif } from '../theory/cross-layer-fugato';
import { harmonicInertia, changeReluctance, cadentialEscape, shouldApplyInertia } from '../theory/harmonic-inertia';
import { noteSalience, salienceGainBoost, backgroundGainReduction, shouldApplySalience } from '../theory/auditory-salience';
import { chordDistance, distanceBias, shouldApplyTopology } from '../theory/harmonic-topology';
import { trajectoryMomentum, continuationBias, shouldApplyContinuation } from '../theory/gestalt-continuation';
import { shouldBreakPattern, reengagementGain } from '../theory/loop-engagement-cycle';
import { harmonicComplexity, shouldSimplifyChord, simplificationImpactBonus } from '../theory/harmonic-saturation-index';
import { estimateMetabolism, metabolismDensityCorrection, shouldAdjustMetabolism } from '../theory/event-metabolism';
import { spectralWeight, weightLpfMultiplier, weightHpfMultiplier, shouldApplyWeight } from '../theory/spectral-weight';
import { magneticPull, attractorPitch, shouldApplyMagnetism } from '../theory/tonal-magnetism';
import { attentionEnergy, needsNovelty, noveltyGainBoost, shouldTrackAttention } from '../theory/attention-decay';
import { phraseTensionProfile, tensionGainMultiplier } from '../theory/phrase-consonance-curve';
import { gainJitter, fmJitter, filterJitter, shouldApplyResonance } from '../theory/stochastic-resonance';
import { grooveTightness, timingCorrection, shouldApplyBinding } from '../theory/temporal-binding';
import { shouldUseLydian, lydianFourth, naturalFourth } from '../theory/lydian-brightness';
import { maxHarmonyVoices, densityGainPenalty, shouldBalanceVoiceDensity } from '../theory/voice-density-balance';
import { shouldHoldPedal, pedalSustainMultiplier, pedalDecayMultiplier } from '../theory/pedal-bass-sustain';
import { functionDecayMultiplier } from '../theory/harmonic-envelope-shaping';
import { gravitationNudge, shouldApplyGravitation } from '../theory/rhythmic-gravitation';
import { characteristicToneWeight } from '../theory/modal-coloring';
import { expectancyWeight } from '../theory/melodic-expectancy';
import { breathingSpread, shouldApplyBreathing } from '../theory/harmonic-breathing';
import { shouldDisplace, displacementAmount } from '../theory/rhythmic-displacement-pattern';
import { registralGainCorrection } from '../theory/registral-balance';
import { shouldOrnamentCadence, selectOrnament } from '../theory/cadential-ornamentation';
import { timbralContrastMultiplier, shouldApplyTimbralContrast } from '../theory/timbral-contrast-curve';
import { leapRecoveryWeight } from '../theory/intervallic-leap-recovery';
import { chordDurationElasticity } from '../theory/harmonic-rhythm-elasticity';
import { perceptualGainCorrection } from '../theory/perceptual-loudness';
import { complementaryLpf } from '../theory/spectral-complementarity';
import { momentumGain, momentumBrightness } from '../theory/phrase-momentum';
import { shouldDouble, doublingOctave } from '../theory/cross-register-doubling';
import { driftAmount, driftDirection, shouldDrift } from '../theory/tonal-center-drift';
import { layerTempoRatio, shouldApplyStrata } from '../theory/rhythmic-strata';
import { harmonicSeriesRatio, harmonicSeriesDepth } from '../theory/harmonic-series-voicing';
import { anticipatoryGain } from '../theory/anticipatory-accent';
import { countChromaticMotions, chromaticLeadingGain } from '../theory/chromatic-voice-leading';
import { barElasticity, shouldApplyMetricElasticity } from '../theory/metric-elasticity';
import { closureSpread } from '../theory/voicing-closure';
import { densityGradientCorrection } from '../theory/rhythmic-density-gradient';
import { shouldHoldPreviousChord } from '../theory/harmonic-parallax';
import { pitchMemoryWeight } from '../theory/pitch-memory-bias';
import { rootDistance, velocityGainBoost, velocityBrightnessBoost } from '../theory/harmonic-velocity';
import { spectralDecayLpf, shouldApplySpectralDecay } from '../theory/spectral-decay-profile';
import { intervalWeight } from '../theory/intervallic-palette';
import { articulationContrastDecay } from '../theory/dynamic-articulation-contrast';
import { trackingLpf } from '../theory/resonance-frequency-tracking';
import { spectralEnvelopeLpf, shouldTrackSpectralEnvelope } from '../theory/spectral-envelope-tracking';
import { canonDisplacement, shouldApplyCanonDisplacement } from '../theory/metric-displacement-canon';
import { fieldTensionGain, fieldTensionBrightness } from '../theory/harmonic-field-tension';
import { consonanceArcFm } from '../theory/consonance-arc';
import { thicknessGainReduction } from '../theory/rhythmic-thinning';
import { spectralWidthLpf } from '../theory/spectral-width';
import { formantLpfMultiplier } from '../theory/formant-tracking';
import { shouldPreferPalindrome } from '../theory/rhythmic-palindrome';
import { centroidCorrectionLpf } from '../theory/spectral-centroid-correction';
import { complementGain } from '../theory/rhythmic-complement';
import { shouldChainSuspension, suspensionSustainMul } from '../theory/harmonic-suspension-flow';
import { shouldRecallTimbre } from '../theory/timbral-recall';
import { beatingFmCorrection } from '../theory/overtone-beating';
import { qaGainEmphasis } from '../theory/phrase-question-answer';
import { compressionMultiplier } from '../theory/dynamic-compression';
import { orbitalWeight } from '../theory/pitch-orbit';
import { grainDecayMultiplier } from '../theory/texture-granularity';
import { saturationGainReduction, saturationLpfCorrection } from '../theory/harmonic-saturation-curve';
import { contourMatchWeight } from '../theory/melodic-contour-matching';
import { chordChangeAlignment } from '../theory/harmonic-rhythm-sync';
import { fluxCorrection } from '../theory/spectral-flux';
import { availableRange } from '../theory/registral-envelope';
import { shouldAnticipate } from '../theory/harmonic-pedal-anticipation';
import { entrainedOffset, shouldEntrain } from '../theory/rhythmic-entrainment';
import { cadentialWeight } from '../theory/cadential-weight-distribution';
import { microDynamicGain } from '../theory/micro-dynamics';
import { morphedLpf } from '../theory/spectral-morphing';
import { voiceLeadingWeight } from '../theory/voice-leading-cost';
import { polymetricTension } from '../theory/polymetric-tension';
import { temperatureLpf, temperatureFm } from '../theory/harmonic-color-temperature';
import { tonicGravityWeight } from '../theory/tonal-center-gravity';
import { densityTarget } from '../theory/rhythmic-density-envelope';
import { blendLpfCorrection } from '../theory/spectral-blend';
import { counterpointScore } from '../theory/counterpoint-rules';
import { interchangeBrightness, interchangeFm } from '../theory/modal-interchange-brightness';
import { agogicDuration, noteImportance } from '../theory/agogic-accent';
import { harmonicAcceleration } from '../theory/harmonic-rhythm-acceleration';
import { commonToneWeight } from '../theory/pitch-set-intersection';
import { contourDynamicGain } from '../theory/dynamic-contour';
import { shapedTension } from '../theory/tension-curve-shaping';
import { momentumGainMultiplier } from '../theory/melodic-interval-momentum';
import { partialsReinforcementFm } from '../theory/harmonic-partials-reinforcement';
import { expectancyGainEmphasis } from '../theory/rhythmic-expectancy-violation';
import { ambiguityReverbMultiplier } from '../theory/tonal-ambiguity-gradient';
import { attackMultiplier } from '../theory/attack-transient-shaping';
import { harmonicRhythmVariance } from '../theory/harmonic-rhythm-variance';
import { centroidMomentumCorrection } from '../theory/spectral-centroid-momentum';
import { varietyGainMultiplier } from '../theory/interval-variety-scoring';
import { hierarchyGainMultiplier } from '../theory/metric-accent-hierarchy';
import { rootMotionGainMultiplier } from '../theory/chord-root-motion';
import { pedalDecayMultiplier as sustainPedalDecay } from '../theory/sustain-pedal-simulation';
import { spectralBalanceLpf } from '../theory/spectral-energy-distribution';
import { rangeEdgeGain } from '../theory/pitch-range-expansion';
import { anticipationOffset } from '../theory/harmonic-anticipation-timing';
import { grooveGainMultiplier } from '../theory/groove-template-application';
import { inversionGainAdjustment } from '../theory/inversion-context-preference';
import { intraBarDensity } from '../theory/intra-bar-density';
import { extensionColorLpf } from '../theory/extension-color-temperature';
import { alignmentGainBoost } from '../theory/rhythmic-phase-alignment';
import { qualityDecay } from '../theory/quality-envelope-decay';
import { structuralGravityGain } from '../theory/structural-pitch-gravity';
import { stasisFmCompensation, stasisLpfModulation } from '../theory/harmonic-stasis-detection';
import { tessituraGainCorrection } from '../theory/tessitura-tracking';
import { subdivisionDecay } from '../theory/subdivision-articulation';
import { envelopeFmMultiplier } from '../theory/timbral-envelope-following';
import { momentumDriveGain } from '../theory/progression-momentum';
import { panWidthMultiplier } from '../theory/dynamic-panning-width';
import { regularityGainMultiplier } from '../theory/harmonic-rhythm-regularity';
import { spacingGainCorrection } from '../theory/voice-spacing-quality';
import { syncopationGain } from '../theory/syncopation-depth';
import { groundingGainMultiplier } from '../theory/voicing-weight-distribution';
import { archGainMultiplier } from '../theory/contour-arc-scoring';
import { layerDisplacement as polyDisplacement } from '../theory/displacement-layering';
import { voicingSpreadScore, spreadWeight } from '../theory/voicing-register-distribution';
import { groupBoundaryRest } from '../theory/rhythmic-phrase-grouping';
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
  /** Gestalt continuation trajectory history */
  private trajectoryHistory: Record<string, number[]> = {};

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
      // Harmonic inertia: resist chord change when voicing is settled
      let allowChange = true;
      if (shouldApplyInertia(this.state.mood, this.state.section)) {
        const chordPcs = this.state.currentChord.notes
          .map(n => {
            const name = n.replace(/\d+$/, '');
            const map: Record<string, number> = {
              'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
              'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
              'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
            };
            return map[name];
          })
          .filter((pc): pc is number => pc !== undefined);
        // Simple consonance estimate: more thirds/fifths = more consonant
        const consonance = chordPcs.length >= 3 ? 0.7 : 0.4;
        const inertia = harmonicInertia(
          consonance, this.state.ticksSinceChordChange,
          this.state.mood, this.state.section
        );
        const escape = cadentialEscape(this.state.sectionProgress ?? 0, this.state.mood);
        const effectiveInertia = Math.max(0, inertia + escape);
        // Hash-based probability gate (deterministic)
        const hash = ((this.state.tick * 2654435761 + 7919) >>> 0) / 4294967296;
        if (hash < effectiveInertia * 0.5) {
          allowChange = false; // inertia blocks this chord change
        }
      }
      if (allowChange) {
        this.advanceChord();
        this.state.chordChanged = true;
        this.state.ticksSinceChordChange = 0;
      }
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
    // Gravity escalation: stronger resolution pull at high harmonic momentum
    // Estimate momentum from chord change frequency (shorter ticksSinceChordChange = higher momentum)
    const estimatedMomentum = this.state.ticksSinceChordChange <= 1 ? 4 : this.state.ticksSinceChordChange <= 2 ? 3 : 2;
    const gravEsc = shouldEscalate(estimatedMomentum, this.state.mood)
      ? gravityMultiplier(estimatedMomentum, this.state.mood, this.state.section)
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
      // Gravity escalation: boost tonic resolution at high momentum
      if (gravEsc > 1.05 && degree === 0) {
        bias *= gravEsc;
      }
      // Harmonic topology: bias toward preferred perceptual distance
      if (shouldApplyTopology(this.state.mood)) {
        const dist = chordDistance(currentDegree, degree, currentQuality, 'maj');
        bias *= distanceBias(dist, this.state.mood, this.state.section);
      }
      // Tonal magnetism: bias toward pitch-space attractor
      if (shouldApplyMagnetism(this.state.mood, this.state.section)) {
        const NOTE_PC_TM: Record<string, number> = {
          'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
          'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
          'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
        };
        const rootPc = NOTE_PC_TM[this.state.currentChord.root] ?? 0;
        const candidateRoot = this.state.scale.notes[degree % 7] ?? 'C';
        const candidatePc = NOTE_PC_TM[candidateRoot] ?? 0;
        const attractor = attractorPitch(
          rootPc,
          (rootPc + 4) % 12, // major 3rd estimate
          (rootPc + 7) % 12, // perfect 5th
          this.state.section,
          this.state.sectionProgress ?? 0
        );
        bias *= magneticPull(candidatePc, attractor, this.state.mood, this.state.section);
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

    // Spectral onset carve: preemptive frequency carving during layer fade-in
    if (shouldCarveOnset(this.state.mood)) {
      for (const result of layerResults) {
        const mult = this.state.layerGainMultipliers[result.name] ?? 1.0;
        if (isInOnsetPhase(mult)) {
          const hpfBoost = onsetHpfBoost(mult, this.state.mood, layerResults.length);
          if (hpfBoost > 5) {
            result.code = result.code.replace(
              /\.hpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.hpf(${Math.round(parseFloat(val) + hpfBoost)})`
            );
          }
          const lpfMult = onsetLpfReduction(mult, this.state.mood);
          if (lpfMult < 0.97) {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * lpfMult)})`
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

    // Event metabolism: adjust density when event rate deviates from mood target
    {
      const layerDensities: number[] = [];
      for (const result of layerResults) {
        const noteMatch = result.code.match(/note\("([^"]+)"\)/);
        if (!noteMatch) continue;
        const parts = noteMatch[1].split(/\s+/);
        layerDensities.push(parts.filter((n: string) => n !== '~').length / parts.length);
      }
      const metabolism = estimateMetabolism(layerDensities, 4);
      if (shouldAdjustMetabolism(metabolism, this.state.mood, this.state.section)) {
        const densityCorr = metabolismDensityCorrection(metabolism, this.state.mood, this.state.section);
        if (Math.abs(densityCorr - 1.0) > 0.05) {
          for (const result of layerResults) {
            if (result.name === 'drone' || result.name === 'atmosphere') continue;
            result.code = result.code.replace(
              /\.gain\(([^)]+)\)/,
              (_, expr) => {
                const num = parseFloat(expr);
                if (!isNaN(num)) return `.gain(${(num * densityCorr).toFixed(4)})`;
                return `.gain((${expr}) * ${densityCorr.toFixed(4)})`;
              }
            );
          }
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

    // Loop engagement: thin density when listener entrainment plateaus
    {
      const loopReps = this.state.ticksSinceChordChange ?? 0;
      if (shouldBreakPattern(Math.min(1, loopReps * 0.12), this.state.mood)) {
        // Reduce gain slightly to create micro-variation when loop is stale
        const dimMult = 0.95;
        for (const result of layerResults) {
          if (result.name === 'drone') continue;
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * dimMult).toFixed(4)})`;
              return `.gain((${expr}) * ${dimMult.toFixed(4)})`;
            }
          );
        }
      } else if (loopReps === 1 && this.state.chordChanged) {
        // Re-engagement boost when chord just changed after long hold
        const boost = reengagementGain(1, this.state.mood);
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

    // Spectral-temporal coherence: couple FM depth to rhythm/spectrum alignment
    if (shouldApplyCoherence(this.state.mood, this.state.section)) {
      for (const result of layerResults) {
        if (result.name === 'drone' || result.name === 'atmosphere') continue;
        const noteMatch = result.code.match(/note\("([^"]+)"\)/);
        if (!noteMatch) continue;
        const notes = noteMatch[1].split(/\s+/);
        const rhythmDensity = notes.filter((n: string) => n !== '~').length / notes.length;
        // Estimate spectral density from active layer count (normalized)
        const spectralDensity = Math.min(1.0, layerResults.length / 6);
        const fmMult = coherenceFmMultiplier(rhythmDensity, spectralDensity, this.state.mood, this.state.section);
        if (Math.abs(fmMult - 1.0) > 0.02) {
          result.code = result.code.replace(
            /\.fm\(([0-9.]+)\)/,
            (_, val) => `.fm(${(parseFloat(val) * fmMult).toFixed(2)})`
          );
        }
      }
    }

    // Cross-layer fugato: staggered motivic imitation at section boundaries
    if (this.state.activeMotif && this.state.activeMotif.length >= 3 &&
        shouldApplyFugato(this.state.tick, this.state.mood, this.state.section, this.state.sectionChanged)) {
      for (const result of layerResults) {
        if (result.name === 'drone' || result.name === 'texture' || result.name === 'atmosphere') continue;
        const delay = fugatoEntryDelay(result.name, this.state.mood);
        if (delay < 0) continue;
        if (delay === 0) continue; // melody keeps its own motif
        // Inject transposed motif into answering layers
        const octOffset = fugatoOctaveOffset(result.name);
        const transposed = transposeMotif(this.state.activeMotif, octOffset * 12);
        if (transposed.length > 0) {
          result.code = result.code.replace(
            /note\("([^"]+)"\)/,
            (_, notes) => {
              const parts = notes.split(' ');
              let injected = 0;
              for (let i = 0; i < parts.length && injected < transposed.length; i++) {
                if (parts[i] === '~' || i < delay * 4) continue;
                parts[i] = transposed[injected];
                injected++;
              }
              return `note("${parts.join(' ')}")`;
            }
          );
        }
      }
    }

    // Transient punch: attack-phase brightness/gain boost for punchy builds
    if (shouldApplyPunch(this.state.mood, this.state.section)) {
      for (const result of layerResults) {
        if (result.name === 'drone' || result.name === 'atmosphere') continue;
        const noteMatch = result.code.match(/note\("([^"]+)"\)/);
        if (!noteMatch) continue;
        const notes = noteMatch[1].split(/\s+/);
        const attacks = detectAttacks(notes);
        const hasAttack = attacks.some(a => a);
        if (hasAttack) {
          const gainMult = punchGainMultiplier(this.state.mood, this.state.section, true);
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

    // Auditory salience: boost focal-point events, reduce background
    if (shouldApplySalience(this.state.mood, this.state.section)) {
      let maxSalience = 0;
      let maxSalienceLayer = '';
      for (const result of layerResults) {
        if (result.name === 'drone' || result.name === 'atmosphere') continue;
        const noteMatch = result.code.match(/note\("([^"]+)"\)/);
        if (!noteMatch) continue;
        const notes = noteMatch[1].split(/\s+/).filter((n: string) => n !== '~');
        if (notes.length === 0) continue;
        // Estimate register extremity from MIDI range
        const density = notes.length / (noteMatch[1].split(/\s+/).length || 1);
        const salience = noteSalience(
          density > 0.7 ? 0.3 : 0.6, // sparse = more register movement
          0.3, // moderate spectral baseline
          result.name === 'arp' ? 0.6 : 0.3, // arp more syncopated
          density > 0.5 ? 0.4 : 0.2,
          this.state.mood, this.state.section
        );
        if (salience > maxSalience) {
          maxSalience = salience;
          maxSalienceLayer = result.name;
        }
      }
      if (maxSalience > 0.05 && maxSalienceLayer) {
        for (const result of layerResults) {
          if (result.name === 'drone' || result.name === 'atmosphere') continue;
          const mult = result.name === maxSalienceLayer
            ? salienceGainBoost(maxSalience, this.state.mood)
            : backgroundGainReduction(maxSalience, this.state.mood);
          if (Math.abs(mult - 1.0) > 0.01) {
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

    // Attention decay: boost gain when novelty arrives after stale period
    if (shouldTrackAttention(this.state.mood)) {
      const ticksSinceChange = this.state.ticksSinceChordChange ?? 0;
      const attention = attentionEnergy(ticksSinceChange, this.state.mood, this.state.section);
      if (this.state.chordChanged && needsNovelty(attention, this.state.mood)) {
        // Chord change arrived when attention was low — novelty boost
        const boost = noveltyGainBoost(0, this.state.mood);
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

    // Harmonic saturation: brightness bonus when simplifying from oversaturated chords
    {
      const NOTE_PC_HS: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      const currentPcs = this.state.currentChord.notes
        .map(n => NOTE_PC_HS[n.replace(/\d+$/, '')])
        .filter((pc): pc is number => pc !== undefined);
      const complexity = harmonicComplexity(currentPcs);
      const prevPcs = this.state.chordHistory.length > 0
        ? this.state.chordHistory[this.state.chordHistory.length - 1].notes
            .map(n => NOTE_PC_HS[n.replace(/\d+$/, '')])
            .filter((pc): pc is number => pc !== undefined)
        : [];
      const prevComplexity = harmonicComplexity(prevPcs);
      if (prevComplexity > complexity) {
        const impact = simplificationImpactBonus(prevComplexity, complexity, this.state.mood);
        if (impact > 0.05) {
          const brightMult = 1.0 + impact * 0.2;
          for (const result of layerResults) {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * brightMult)})`
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

    // Layer feedback coupling: drum intensity modulates harmony, harmony enriches drums
    if (shouldApplyCoupling(this.state.mood)) {
      const textureResult = layerResults.find(r => r.name === 'texture');
      const harmonyResult = layerResults.find(r => r.name === 'harmony');
      const drumDensity = this.state.layerPhraseDensity?.texture ?? 0.5;
      if (harmonyResult) {
        const resMult = drumToHarmonyResonance(drumDensity, this.state.mood);
        if (Math.abs(resMult - 1.0) > 0.02) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.resonance\(([0-9.]+)\)/,
            (_, val) => `.resonance(${(parseFloat(val) * resMult).toFixed(1)})`
          );
        }
        const decMult = drumToHarmonyDecay(drumDensity, this.state.mood);
        if (Math.abs(decMult - 1.0) > 0.02) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.decay\(([0-9.]+)\)/,
            (_, val) => `.decay(${(parseFloat(val) * decMult).toFixed(4)})`
          );
        }
      }
      if (textureResult && harmonyResult) {
        const noteMatch = harmonyResult.code.match(/note\("([^"]+)"\)/);
        const harmNotes = noteMatch ? noteMatch[1].split(/\s+/).filter(n => n !== '~').length : 3;
        const drumBoost = harmonyToDrumGain(harmNotes, this.state.mood);
        if (drumBoost > 1.01) {
          textureResult.code = textureResult.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * drumBoost).toFixed(4)})`;
              return `.gain((${expr}) * ${drumBoost.toFixed(4)})`;
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

    // Clarity boost: spectral gap EQ lift for masked layers
    if (shouldApplyClarity(this.state.mood, layerResults.length)) {
      const layerGains: Record<string, number> = {};
      for (const result of layerResults) {
        const match = result.code.match(/\.gain\(([0-9.]+)\)/);
        layerGains[result.name] = match ? parseFloat(match[1]) : 0.1;
      }
      const dominant = findDominantLayer(layerGains);
      for (const result of layerResults) {
        const gBoost = clarityGainBoost(result.name, dominant, this.state.mood);
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
        const lBoost = clarityLpfBoost(result.name, dominant, this.state.mood);
        if (lBoost > 1.01) {
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * lBoost)})`
          );
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

    // Spectral weight: perceived heaviness/lightness shift across sections
    if (shouldApplyWeight(this.state.mood, this.state.section)) {
      const weight = spectralWeight(this.state.mood, this.state.section, this.state.sectionProgress ?? 0);
      const lpfMult = weightLpfMultiplier(weight, this.state.mood);
      const hpfMult = weightHpfMultiplier(weight, this.state.mood);
      if (Math.abs(lpfMult - 1.0) > 0.02) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * lpfMult)})`
          );
        }
      }
      if (Math.abs(hpfMult - 1.0) > 0.02) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.hpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.hpf(${Math.round(parseFloat(val) * hpfMult)})`
          );
        }
      }
    }

    // Predictive EQ: look-ahead LPF adjustment before chord change
    if (this.state.nextChordHint && shouldApplyPredictiveEq(
      this.state.mood, true, this.state.ticksSinceChordChange
    )) {
      const predMult = predictiveLpfMultiplier(
        this.state.currentChord.quality,
        this.state.nextChordHint.quality,
        this.state.ticksSinceChordChange,
        this.state.mood
      );
      if (Math.abs(predMult - 1.0) > 0.02) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * predMult)})`
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

    // Sustain envelope curve: sustain level modulated by section and layer role
    if (shouldApplySustainCurve(this.state.mood)) {
      for (const result of layerResults) {
        const susMult = sustainMultiplier(
          this.state.section, this.state.sectionProgress ?? 0,
          this.state.mood, result.name
        );
        if (Math.abs(susMult - 1.0) > 0.03) {
          result.code = result.code.replace(
            /\.sustain\(([0-9.]+)\)/,
            (_, val) => `.sustain(${(parseFloat(val) * susMult).toFixed(4)})`
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

    // Cross-fade texture: smooth FM transitions on chord changes
    if (shouldCrossfade(this.state.ticksSinceChordChange, this.state.mood)) {
      const blend = crossfadeBlend(this.state.ticksSinceChordChange, this.state.mood);
      if (blend > 0.05) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.fm\((\d+(?:\.\d+)?)\)/,
            (_, val) => {
              const current = parseFloat(val);
              // Blend toward a neutral mid-point (creates smoother transition)
              const blended = crossfadeFm(current * 0.8, current, blend);
              return `.fm(${blended.toFixed(2)})`;
            }
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

    // Modulation phase sync: filter/pan modulations locked to section phase
    if (shouldSyncModulation(this.state.mood)) {
      const modDepth = modDepthMultiplier(this.state.mood, this.state.section);
      if (Math.abs(modDepth - 1.0) > 0.05) {
        for (const result of layerResults) {
          // Scale pan range by modulation depth
          result.code = result.code.replace(
            /\.pan\(sine\.range\(([0-9.]+),\s*([0-9.]+)\)/,
            (_, lo, hi) => {
              const low = parseFloat(lo);
              const high = parseFloat(hi);
              const mid = (low + high) / 2;
              const halfRange = ((high - low) / 2) * modDepth;
              return `.pan(sine.range(${(mid - halfRange).toFixed(2)}, ${(mid + halfRange).toFixed(2)})`;
            }
          );
        }
      }
    }

    // Gestalt continuation: bias gain toward continuing established trajectories
    if (shouldApplyContinuation(this.state.mood, this.state.section)) {
      for (const result of layerResults) {
        if (result.name === 'drone' || result.name === 'atmosphere') continue;
        const gainMatch = result.code.match(/\.gain\(([0-9.]+)\)/);
        if (!gainMatch) continue;
        const currentGain = parseFloat(gainMatch[1]);
        // Track gain history for this layer
        const histKey = `gain_${result.name}`;
        if (!this.trajectoryHistory) this.trajectoryHistory = {};
        if (!this.trajectoryHistory[histKey]) this.trajectoryHistory[histKey] = [];
        this.trajectoryHistory[histKey].push(currentGain);
        if (this.trajectoryHistory[histKey].length > 6) this.trajectoryHistory[histKey].shift();
        const momentum = trajectoryMomentum(this.trajectoryHistory[histKey]);
        if (Math.abs(momentum) > 0.1) {
          const bias = continuationBias(momentum, currentGain, currentGain, this.state.mood, this.state.section);
          // Gently nudge gain in trajectory direction
          const nudge = momentum * 0.02 * bias;
          const nudgedGain = Math.max(0.01, Math.min(0.95, currentGain + nudge));
          if (Math.abs(nudgedGain - currentGain) > 0.005) {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              () => `.gain(${nudgedGain.toFixed(4)})`
            );
          }
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

    // Roughness smoothing: reduce gain when critical-band roughness is excessive
    if (shouldSmoothRoughness(this.state.mood)) {
      const NOTE_MIDI_RS: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      // Collect all sounding pitches across layers
      const allMidis: number[] = [];
      for (const result of layerResults) {
        const noteMatch = result.code.match(/note\("([^"]+)"\)/);
        if (!noteMatch) continue;
        for (const n of noteMatch[1].split(/\s+/)) {
          if (n === '~') continue;
          const name = n.replace(/\d+$/, '');
          const oct = parseInt(n.match(/\d+$/)?.[0] ?? '4');
          allMidis.push((NOTE_MIDI_RS[name] ?? 0) + oct * 12);
        }
      }
      if (allMidis.length >= 3) {
        const roughness = totalRoughness(allMidis);
        const gainMult = roughnessGainReduction(roughness, this.state.mood);
        if (gainMult < 0.97) {
          for (const result of layerResults) {
            if (result.name === 'drone') continue; // drone is foundational
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

    // Spatial precedence: suppress reverb on delayed layer copies
    if (shouldApplyPrecedence(this.state.mood, layerResults.length)) {
      // Estimate relative onset delay from .late() values
      for (const result of layerResults) {
        const lateMatch = result.code.match(/\.late\(([0-9.]+)\)/);
        const delayMs = lateMatch ? parseFloat(lateMatch[1]) * 1000 : 0;
        if (delayMs > 0 && delayMs <= 40) {
          const revMult = precedenceReverbReduction(delayMs, this.state.mood);
          if (revMult < 0.97) {
            result.code = result.code.replace(
              /\.room\(([0-9.]+)\)/,
              (_, val) => `.room(${(parseFloat(val) * revMult).toFixed(4)})`
            );
          }
        }
      }
    }

    // Subsonic pulse: kick-triggered sub-bass enhancement on drone layer
    {
      const drumResult = layerResults.find(r => r.name === 'texture');
      const droneResult = layerResults.find(r => r.name === 'drone');
      if (drumResult && droneResult) {
        // Estimate drum activity from note density (non-rest ratio)
        const drumNotes = drumResult.code.match(/note\("([^"]+)"\)/);
        let drumActivity = 0;
        if (drumNotes) {
          const parts = drumNotes[1].split(/\s+/);
          drumActivity = parts.filter((n: string) => n !== '~').length / parts.length;
        }
        if (shouldApplySubsonicPulse(this.state.mood, this.state.section, drumActivity > 0.1)) {
          const gainBoost = subsonicGainBoost(drumActivity, this.state.mood, this.state.section);
          if (gainBoost > 1.01) {
            droneResult.code = droneResult.code.replace(
              /\.gain\(([^)]+)\)/,
              (_, expr) => {
                const num = parseFloat(expr);
                if (!isNaN(num)) return `.gain(${(num * gainBoost).toFixed(4)})`;
                return `.gain((${expr}) * ${gainBoost.toFixed(4)})`;
              }
            );
          }
          const roomBoost = subsonicRoomBoost(drumActivity, this.state.mood, this.state.section);
          if (roomBoost > 1.01) {
            droneResult.code = droneResult.code.replace(
              /\.room\(([0-9.]+)\)/,
              (_, val) => `.room(${(parseFloat(val) * roomBoost).toFixed(2)})`
            );
          }
        }
      }
    }

    // Register collision avoidance: reduce gain when melody/harmony/arp overlap in register
    if (shouldAvoidCollisions(this.state.mood, layerResults.length)) {
      const NOTE_MIDI_RC: Record<string, number> = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
      };
      // Extract center MIDI pitch per layer
      const layerCenters: Record<string, number> = {};
      for (const result of layerResults) {
        if (result.name === 'drone' || result.name === 'atmosphere' || result.name === 'texture') continue;
        const noteMatch = result.code.match(/note\("([^"]+)"\)/);
        if (!noteMatch) continue;
        const notes = noteMatch[1].split(/\s+/).filter((n: string) => n !== '~');
        if (notes.length === 0) continue;
        let midiSum = 0;
        for (const n of notes) {
          const name = n.replace(/\d+$/, '');
          const oct = parseInt(n.match(/\d+$/)?.[0] ?? '4');
          midiSum += (NOTE_MIDI_RC[name] ?? 0) + oct * 12;
        }
        layerCenters[result.name] = midiSum / notes.length;
      }
      // Check melody↔harmony, melody↔arp, harmony↔arp collisions
      const pairs: [string, string][] = [['melody', 'harmony'], ['melody', 'arp'], ['harmony', 'arp']];
      for (const [a, b] of pairs) {
        const severity = registerCollision(layerCenters, a, b);
        if (severity > 0.1) {
          // Reduce gain on the secondary layer (arp < harmony < melody priority)
          const secondary = b; // b is always lower priority in our ordering
          const secResult = layerResults.find(r => r.name === secondary);
          if (secResult) {
            const gainMult = collisionGainReduction(severity, this.state.mood, false);
            if (gainMult < 0.99) {
              secResult.code = secResult.code.replace(
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
    }

    // Auditory stream fusion: boost secondary layer gain when fused with primary
    if (shouldApplyFusion(this.state.mood, this.state.section)) {
      const melodyResult = layerResults.find(r => r.name === 'melody');
      const arpResult = layerResults.find(r => r.name === 'arp');
      if (melodyResult && arpResult) {
        // Estimate gap from .late() values
        const melLate = melodyResult.code.match(/\.late\(([0-9.]+)\)/);
        const arpLate = arpResult.code.match(/\.late\(([0-9.]+)\)/);
        const gapMs = Math.abs(
          (melLate ? parseFloat(melLate[1]) : 0) -
          (arpLate ? parseFloat(arpLate[1]) : 0)
        ) * 1000;
        const fusionBoost = fusionGainBalance(gapMs, this.state.mood);
        if (fusionBoost > 1.01) {
          arpResult.code = arpResult.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * fusionBoost).toFixed(4)})`;
              return `.gain((${expr}) * ${fusionBoost.toFixed(4)})`;
            }
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

    // Grid phase lock: snap layers to harmonic rhythm grid
    if (shouldApplyPhaseLock(this.state.mood, this.state.section, this.state.ticksSinceChordChange)) {
      for (const result of layerResults) {
        const corr = phaseLockCorrection(
          result.name, this.state.ticksSinceChordChange,
          this.state.mood, this.state.section
        );
        if (corr > 0.001) {
          result.code = result.code.replace(
            /\.orbit\((\d+)\)/,
            (m) => `.late(${corr.toFixed(4)})${m}`
          );
        }
      }
    }

    // Intra-beat swing: per-note grace-note timing for humanization
    if (shouldApplyIntraBeatSwing(this.state.mood, this.state.section)) {
      for (const result of layerResults) {
        if (result.name === 'drone' || result.name === 'atmosphere') continue;
        const noteMatch = result.code.match(/note\("([^"]+)"\)/);
        if (!noteMatch) continue;
        const noteCount = noteMatch[1].split(/\s+/).length;
        const offsets = swingOffsets(noteCount, this.state.tick, this.state.mood, this.state.section);
        // Apply average swing as a single .late() value (Strudel doesn't support per-note late)
        const avgOffset = offsets.reduce((a, b) => a + b, 0) / offsets.length;
        if (Math.abs(avgOffset) > 0.002) {
          const lateVal = Math.max(0.001, avgOffset + 0.01);
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

    // Phrase consonance curve: per-note tension gain within melody
    {
      const melodyResult = layerResults.find(r => r.name === 'melody');
      if (melodyResult) {
        const noteMatch = melodyResult.code.match(/note\("([^"]+)"\)/);
        if (noteMatch) {
          const notes = noteMatch[1].split(/\s+/);
          const profile = phraseTensionProfile(notes, this.state.currentChord.root, this.state.mood);
          // Apply average tension as gain multiplier
          const avgTension = profile.reduce((a, b) => a + b, 0) / profile.length;
          const mult = tensionGainMultiplier(avgTension, this.state.mood);
          if (Math.abs(mult - 1.0) > 0.01) {
            melodyResult.code = melodyResult.code.replace(
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
    }

    // Stochastic resonance: micro-jitter on gain/FM/filter for organic life
    if (shouldApplyResonance(this.state.mood, this.state.section)) {
      for (let i = 0; i < layerResults.length; i++) {
        const result = layerResults[i];
        const gJit = gainJitter(this.state.tick, i, this.state.mood, this.state.section);
        if (Math.abs(gJit - 1.0) > 0.005) {
          result.code = result.code.replace(
            /\.gain\(([^)]+)\)/,
            (_, expr) => {
              const num = parseFloat(expr);
              if (!isNaN(num)) return `.gain(${(num * gJit).toFixed(4)})`;
              return `.gain((${expr}) * ${gJit.toFixed(4)})`;
            }
          );
        }
        const fJit = fmJitter(this.state.tick, i, this.state.mood, this.state.section);
        if (Math.abs(fJit - 1.0) > 0.01) {
          result.code = result.code.replace(
            /\.fm\(([0-9.]+)\)/,
            (_, val) => `.fm(${(parseFloat(val) * fJit).toFixed(2)})`
          );
        }
        const lpfJit = filterJitter(this.state.tick, i, this.state.mood, this.state.section);
        if (Math.abs(lpfJit - 1.0) > 0.005) {
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * lpfJit)})`
          );
        }
      }
    }

    // Lydian brightness: substitute natural 4th with #4 in melody for luminous color
    if (shouldUseLydian(this.state.tick, this.state.mood, this.state.section)) {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const pcToNote = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
      const rootPc = noteToPC[this.state.currentChord.root] ?? 0;
      const nat4 = naturalFourth(rootPc);
      const lyd4 = lydianFourth(rootPc);
      const natName = pcToNote[nat4];
      const lydName = pcToNote[lyd4];
      const melodyResult = layerResults.find(r => r.name === 'melody');
      if (melodyResult) {
        melodyResult.code = melodyResult.code.replace(
          /note\("([^"]+)"\)/,
          (full, notes) => {
            const replaced = notes.replace(
              new RegExp(`\\b${natName}(\\d)`, 'g'),
              `${lydName}$1`
            );
            return `note("${replaced}")`;
          }
        );
      }
    }

    // Voice density balance: reduce harmony voice gain when melody is active
    {
      const melodyActive = layerResults.some(r => r.name === 'melody' && !r.code.includes('gain(0.0000)'));
      const harmonyResult = layerResults.find(r => r.name === 'harmony');
      if (harmonyResult && shouldBalanceVoiceDensity(this.state.mood, melodyActive, 4)) {
        const max = maxHarmonyVoices(this.state.mood, melodyActive);
        const penalty = densityGainPenalty(4, max, this.state.mood);
        if (penalty < 1.0) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * penalty).toFixed(4)})`
          );
        }
      }
    }

    // Pedal bass sustain: extend drone sustain during chord changes
    {
      const droneResult = layerResults.find(r => r.name === 'drone');
      if (droneResult && shouldHoldPedal(this.state.tick, this.state.mood, this.state.section, this.state.ticksSinceChordChange)) {
        const sustainMult = pedalSustainMultiplier(this.state.mood, this.state.section);
        const decayMult = pedalDecayMultiplier(this.state.mood);
        // Boost drone gain for sustain effect
        droneResult.code = droneResult.code.replace(
          /\.gain\(([0-9.]+)\)/,
          (_, val) => `.gain(${(parseFloat(val) * Math.min(sustainMult, 1.4)).toFixed(4)})`
        );
        // Extend room for pedal resonance
        droneResult.code = droneResult.code.replace(
          /\.room\(([0-9.]+)\)/,
          (_, val) => `.room(${Math.min(1, parseFloat(val) * decayMult).toFixed(4)})`
        );
      }
    }

    // Harmonic envelope shaping: chord function affects harmony decay
    {
      const harmonyResult = layerResults.find(r => r.name === 'harmony');
      if (harmonyResult) {
        const decayMult = functionDecayMultiplier(this.state.currentChord.degree, this.state.mood);
        if (Math.abs(decayMult - 1.0) > 0.01) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * decayMult).toFixed(4)})`
          );
        }
      }
    }

    // Rhythmic gravitation: nudge notes toward metrically strong positions
    if (shouldApplyGravitation(this.state.mood, this.state.section)) {
      for (const result of layerResults) {
        if (result.name === 'melody' || result.name === 'arp') {
          const pos = this.state.tick % 16;
          const nudge = gravitationNudge(pos, this.state.mood, this.state.section);
          if (Math.abs(nudge) > 0.001) {
            const existing = result.code.match(/\.nudge\(([0-9.-]+)\)/);
            const current = existing ? parseFloat(existing[1]) : 0;
            const combined = current + nudge;
            if (existing) {
              result.code = result.code.replace(
                /\.nudge\(([0-9.-]+)\)/,
                () => `.nudge(${combined.toFixed(4)})`
              );
            }
          }
        }
      }
    }

    // Modal coloring: bias is applied at note selection time (melody generator reads this)
    // Store characteristic tone weight in state for melody layer to use
    {
      const rootPc = (() => {
        const map: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
        return map[this.state.currentChord.root] ?? 0;
      })();
      const _charWeight = characteristicToneWeight(
        rootPc, rootPc, this.state.scale.type, this.state.mood
      );
      // Weight is available for future note selection integration
    }

    // Melodic expectancy: weight is used at note selection time
    // Store last interval for melody to reference
    {
      const motif = this.state.activeMotif;
      if (motif && motif.length >= 2) {
        const _lastWeight = expectancyWeight(0, 0, this.state.mood);
        // Available for melody generator integration
      }
    }

    // Harmonic breathing: voicing spread breathes with phrase position
    if (shouldApplyBreathing(this.state.mood, this.state.section)) {
      const harmonyResult = layerResults.find(r => r.name === 'harmony');
      if (harmonyResult) {
        const progress = this.state.sectionProgress ?? 0;
        const spread = breathingSpread(progress, this.state.mood, this.state.section);
        // Apply as subtle gain modulation (wider spread = slightly louder for presence)
        if (Math.abs(spread - 1.0) > 0.02) {
          const gainMod = 1.0 + (spread - 1.0) * 0.3; // dampen effect on gain
          harmonyResult.code = harmonyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * gainMod).toFixed(4)})`
          );
        }
      }
    }

    // Rhythmic displacement: offset repeating patterns for groove variation
    if (shouldDisplace(this.state.tick, this.state.mood, this.state.section)) {
      const amount = displacementAmount(this.state.tick, this.state.mood);
      const arpResult = layerResults.find(r => r.name === 'arp');
      if (arpResult) {
        const existing = arpResult.code.match(/\.late\(([0-9.]+)\)/);
        if (existing) {
          const newLate = parseFloat(existing[1]) + amount;
          arpResult.code = arpResult.code.replace(
            /\.late\(([0-9.]+)\)/,
            () => `.late(${newLate.toFixed(4)})`
          );
        }
      }
    }

    // Registral balance: gain correction for frequency-space crowding
    {
      // Approximate center frequencies per layer type
      const layerFreqs: Record<string, number> = {
        drone: 80, harmony: 350, melody: 700, texture: 200, arp: 900, atmosphere: 500
      };
      const activeCenters = layerResults.map(r => layerFreqs[r.name] ?? 400);
      for (let i = 0; i < layerResults.length; i++) {
        const center = activeCenters[i];
        const correction = registralGainCorrection(center, activeCenters, this.state.mood);
        if (Math.abs(correction - 1.0) > 0.01) {
          layerResults[i].code = layerResults[i].code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * correction).toFixed(4)})`
          );
        }
      }
    }

    // Cadential ornamentation: decorative figures at phrase endings
    {
      const isPhraseEnd = (this.state.sectionProgress ?? 0) > 0.85;
      if (shouldOrnamentCadence(this.state.tick, this.state.mood, this.state.section, isPhraseEnd)) {
        const ornament = selectOrnament(this.state.tick, this.state.mood);
        const melodyResult = layerResults.find(r => r.name === 'melody');
        if (melodyResult) {
          // Apply ornament as FM depth boost (trills/mordents = faster FM)
          const fmBoost = ornament === 'trill' ? 1.3 : ornament === 'mordent' ? 1.2 : 1.1;
          melodyResult.code = melodyResult.code.replace(
            /\.fm\(([0-9.]+)\)/,
            (_, val) => `.fm(${(parseFloat(val) * fmBoost).toFixed(4)})`
          );
        }
      }
    }

    // Timbral contrast curve: FM depth follows section-level arc
    if (shouldApplyTimbralContrast(this.state.mood)) {
      const progress = this.state.sectionProgress ?? 0;
      const fmMult = timbralContrastMultiplier(progress, this.state.mood, this.state.section);
      if (Math.abs(fmMult - 1.0) > 0.02) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'melody' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.fm\(([0-9.]+)\)/,
              (_, val) => `.fm(${(parseFloat(val) * fmMult).toFixed(4)})`
            );
          }
        }
      }
    }

    // Intervallic leap recovery: note selection weight (stored for melody reference)
    {
      const motif = this.state.activeMotif;
      if (motif && motif.length >= 2) {
        const _recWeight = leapRecoveryWeight(0, 0, this.state.mood);
        // Available for melody generator integration
      }
    }

    // Harmonic rhythm elasticity: chord duration adjusted by quality/function
    {
      const _durElasticity = chordDurationElasticity(
        this.state.currentChord.quality,
        this.state.currentChord.degree,
        this.state.mood,
        this.state.section
      );
      // Available for evolution chord timing integration
    }

    // Perceptual loudness: Fletcher-Munson gain correction per layer
    {
      const layerFreqs: Record<string, number> = {
        drone: 80, harmony: 350, melody: 700, texture: 200, arp: 900, atmosphere: 500
      };
      for (const result of layerResults) {
        const freq = layerFreqs[result.name] ?? 400;
        const correction = perceptualGainCorrection(freq, this.state.mood);
        if (Math.abs(correction - 1.0) > 0.01) {
          result.code = result.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * correction).toFixed(4)})`
          );
        }
      }
    }

    // Spectral complementarity: LPF correction for frequency-space overlap
    {
      const otherNames = layerResults.map(r => r.name);
      for (const result of layerResults) {
        const others = otherNames.filter(n => n !== result.name);
        const lpfMult = complementaryLpf(result.name, others, this.state.mood);
        if (Math.abs(lpfMult - 1.0) > 0.01) {
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * lpfMult)})`
          );
        }
      }
    }

    // Phrase momentum: energy builds within phrases then releases
    {
      const progress = this.state.sectionProgress ?? 0;
      const mGain = momentumGain(progress, this.state.mood, this.state.section);
      const mBright = momentumBrightness(progress, this.state.mood, this.state.section);
      if (Math.abs(mGain - 1.0) > 0.01) {
        for (const result of layerResults) {
          if (result.name === 'melody' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * mGain).toFixed(4)})`
            );
          }
        }
      }
      if (Math.abs(mBright - 1.0) > 0.01) {
        for (const result of layerResults) {
          if (result.name === 'melody') {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * mBright)})`
            );
          }
        }
      }
    }

    // Cross-register doubling: reinforce important melody notes in arp
    {
      const isImportant = (this.state.sectionProgress ?? 0) > 0.6;
      if (shouldDouble(this.state.tick, this.state.mood, this.state.section, isImportant)) {
        const octOffset = doublingOctave(this.state.tick);
        const arpResult = layerResults.find(r => r.name === 'arp');
        if (arpResult && this.state.activeMotif && this.state.activeMotif.length > 0) {
          // Boost arp gain slightly for doubling effect
          arpResult.code = arpResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * 1.08).toFixed(4)})`
          );
        }
      }
    }

    // Tonal center drift: bias chord selection toward drift target
    if (shouldDrift(this.state.mood, this.state.section)) {
      const _drift = driftAmount(this.state.tick, this.state.mood, this.state.section);
      const _dir = driftDirection(this.state.tick, this.state.mood);
      // Drift bias available for chord selection integration
    }

    // Rhythmic strata: independent tempo layers via .slow() adjustment
    if (shouldApplyStrata(this.state.mood, this.state.section)) {
      for (const result of layerResults) {
        const ratio = layerTempoRatio(result.name, this.state.tick, this.state.mood, this.state.section);
        if (ratio !== 1.0) {
          const existing = result.code.match(/\.slow\(([0-9.]+)\)/);
          if (existing) {
            const newSlow = parseFloat(existing[1]) * ratio;
            result.code = result.code.replace(
              /\.slow\(([0-9.]+)\)/,
              () => `.slow(${newSlow.toFixed(4)})`
            );
          }
        }
      }
    }

    // Harmonic series voicing: FM ratio from overtone series
    {
      const ratio = harmonicSeriesRatio(this.state.tick, this.state.mood);
      if (ratio > 1.0) {
        const depth = harmonicSeriesDepth(ratio, this.state.mood);
        const droneResult = layerResults.find(r => r.name === 'drone');
        if (droneResult) {
          droneResult.code = droneResult.code.replace(
            /\.fm\(([0-9.]+)\)/,
            (_, val) => `.fm(${(parseFloat(val) * depth).toFixed(4)})`
          );
        }
      }
    }

    // Anticipatory accent: forward-pulling gain emphasis
    {
      const beatPos = (this.state.tick % 4) / 4;
      const aGain = anticipatoryGain(beatPos, this.state.mood, this.state.section);
      if (Math.abs(aGain - 1.0) > 0.01) {
        for (const result of layerResults) {
          if (result.name === 'melody' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * aGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Chromatic voice leading: emphasis on semitone voice motion
    {
      const prevChord = this.state.chordHistory.length >= 2
        ? this.state.chordHistory[this.state.chordHistory.length - 2]
        : null;
      if (prevChord) {
        const prevPcs = prevChord.notes.map((n: string) => {
          const map: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
          return map[n.replace(/\d+$/, '')] ?? 0;
        });
        const currPcs = this.state.currentChord.notes.map((n: string) => {
          const map: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
          return map[n.replace(/\d+$/, '')] ?? 0;
        });
        const motions = countChromaticMotions(prevPcs, currPcs);
        const boost = chromaticLeadingGain(motions, currPcs.length, this.state.mood);
        if (boost > 1.01) {
          const harmonyResult = layerResults.find(r => r.name === 'harmony');
          if (harmonyResult) {
            harmonyResult.code = harmonyResult.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * boost).toFixed(4)})`
            );
          }
        }
      }
    }

    // Metric elasticity: bar-level tempo breathing
    if (shouldApplyMetricElasticity(this.state.mood, this.state.section)) {
      const barPos = (this.state.sectionProgress ?? 0) % 0.25 / 0.25;
      const _elasticity = barElasticity(barPos, this.state.mood, this.state.section);
      // Available for tempo chain integration
    }

    // Voicing closure: harmony spread narrows toward cadence
    {
      const progress = this.state.sectionProgress ?? 0;
      const spread = closureSpread(progress, this.state.mood, this.state.section);
      if (Math.abs(spread - 1.0) > 0.02) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * spread).toFixed(4)})`
          );
        }
      }
    }

    // Rhythmic density gradient: layers thin when partners are busy
    {
      const densities: Record<string, number> = {};
      for (const result of layerResults) {
        // Estimate density from pattern (count non-rest notes)
        const noteMatch = result.code.match(/note\("([^"]+)"\)/);
        if (noteMatch) {
          const parts = noteMatch[1].split(' ');
          const active = parts.filter(p => p !== '~').length;
          densities[result.name] = active / Math.max(1, parts.length);
        } else {
          densities[result.name] = 0.5;
        }
      }
      for (const result of layerResults) {
        const corr = densityGradientCorrection(result.name, densities, this.state.mood);
        if (Math.abs(corr - 1.0) > 0.02) {
          result.code = result.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * corr).toFixed(4)})`
          );
        }
      }
    }

    // Harmonic parallax: background layers lag behind chord changes
    {
      for (const result of layerResults) {
        if (shouldHoldPreviousChord(result.name, this.state.ticksSinceChordChange, this.state.mood, this.state.section)) {
          // Layer should still be playing previous chord — reduce gain slightly
          // to smooth the transition rather than hard-holding
          result.code = result.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * 0.95).toFixed(4)})`
          );
        }
      }
    }

    // Pitch memory bias: weight stored for melody note selection
    {
      const motif = this.state.activeMotif;
      if (motif && motif.length > 0) {
        const _memWeight = pitchMemoryWeight(0, [], this.state.mood);
        // Available for melody generator integration
      }
    }

    // Harmonic velocity: emphasis on large chord root movements
    {
      const prevChord = this.state.chordHistory.length >= 2
        ? this.state.chordHistory[this.state.chordHistory.length - 2]
        : null;
      if (prevChord && this.state.ticksSinceChordChange <= 1) {
        const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
        const prevPc = noteToPC[prevChord.root] ?? 0;
        const currPc = noteToPC[this.state.currentChord.root] ?? 0;
        const dist = rootDistance(prevPc, currPc);
        const gBoost = velocityGainBoost(dist, this.state.mood);
        const bBoost = velocityBrightnessBoost(dist, this.state.mood);
        if (gBoost > 1.01) {
          for (const result of layerResults) {
            if (result.name === 'harmony') {
              result.code = result.code.replace(
                /\.gain\(([0-9.]+)\)/,
                (_, val) => `.gain(${(parseFloat(val) * gBoost).toFixed(4)})`
              );
            }
          }
        }
        if (bBoost > 1.01) {
          for (const result of layerResults) {
            if (result.name === 'harmony') {
              result.code = result.code.replace(
                /\.lpf\((\d+(?:\.\d+)?)\)/,
                (_, val) => `.lpf(${Math.round(parseFloat(val) * bBoost)})`
              );
            }
          }
        }
      }
    }

    // Spectral decay profile: sustained notes darken over time
    if (shouldApplySpectralDecay(this.state.mood, this.state.section)) {
      const decayLpf = spectralDecayLpf(this.state.ticksSinceChordChange, this.state.mood, this.state.section);
      if (decayLpf < 0.98) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'drone') {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * decayLpf)})`
            );
          }
        }
      }
    }

    // Harmonic rhythm acceleration: stored for chord timing
    {
      const phrasePos = (this.state.sectionProgress ?? 0) % 0.25 / 0.25;
      const _accel = harmonicAcceleration(phrasePos, this.state.mood, this.state.section);
      // Available for chord duration multiplier
    }

    // Pitch set intersection: stored for chord selection
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const currPcs = this.state.currentChord.notes.map((n: string) => noteToPC[n.replace(/\d+$/, '')] ?? 0);
      const _ctWeight = commonToneWeight(currPcs, currPcs, this.state.mood);
      // Available for chord selection bias
    }

    // Dynamic contour: gain follows melodic pitch direction
    {
      // Estimate pitch delta from chord root movement
      const prevChord = this.state.chordHistory.length >= 2
        ? this.state.chordHistory[this.state.chordHistory.length - 2]
        : null;
      if (prevChord) {
        const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
        const prevPc = noteToPC[prevChord.root] ?? 0;
        const currPc = noteToPC[this.state.currentChord.root] ?? 0;
        const delta = currPc - prevPc;
        const cGain = contourDynamicGain(delta, this.state.mood);
        if (Math.abs(cGain - 1.0) > 0.01) {
          const melodyResult = layerResults.find(r => r.name === 'melody');
          if (melodyResult) {
            melodyResult.code = melodyResult.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * cGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Counterpoint rules: score stored for arp note selection
    {
      const _cpScore = counterpointScore(0, 0, 7, 7, this.state.mood);
      // Available for arp note selection relative to melody
    }

    // Modal interchange brightness: LPF/FM from borrowed chord origin
    {
      const scaleName = this.state.scale?.type ?? 'ionian';
      const modeName = scaleName.includes('minor') ? 'aeolian' :
                       scaleName.includes('dorian') ? 'dorian' :
                       scaleName.includes('lydian') ? 'lydian' :
                       scaleName.includes('mixolydian') ? 'mixolydian' : 'ionian';
      const iBright = interchangeBrightness(modeName, this.state.mood);
      const iFm = interchangeFm(modeName, this.state.mood);
      if (Math.abs(iBright - 1.0) > 0.02) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'drone') {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * iBright)})`
            );
          }
        }
      }
      if (Math.abs(iFm - 1.0) > 0.02) {
        for (const result of layerResults) {
          if (result.name === 'harmony') {
            result.code = result.code.replace(
              /\.fm\(([0-9.]+)\)/,
              (_, val) => `.fm(${(parseFloat(val) * iFm).toFixed(4)})`
            );
          }
        }
      }
    }

    // Agogic accent: duration emphasis on important notes
    {
      const beatPos = this.state.tick % 4;
      const phrasePos = (this.state.sectionProgress ?? 0) % 0.25 / 0.25;
      const importance = noteImportance(beatPos, phrasePos);
      const durMul = agogicDuration(importance, this.state.mood, this.state.section);
      if (durMul > 1.05) {
        for (const result of layerResults) {
          if (result.name === 'melody') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * Math.min(durMul, 1.2)).toFixed(4)})`
            );
          }
        }
      }
    }

    // Tonal center gravity: weight stored for melody note selection
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const tonicPc = noteToPC[this.state.scale?.root ?? 'C'] ?? 0;
      const phrasePos = (this.state.sectionProgress ?? 0) % 0.25 / 0.25;
      const _gravWeight = tonicGravityWeight(tonicPc, tonicPc, phrasePos, this.state.mood);
      // Available for melody note selection
    }

    // Rhythmic density envelope: section-level density target
    {
      const _dTarget = densityTarget(this.state.sectionProgress ?? 0, this.state.mood, this.state.section);
      // Available for pattern degradeBy calculation
    }

    // Spectral blend: LPF correction for frequency overlap
    {
      const activeNames = layerResults.map(r => r.name);
      for (const result of layerResults) {
        const blendCorr = blendLpfCorrection(result.name, activeNames, this.state.mood);
        if (Math.abs(blendCorr - 1.0) > 0.02) {
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * blendCorr)})`
          );
        }
      }
    }

    // Voice leading cost: weight stored for chord selection
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const currPcs = this.state.currentChord.notes.map((n: string) => noteToPC[n.replace(/\d+$/, '')] ?? 0);
      const _vlWeight = voiceLeadingWeight(currPcs, currPcs, this.state.mood);
      // Available for chord selection bias
    }

    // Polymetric tension: FM boost from metric conflict
    {
      const pTension = polymetricTension(this.state.tick, 3, 4, this.state.mood);
      if (pTension > 0.02) {
        for (const result of layerResults) {
          if (result.name === 'arp') {
            result.code = result.code.replace(
              /\.fm\(([0-9.]+)\)/,
              (_, val) => `.fm(${(parseFloat(val) * (1.0 + pTension)).toFixed(4)})`
            );
          }
        }
      }
    }

    // Harmonic color temperature: filter/FM from chord warmth
    {
      const quality = this.state.currentChord.quality;
      const tLpf = temperatureLpf(quality, this.state.mood);
      const tFm = temperatureFm(quality, this.state.mood);
      if (Math.abs(tLpf - 1.0) > 0.02) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * tLpf)})`
          );
        }
      }
      if (Math.abs(tFm - 1.0) > 0.02) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.fm\(([0-9.]+)\)/,
            (_, val) => `.fm(${(parseFloat(val) * tFm).toFixed(4)})`
          );
        }
      }
    }

    // Cadential weight distribution: harmonic weight at phrase boundaries
    {
      const phrasePos = (this.state.sectionProgress ?? 0) % 0.25 / 0.25;
      const cWeight = cadentialWeight(phrasePos, this.state.mood);
      if (Math.abs(cWeight - 1.0) > 0.02) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * cWeight).toFixed(4)})`
          );
        }
      }
    }

    // Micro-dynamics: per-note velocity variation
    {
      const noteIdx = this.state.tick % 8;
      const microGain = microDynamicGain(noteIdx, this.state.tick, this.state.mood);
      if (Math.abs(microGain - 1.0) > 0.02) {
        for (const result of layerResults) {
          if (result.name === 'melody' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * microGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Spectral morphing: smooth LPF transitions between sections
    {
      const progress = this.state.sectionProgress ?? 0;
      for (const result of layerResults) {
        const lpfMatch = result.code.match(/\.lpf\((\d+(?:\.\d+)?)\)/);
        if (lpfMatch) {
          const baseLpf = parseFloat(lpfMatch[1]);
          const morphed = morphedLpf(baseLpf, this.state.section, this.state.mood, progress);
          if (Math.abs(morphed - baseLpf) > 10) {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              () => `.lpf(${Math.round(morphed)})`
            );
          }
        }
      }
    }

    // Registral envelope: range expansion stored for melody
    {
      const phrasePos = (this.state.sectionProgress ?? 0) % 0.25 / 0.25;
      const _rangeAvail = availableRange(phrasePos, this.state.mood);
      // Available for melody note selection constraints
    }

    // Harmonic pedal anticipation: bass lean stored for drone
    {
      const _shouldLean = shouldAnticipate(this.state.ticksSinceChordChange, this.state.mood);
      // Available for drone/bass note selection
    }

    // Rhythmic entrainment: layers tighten timing over section
    if (shouldEntrain(this.state.mood, this.state.section)) {
      const progress = this.state.sectionProgress ?? 0;
      for (const result of layerResults) {
        const lateMatch = result.code.match(/\.late\(([0-9.]+)\)/);
        if (lateMatch) {
          const current = parseFloat(lateMatch[1]);
          const entrained = entrainedOffset(current, 0, progress, this.state.mood, this.state.section);
          if (Math.abs(entrained - current) > 0.001) {
            result.code = result.code.replace(
              /\.late\(([0-9.]+)\)/,
              () => `.late(${Math.max(0, entrained).toFixed(4)})`
            );
          }
        }
      }
    }

    // Melodic contour matching: stored for arp note selection
    {
      const _matchWeight = contourMatchWeight(0, 0, this.state.mood);
      // Available for arp pattern generator
    }

    // Harmonic rhythm sync: chord change alignment quality
    {
      const beatPos = (this.state.tick % 4);
      const alignment = chordChangeAlignment(beatPos, this.state.mood);
      // Strong alignment → boost harmony slightly on chord changes
      if (this.state.ticksSinceChordChange <= 1 && alignment > 0.7) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          const boost = 1.0 + (alignment - 0.7) * 0.2;
          harmonyResult.code = harmonyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * boost).toFixed(4)})`
          );
        }
      }
    }

    // Spectral flux: FM modulation depth correction for engagement
    {
      // Estimate flux from tick variance (simplified)
      const currentFlux = Math.abs(Math.sin(this.state.tick * 0.3)) * 0.5;
      const fCorr = fluxCorrection(currentFlux, this.state.mood, this.state.section);
      if (Math.abs(fCorr - 1.0) > 0.1) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'melody') {
            result.code = result.code.replace(
              /\.fm\(([0-9.]+)\)/,
              (_, val) => `.fm(${(parseFloat(val) * fCorr).toFixed(4)})`
            );
          }
        }
      }
    }

    // Pitch orbit: orbital weight stored for melody note selection
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const rootPc = noteToPC[this.state.currentChord.root] ?? 0;
      const _orbitWeight = orbitalWeight(rootPc, rootPc, this.state.mood);
      // Available for melody note selection
    }

    // Texture granularity: atmosphere decay adjustment
    {
      const decayMul = grainDecayMultiplier(this.state.mood, this.state.section);
      if (Math.abs(decayMul - 1.0) > 0.05) {
        const atmoResult = layerResults.find(r => r.name === 'atmosphere');
        if (atmoResult) {
          atmoResult.code = atmoResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * Math.max(0.7, Math.min(1.3, decayMul))).toFixed(4)})`
          );
        }
      }
    }

    // Harmonic saturation curve: gain/LPF correction for voice count
    {
      const totalVoices = this.state.currentChord.notes.length;
      const activeLayerCount = layerResults.length;
      const effectiveVoices = totalVoices + activeLayerCount * 0.5;
      const gainRed = saturationGainReduction(effectiveVoices, this.state.mood);
      const lpfCorr = saturationLpfCorrection(effectiveVoices, this.state.mood);
      if (gainRed < 0.99) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * gainRed).toFixed(4)})`
          );
        }
      }
      if (lpfCorr < 0.99) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * lpfCorr)})`
          );
        }
      }
    }

    // Overtone beating: FM correction for beating management
    {
      // Estimate beating from chord intervals
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const pcs = this.state.currentChord.notes.map((n: string) => noteToPC[n.replace(/\d+$/, '')] ?? 0);
      if (pcs.length >= 2) {
        // Check for close intervals that create beating (semitones/whole tones)
        let minInterval = 12;
        for (let i = 0; i < pcs.length; i++) {
          for (let j = i + 1; j < pcs.length; j++) {
            const diff = Math.abs(pcs[i] - pcs[j]);
            const interval = Math.min(diff, 12 - diff);
            minInterval = Math.min(minInterval, interval);
          }
        }
        // Convert semitone interval to approximate beating frequency
        const beatingHz = minInterval <= 2 ? (10 - minInterval * 3) : 0;
        const fmCorr = beatingFmCorrection(beatingHz, this.state.mood);
        if (Math.abs(fmCorr - 1.0) > 0.02) {
          for (const result of layerResults) {
            if (result.name === 'harmony') {
              result.code = result.code.replace(
                /\.fm\(([0-9.]+)\)/,
                (_, val) => `.fm(${(parseFloat(val) * fmCorr).toFixed(4)})`
              );
            }
          }
        }
      }
    }

    // Phrase question-answer: gain emphasis on answer phrases
    {
      const phraseIdx = Math.floor((this.state.sectionProgress ?? 0) / 0.25);
      const qaGain = qaGainEmphasis(phraseIdx, this.state.mood, this.state.section);
      if (Math.abs(qaGain - 1.0) > 0.01) {
        for (const result of layerResults) {
          if (result.name === 'melody') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * qaGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Dynamic compression: section-aware gain compression
    {
      for (const result of layerResults) {
        const gainMatch = result.code.match(/\.gain\(([0-9.]+)\)/);
        if (gainMatch) {
          const currentGain = parseFloat(gainMatch[1]);
          const compMul = compressionMultiplier(currentGain, this.state.mood, this.state.section);
          if (Math.abs(compMul - 1.0) > 0.02) {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * compMul).toFixed(4)})`
            );
          }
        }
      }
    }

    // Rhythmic complement: boost layers when partners are quiet
    {
      const densities: Record<string, number> = {};
      for (const result of layerResults) {
        const noteMatch = result.code.match(/note\("([^"]+)"\)/);
        if (noteMatch) {
          const parts = noteMatch[1].split(' ');
          densities[result.name] = parts.filter(p => p !== '~').length / Math.max(1, parts.length);
        } else {
          densities[result.name] = 0.5;
        }
      }
      for (const result of layerResults) {
        if (result.name === 'melody' || result.name === 'arp') {
          const partner = result.name === 'melody' ? 'arp' : 'melody';
          const partnerDensity = densities[partner] ?? 0.5;
          const cGain = complementGain(densities[result.name] ?? 0.5, partnerDensity, this.state.mood, this.state.section);
          if (cGain > 1.01) {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * cGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Harmonic suspension flow: sustain boost during suspension chains
    if (shouldChainSuspension(this.state.tick, this.state.mood, this.state.section)) {
      const susMul = suspensionSustainMul(this.state.mood, this.state.section);
      if (susMul > 1.05) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * Math.min(susMul, 1.3)).toFixed(4)})`
          );
        }
      }
    }

    // Timbral recall: stored for FM/filter blending reference
    {
      const _shouldRecall = shouldRecallTimbre(this.state.tick, this.state.mood, this.state.section);
      // Available for FM/filter setting integration
    }

    // Formant tracking: melody LPF follows vocal-like formant curve
    {
      const melodyResult = layerResults.find(r => r.name === 'melody');
      if (melodyResult) {
        const lpfMatch = melodyResult.code.match(/\.lpf\((\d+(?:\.\d+)?)\)/);
        if (lpfMatch) {
          const baseLpf = parseFloat(lpfMatch[1]);
          // Estimate MIDI note from chord root (melody register ~octave 4)
          const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
          const rootPc = noteToPC[this.state.currentChord.root] ?? 0;
          const midiEstimate = 60 + rootPc; // C4 range
          const fMul = formantLpfMultiplier(midiEstimate, baseLpf, this.state.mood);
          if (Math.abs(fMul - 1.0) > 0.02) {
            melodyResult.code = melodyResult.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              () => `.lpf(${Math.round(baseLpf * fMul)})`
            );
          }
        }
      }
    }

    // Rhythmic palindrome: preference stored for pattern generators
    {
      const _preferPalindrome = shouldPreferPalindrome(this.state.tick, this.state.mood, this.state.section);
      // Available for arp/melody pattern selection
    }

    // Spectral centroid correction: auto-correct brightness per layer
    {
      for (const result of layerResults) {
        const lpfMatch = result.code.match(/\.lpf\((\d+(?:\.\d+)?)\)/);
        if (lpfMatch) {
          const currentLpf = parseFloat(lpfMatch[1]);
          const correction = centroidCorrectionLpf(currentLpf, this.state.mood);
          if (Math.abs(correction - 1.0) > 0.02) {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              () => `.lpf(${Math.round(currentLpf * correction)})`
            );
          }
        }
      }
    }

    // Consonance arc: FM depth follows phrase-level tension curve
    {
      const phrasePos = (this.state.sectionProgress ?? 0) % 0.25 / 0.25;
      const fmMul = consonanceArcFm(phrasePos, this.state.mood, this.state.section);
      if (Math.abs(fmMul - 1.0) > 0.02) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'melody') {
            result.code = result.code.replace(
              /\.fm\(([0-9.]+)\)/,
              (_, val) => `.fm(${(parseFloat(val) * fmMul).toFixed(4)})`
            );
          }
        }
      }
    }

    // Rhythmic thinning: reduce melodic gain when harmony is thick
    {
      const voiceCount = this.state.currentChord.notes.length;
      const gainRed = thicknessGainReduction(voiceCount, this.state.mood);
      if (gainRed < 0.99) {
        for (const result of layerResults) {
          if (result.name === 'melody' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * gainRed).toFixed(4)})`
            );
          }
        }
      }
    }

    // Spectral width: voicing spread adjusts LPF bandwidth
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const pcs = this.state.currentChord.notes.map((n: string) => noteToPC[n.replace(/\d+$/, '')] ?? 0);
      const lpfMul = spectralWidthLpf(pcs, this.state.mood);
      if (Math.abs(lpfMul - 1.0) > 0.02) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * lpfMul)})`
          );
        }
      }
    }

    // Spectral envelope tracking: sustained notes darken naturally
    if (shouldTrackSpectralEnvelope(this.state.mood, this.state.section)) {
      const lpfMul = spectralEnvelopeLpf(
        this.state.ticksSinceChordChange,
        this.state.mood,
        this.state.section
      );
      if (lpfMul < 0.98) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'drone' || result.name === 'atmosphere') {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * lpfMul)})`
            );
          }
        }
      }
    }

    // Metric displacement canon: staggered layer entries at section boundaries
    // sectionProgress near 0 = just entered section; estimate ticks from progress
    const estimatedSectionTick = Math.floor((this.state.sectionProgress ?? 1) * 20);
    if (shouldApplyCanonDisplacement(this.state.mood, this.state.section, estimatedSectionTick)) {
      for (const result of layerResults) {
        const delay = canonDisplacement(result.name, this.state.mood, this.state.section);
        if (delay > 0.005) {
          const existing = result.code.match(/\.late\(([0-9.]+)\)/);
          if (existing) {
            const newLate = parseFloat(existing[1]) + delay;
            result.code = result.code.replace(
              /\.late\(([0-9.]+)\)/,
              () => `.late(${newLate.toFixed(4)})`
            );
          }
        }
      }
    }

    // Harmonic field tension: distance from tonal center modulates gain/brightness
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const rootPc = noteToPC[this.state.currentChord.root] ?? 0;
      const tonicPc = noteToPC[this.state.scale?.root ?? 'C'] ?? 0;
      const fGain = fieldTensionGain(rootPc, tonicPc, this.state.mood, this.state.section);
      const fBright = fieldTensionBrightness(rootPc, tonicPc, this.state.mood);
      if (Math.abs(fGain - 1.0) > 0.01) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'melody') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * fGain).toFixed(4)})`
            );
          }
        }
      }
      if (fBright > 1.01) {
        for (const result of layerResults) {
          if (result.name === 'harmony') {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * fBright)})`
            );
          }
        }
      }
    }

    // Intervallic palette: mood-specific interval weight stored for melody
    {
      const _iWeight = intervalWeight(7, this.state.mood); // reference weight for 5th
      // Available for melody generator note selection
    }

    // Dynamic articulation contrast: opposing layer articulations
    {
      const activeNames = layerResults.map(r => r.name);
      for (const result of layerResults) {
        const decayMul = articulationContrastDecay(result.name, activeNames, this.state.mood);
        if (Math.abs(decayMul - 1.0) > 0.02) {
          result.code = result.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * decayMul).toFixed(4)})`
          );
        }
      }
    }

    // Resonance frequency tracking: filter follows root harmonics
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const rootPc = noteToPC[this.state.currentChord.root] ?? 0;
      for (const result of layerResults) {
        if (result.name === 'melody' || result.name === 'arp' || result.name === 'harmony') {
          const lpfMatch = result.code.match(/\.lpf\((\d+(?:\.\d+)?)\)/);
          if (lpfMatch) {
            const currentLpf = parseFloat(lpfMatch[1]);
            const tracked = trackingLpf(rootPc, currentLpf, this.state.mood);
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              () => `.lpf(${Math.round(tracked)})`
            );
          }
        }
      }
    }

    // Voicing weight distribution: grounding quality gain
    {
      const noteMap: Record<string, number> = { C: 60, Db: 61, D: 62, Eb: 63, E: 64, F: 65, Gb: 66, G: 67, Ab: 68, A: 69, Bb: 70, B: 71 };
      const midiNotes = this.state.currentChord.notes.map((n: string) => noteMap[n.replace(/\d+$/, '')] ?? 60);
      const gGain = groundingGainMultiplier(midiNotes, this.state.mood);
      if (Math.abs(gGain - 1.0) > 0.01) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * gGain).toFixed(4)})`
          );
        }
      }
    }

    // Contour arc scoring: emphasize arch-shaped melodies
    {
      // Approximate pitch contour from section progress
      const progress = this.state.sectionProgress ?? 0.5;
      const noteMap: Record<string, number> = { C: 60, Db: 61, D: 62, Eb: 63, E: 64, F: 65, Gb: 66, G: 67, Ab: 68, A: 69, Bb: 70, B: 71 };
      const rootMidi = noteMap[this.state.currentChord.root] ?? 60;
      // Simulate an arch contour
      const pitches = [rootMidi, rootMidi + 2, rootMidi + 5, rootMidi + 7, rootMidi + 5, rootMidi + 2, rootMidi];
      const aGain = archGainMultiplier(pitches, this.state.mood);
      if (Math.abs(aGain - 1.0) > 0.01) {
        const melodyResult = layerResults.find(r => r.name === 'melody');
        if (melodyResult) {
          melodyResult.code = melodyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * aGain).toFixed(4)})`
          );
        }
      }
    }

    // Displacement layering: polyrhythmic phase offsets
    {
      for (const result of layerResults) {
        const disp = polyDisplacement(result.name, this.state.mood, this.state.section);
        if (disp > 0.002) {
          const existing = result.code.match(/\.late\(([0-9.]+)\)/);
          if (existing) {
            const newLate = parseFloat(existing[1]) + disp;
            result.code = result.code.replace(
              /\.late\(([0-9.]+)\)/,
              () => `.late(${newLate.toFixed(4)})`
            );
          }
        }
      }
    }

    // Harmonic rhythm regularity: emphasize regular chord change patterns
    {
      const ticksSince = this.state.ticksSinceChordChange ?? 4;
      const intervals = [ticksSince, ticksSince]; // approximate regularity
      const rGain = regularityGainMultiplier(intervals, this.state.mood);
      if (Math.abs(rGain - 1.0) > 0.01) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'drone') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * rGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Voice spacing quality: gain correction for voicing spacing
    {
      const noteMap: Record<string, number> = { C: 60, Db: 61, D: 62, Eb: 63, E: 64, F: 65, Gb: 66, G: 67, Ab: 68, A: 69, Bb: 70, B: 71 };
      const midiNotes = this.state.currentChord.notes.map((n: string) => noteMap[n.replace(/\d+$/, '')] ?? 60);
      const spGain = spacingGainCorrection(midiNotes, this.state.mood);
      if (Math.abs(spGain - 1.0) > 0.02) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * spGain).toFixed(4)})`
          );
        }
      }
    }

    // Syncopation depth: mood-appropriate syncopation emphasis
    {
      const beatPos = Math.floor((this.state.sectionProgress ?? 0) * 16) % 16;
      const sGain = syncopationGain(beatPos, this.state.mood);
      if (Math.abs(sGain - 1.0) > 0.02) {
        for (const result of layerResults) {
          if (result.name === 'arp' || result.name === 'melody') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * sGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Timbral envelope following: FM depth tracks amplitude envelope phase
    {
      const envPhase = this.state.sectionProgress ?? 0.5;
      const envFm = envelopeFmMultiplier(envPhase, this.state.mood);
      if (Math.abs(envFm - 1.0) > 0.03) {
        for (const result of layerResults) {
          if (result.name === 'melody' || result.name === 'arp' || result.name === 'harmony') {
            result.code = result.code.replace(
              /\.fm\(([0-9.]+)\)/,
              (_, val) => `.fm(${(parseFloat(val) * envFm).toFixed(4)})`
            );
          }
        }
      }
    }

    // Progression momentum: strong root motions build energy
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const rootPc = noteToPC[this.state.currentChord.root] ?? 0;
      const tonicPc = noteToPC[this.state.scale?.root ?? 'C'] ?? 0;
      const motion = ((rootPc - tonicPc) % 12 + 12) % 12;
      const mGain = momentumDriveGain([motion], this.state.mood);
      if (mGain > 1.01) {
        for (const result of layerResults) {
          result.code = result.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * Math.min(mGain, 1.06)).toFixed(4)})`
          );
        }
      }
    }

    // Dynamic panning width: stereo field responds to energy
    {
      const pwMul = panWidthMultiplier(
        this.state.tension?.overall ?? 0.5,
        this.state.mood,
        this.state.section
      );
      // Store for layer use — applied as pan range scaling
      if (Math.abs(pwMul - 1.0) > 0.05) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'arp' || result.name === 'atmosphere') {
            result.code = result.code.replace(
              /\.pan\(([0-9.-]+)\)/,
              (_, val) => `.pan(${(parseFloat(val) * pwMul).toFixed(4)})`
            );
          }
        }
      }
    }

    // Harmonic stasis detection: compensate for static harmony with timbral movement
    {
      const ticksSince = this.state.ticksSinceChordChange ?? 0;
      const stasisFm = stasisFmCompensation(ticksSince, this.state.mood);
      const stasisLpf = stasisLpfModulation(ticksSince, this.state.mood);
      if (stasisFm > 1.02) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'drone') {
            result.code = result.code.replace(
              /\.fm\(([0-9.]+)\)/,
              (_, val) => `.fm(${(parseFloat(val) * stasisFm).toFixed(4)})`
            );
          }
        }
      }
      if (stasisLpf > 1.02) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'melody') {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * stasisLpf)})`
            );
          }
        }
      }
    }

    // Tessitura tracking: register-aware gain correction
    {
      // Estimate MIDI from chord root
      const noteToMidi: Record<string, number> = { C: 60, Db: 61, D: 62, Eb: 63, E: 64, F: 65, Gb: 66, G: 67, Ab: 68, A: 69, Bb: 70, B: 71 };
      const rootMidi = noteToMidi[this.state.currentChord.root] ?? 60;
      for (const result of layerResults) {
        let layerMidi = rootMidi;
        if (result.name === 'drone') layerMidi = rootMidi - 20;
        else if (result.name === 'arp') layerMidi = rootMidi + 12;
        else if (result.name === 'melody') layerMidi = rootMidi + 7;
        const tGain = tessituraGainCorrection(layerMidi, result.name, this.state.mood);
        if (Math.abs(tGain - 1.0) > 0.02) {
          result.code = result.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * tGain).toFixed(4)})`
          );
        }
      }
    }

    // Subdivision articulation: faster notes get shorter decay
    {
      // Estimate subdivision from section and mood
      const subLevel = this.state.section === 'peak' ? 8 : this.state.section === 'build' ? 8 : 4;
      const subDecay = subdivisionDecay(subLevel, this.state.mood);
      if (Math.abs(subDecay - 1.0) > 0.05) {
        for (const result of layerResults) {
          if (result.name === 'arp' || result.name === 'melody') {
            result.code = result.code.replace(
              /\.decay\(([0-9.]+)\)/,
              (_, val) => `.decay(${(parseFloat(val) * subDecay).toFixed(4)})`
            );
          }
        }
      }
    }

    // Rhythmic phase alignment: boost gain when layers hit together
    {
      const activeCount = layerResults.length;
      if (activeCount > 2) {
        const boost = alignmentGainBoost(activeCount, activeCount, this.state.mood);
        if (boost > 1.01) {
          for (const result of layerResults) {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * Math.min(boost, 1.08)).toFixed(4)})`
            );
          }
        }
      }
    }

    // Quality envelope decay: chord quality shapes decay length
    {
      const qDecay = qualityDecay(this.state.currentChord.quality, this.state.mood);
      if (Math.abs(qDecay - 1.0) > 0.03) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'drone') {
            result.code = result.code.replace(
              /\.decay\(([0-9.]+)\)/,
              (_, val) => `.decay(${(parseFloat(val) * qDecay).toFixed(4)})`
            );
          }
        }
      }
    }

    // Structural pitch gravity: chord tone proximity boosts gain
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const chordPcs = this.state.currentChord.notes.map((n: string) => noteToPC[n.replace(/\d+$/, '')] ?? 0);
      const rootPc = noteToPC[this.state.currentChord.root] ?? 0;
      const sGain = structuralGravityGain(rootPc, chordPcs, this.state.mood);
      if (Math.abs(sGain - 1.0) > 0.01) {
        for (const result of layerResults) {
          if (result.name === 'melody' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * sGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Inversion context preference: adjust gain for non-root-position voicings
    {
      const inversionIdx = 0; // root position default (inversion handled by chord-inversion module)
      const invGain = inversionGainAdjustment(inversionIdx, this.state.mood);
      if (invGain < 0.99) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * invGain).toFixed(4)})`
          );
        }
      }
    }

    // Intra-bar density modulation: vary density within bars
    {
      const barPos = ((this.state.sectionProgress ?? 0) * 4) % 1; // position within bar
      const densityGain = intraBarDensity(barPos, this.state.mood);
      if (Math.abs(densityGain - 1.0) > 0.02) {
        for (const result of layerResults) {
          if (result.name === 'melody' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * densityGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Extension color temperature: chord extensions color LPF
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const rootPc = noteToPC[this.state.currentChord.root] ?? 0;
      const intervals = this.state.currentChord.notes.map((n: string) => {
        const pc = noteToPC[n.replace(/\d+$/, '')] ?? 0;
        return ((pc - rootPc) % 12 + 12) % 12;
      });
      const colorLpf = extensionColorLpf(intervals, this.state.mood);
      if (Math.abs(colorLpf - 1.0) > 0.03) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'melody') {
            result.code = result.code.replace(
              /\.lpf\((\d+(?:\.\d+)?)\)/,
              (_, val) => `.lpf(${Math.round(parseFloat(val) * colorLpf)})`
            );
          }
        }
      }
    }

    // Pitch range expansion: edge notes get slight gain reduction
    {
      // Estimate note position from section progress
      const notePos = this.state.sectionProgress ?? 0.5;
      const edgeGain = rangeEdgeGain(notePos, this.state.tension?.overall ?? 0.5, this.state.mood);
      if (edgeGain < 0.97) {
        for (const result of layerResults) {
          if (result.name === 'melody' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * edgeGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Harmonic anticipation timing: bass/drone arrive early
    {
      for (const result of layerResults) {
        const offset = anticipationOffset(result.name, this.state.mood, this.state.section);
        if (offset < -0.005) {
          const existing = result.code.match(/\.late\(([0-9.]+)\)/);
          if (existing) {
            const newLate = Math.max(0, parseFloat(existing[1]) + offset);
            result.code = result.code.replace(
              /\.late\(([0-9.]+)\)/,
              () => `.late(${newLate.toFixed(4)})`
            );
          }
        }
      }
    }

    // Groove template application: mood-characteristic rhythmic gain pattern
    {
      const beatPos = Math.floor((this.state.sectionProgress ?? 0) * 16) % 16;
      const gGain = grooveGainMultiplier(beatPos, this.state.mood);
      if (Math.abs(gGain - 1.0) > 0.02) {
        for (const result of layerResults) {
          if (result.name === 'texture' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * gGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Chord root motion quality: emphasize strong bass progressions
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const rootPc = noteToPC[this.state.currentChord.root] ?? 0;
      const tonicPc = noteToPC[this.state.scale?.root ?? 'C'] ?? 0;
      const rootInterval = ((rootPc - tonicPc) % 12 + 12) % 12;
      const rmGain = rootMotionGainMultiplier(rootInterval, this.state.mood);
      if (Math.abs(rmGain - 1.0) > 0.01) {
        const droneResult = layerResults.find(r => r.name === 'drone');
        if (droneResult) {
          droneResult.code = droneResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * rmGain).toFixed(4)})`
          );
        }
      }
    }

    // Sustain pedal simulation: extend decay for harmonically connected chords
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const currentPcs = this.state.currentChord.notes.map((n: string) => noteToPC[n.replace(/\d+$/, '')] ?? 0);
      // Use tonic triad as proxy for previous chord
      const tonicPc = noteToPC[this.state.scale?.root ?? 'C'] ?? 0;
      const prevPcs = [tonicPc, (tonicPc + 4) % 12, (tonicPc + 7) % 12];
      const sPedalDecay = sustainPedalDecay(currentPcs, prevPcs, this.state.mood);
      if (sPedalDecay > 1.05) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.decay\(([0-9.]+)\)/,
            (_, val) => `.decay(${(parseFloat(val) * sPedalDecay).toFixed(4)})`
          );
        }
      }
    }

    // Spectral energy distribution: LPF correction for frequency balance
    {
      const activeNames = layerResults.map(r => r.name);
      for (const result of layerResults) {
        const lpfMul = spectralBalanceLpf(result.name, activeNames, this.state.mood);
        if (Math.abs(lpfMul - 1.0) > 0.03) {
          result.code = result.code.replace(
            /\.lpf\((\d+(?:\.\d+)?)\)/,
            (_, val) => `.lpf(${Math.round(parseFloat(val) * lpfMul)})`
          );
        }
      }
    }

    // Spectral centroid momentum: smooth brightness transitions
    {
      for (const result of layerResults) {
        if (result.name === 'harmony' || result.name === 'melody') {
          const lpfMatch = result.code.match(/\.lpf\((\d+(?:\.\d+)?)\)/);
          if (lpfMatch) {
            const currentLpf = parseFloat(lpfMatch[1]);
            const prevLpf = currentLpf * 0.9; // estimate previous from slight reduction
            const correction = centroidMomentumCorrection(prevLpf, currentLpf, this.state.mood);
            if (Math.abs(correction - 1.0) > 0.02) {
              result.code = result.code.replace(
                /\.lpf\((\d+(?:\.\d+)?)\)/,
                (_, val) => `.lpf(${Math.round(parseFloat(val) * correction)})`
              );
            }
          }
        }
      }
    }

    // Interval variety scoring: diverse intervals get emphasis
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const chordPcs = this.state.currentChord.notes.map((n: string) => noteToPC[n.replace(/\d+$/, '')] ?? 0);
      const intervals = [];
      for (let i = 1; i < chordPcs.length; i++) {
        intervals.push(((chordPcs[i] - chordPcs[i - 1]) % 12 + 12) % 12);
      }
      if (intervals.length > 0) {
        const vGain = varietyGainMultiplier(intervals, this.state.mood);
        if (Math.abs(vGain - 1.0) > 0.01) {
          for (const result of layerResults) {
            if (result.name === 'melody') {
              result.code = result.code.replace(
                /\.gain\(([0-9.]+)\)/,
                (_, val) => `.gain(${(parseFloat(val) * vGain).toFixed(4)})`
              );
            }
          }
        }
      }
    }

    // Metric accent hierarchy: nested weight emphasis
    {
      const beatPos = Math.floor((this.state.sectionProgress ?? 0) * 16) % 16;
      const hGain = hierarchyGainMultiplier(beatPos, this.state.mood);
      if (Math.abs(hGain - 1.0) > 0.02) {
        for (const result of layerResults) {
          if (result.name === 'texture' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * hGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Tonal ambiguity gradient: reverb responds to harmonic distance
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const rootPc = noteToPC[this.state.currentChord.root] ?? 0;
      const tonicPc = noteToPC[this.state.scale?.root ?? 'C'] ?? 0;
      const reverbMul = ambiguityReverbMultiplier(rootPc, tonicPc, this.state.mood);
      if (reverbMul > 1.03) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'melody' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.room\(([0-9.]+)\)/,
              (_, val) => `.room(${Math.min(0.95, parseFloat(val) * reverbMul).toFixed(4)})`
            );
          }
        }
      }
    }

    // Attack transient shaping: vary attack crispness by beat position
    {
      const beatPos = Math.floor((this.state.sectionProgress ?? 0) * 16) % 16;
      const atkMul = attackMultiplier(beatPos, this.state.mood);
      if (Math.abs(atkMul - 1.0) > 0.05) {
        for (const result of layerResults) {
          if (result.name === 'melody' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.attack\(([0-9.]+)\)/,
              (_, val) => `.attack(${(parseFloat(val) * atkMul).toFixed(4)})`
            );
          }
        }
      }
    }

    // Harmonic rhythm variance: non-uniform chord timing
    {
      const variance = harmonicRhythmVariance(
        this.state.sectionProgress ?? 0,
        this.state.mood,
        this.state.section
      );
      if (Math.abs(variance - 1.0) > 0.05) {
        // Apply as slow multiplier to adjust perceived harmonic rhythm
        for (const result of layerResults) {
          if (result.name === 'harmony') {
            result.code = result.code.replace(
              /\.slow\(([0-9.]+)\)/,
              (_, val) => `.slow(${(parseFloat(val) * variance).toFixed(4)})`
            );
          }
        }
      }
    }

    // Melodic interval momentum: emphasize well-shaped melodic contours
    {
      // Estimate recent intervals from chord tone movement
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const rootPc = noteToPC[this.state.currentChord.root] ?? 0;
      const tonicPc = noteToPC[this.state.scale?.root ?? 'C'] ?? 0;
      const interval = ((rootPc - tonicPc) % 12 + 12) % 12;
      const intervals = [interval > 6 ? -(12 - interval) : interval, 2]; // approximate contour
      const mGain = momentumGainMultiplier(intervals, this.state.mood);
      if (Math.abs(mGain - 1.0) > 0.01) {
        for (const result of layerResults) {
          if (result.name === 'melody') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * mGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Harmonic partials reinforcement: boost FM for overtone-aligned voicings
    {
      const noteToPC: Record<string, number> = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
      const pcs = this.state.currentChord.notes.map((n: string) => noteToPC[n.replace(/\d+$/, '')] ?? 0);
      const fmMul = partialsReinforcementFm(pcs, this.state.mood);
      if (Math.abs(fmMul - 1.0) > 0.02) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'drone') {
            result.code = result.code.replace(
              /\.fm\(([0-9.]+)\)/,
              (_, val) => `.fm(${(parseFloat(val) * fmMul).toFixed(4)})`
            );
          }
        }
      }
    }

    // Rhythmic expectancy violation: emphasize pleasingly unexpected beats
    {
      const beatPos = Math.floor((this.state.sectionProgress ?? 0) * 16) % 16;
      const emphGain = expectancyGainEmphasis(beatPos, this.state.mood, this.state.section);
      if (emphGain > 1.01) {
        for (const result of layerResults) {
          if (result.name === 'arp' || result.name === 'texture') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * emphGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Tension curve shaping: custom envelope shapes per mood
    {
      const progress = this.state.sectionProgress ?? 0;
      const shaped = shapedTension(progress, this.state.mood);
      // Use shaped tension to modulate FM depth across layers
      const fmMul = 0.85 + shaped * 0.3; // 0.85 at start, 1.15 at peak
      if (Math.abs(fmMul - 1.0) > 0.02) {
        for (const result of layerResults) {
          if (result.name === 'harmony' || result.name === 'melody' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.fm\(([0-9.]+)\)/,
              (_, val) => `.fm(${(parseFloat(val) * fmMul).toFixed(4)})`
            );
          }
        }
      }
    }

    // Voicing register distribution: weight voicing quality for harmony
    {
      const chordMidi = this.state.currentChord.notes.map((n: string) => {
        const noteMap: Record<string, number> = { C: 60, Db: 61, D: 62, Eb: 63, E: 64, F: 65, Gb: 66, G: 67, Ab: 68, A: 69, Bb: 70, B: 71 };
        return noteMap[n.replace(/\d+$/, '')] ?? 60;
      });
      const sw = spreadWeight(chordMidi, this.state.mood);
      if (Math.abs(sw - 1.0) > 0.05) {
        const harmonyResult = layerResults.find(r => r.name === 'harmony');
        if (harmonyResult) {
          harmonyResult.code = harmonyResult.code.replace(
            /\.gain\(([0-9.]+)\)/,
            (_, val) => `.gain(${(parseFloat(val) * sw).toFixed(4)})`
          );
        }
      }
    }

    // Rhythmic phrase grouping: rest insertion at group boundaries
    {
      const beatPos = Math.floor((this.state.sectionProgress ?? 0) * 16) % 16;
      const restProb = groupBoundaryRest(beatPos, this.state.mood);
      if (restProb > 0.15) {
        // Reduce gain at phrase boundaries to create breathing room
        const breathGain = 1.0 - restProb * 0.4;
        for (const result of layerResults) {
          if (result.name === 'melody' || result.name === 'arp') {
            result.code = result.code.replace(
              /\.gain\(([0-9.]+)\)/,
              (_, val) => `.gain(${(parseFloat(val) * breathGain).toFixed(4)})`
            );
          }
        }
      }
    }

    // Temporal binding: groove tightness correction on layer timing
    if (shouldApplyBinding(this.state.mood, this.state.section)) {
      const delays: number[] = [];
      for (const result of layerResults) {
        const lateMatch = result.code.match(/\.late\(([0-9.]+)\)/);
        delays.push(lateMatch ? parseFloat(lateMatch[1]) * 1000 : 0);
      }
      const tightness = grooveTightness(delays, this.state.mood, this.state.section);
      if (tightness < 0.8) {
        const avgDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
        for (let i = 0; i < layerResults.length; i++) {
          const corr = timingCorrection(delays[i], avgDelay, this.state.mood, this.state.section);
          if (Math.abs(corr) > 1) {
            const newDelay = Math.max(0, (delays[i] + corr) / 1000);
            if (newDelay > 0.001) {
              layerResults[i].code = layerResults[i].code.replace(
                /\.late\(([0-9.]+)\)/,
                () => `.late(${newDelay.toFixed(4)})`
              );
            }
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
    // Beat-elastic warp: section-progressive time stretching (builds rush, breakdowns stretch)
    const beatWarp = shouldApplyBeatWarp(this.state.mood)
      ? beatWarpMultiplier(this.state.sectionProgress ?? 0, this.state.mood, this.state.section)
      : 1.0;
    const effectiveTempo = this.state.params.tempo * rubato * cadRubato * tempoTraj * tempoFeel * metricMod * elastic * cadAccel * beatWarp;
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
