let initialized = false;
let strudelReady = false;
let strudelEvaluate: ((code: string, autoplay?: boolean) => Promise<any>) | null = null;
let strudelHush: (() => void) | null = null;

export async function initStrudel(): Promise<void> {
  if (initialized) return;
  initialized = true;

  const mod = await import('@strudel/web');
  await mod.initStrudel();

  // Register GM soundfonts using @strudel/web's own registerSound.
  //
  // Why not just call registerSoundfonts() from @strudel/soundfonts?
  // Because Vite pre-bundles @strudel/web and @strudel/soundfonts separately,
  // each getting their own copy of superdough with its own soundMap.
  // registerSoundfonts() writes to @strudel/soundfonts' soundMap, but
  // playback reads from @strudel/web's soundMap — so sounds aren't found.
  //
  // Fix: use @strudel/web's registerSound + getFontBufferSource from
  // @strudel/soundfonts (which only does audio buffer loading, no soundMap).
  const sfMod: any = await import('@strudel/soundfonts');
  const { getFontBufferSource } = sfMod;
  // gm.mjs is the GM instrument → font file mapping
  const gmData: Record<string, string[]> = (await import(
    /* @vite-ignore */ '@strudel/soundfonts/gm.mjs'
  )).default;

  const {
    registerSound,
    getAudioContext,
    getADSRValues,
    getParamADSR,
    getSoundIndex,
    getVibratoOscillator,
    getPitchEnvelope,
    onceEnded,
    releaseAudioNode,
  } = mod as any;

  for (const [name, fonts] of Object.entries(gmData)) {
    registerSound(
      name,
      async (time: number, value: any, onended: () => void) => {
        const [attack, decay, sustain, release] = getADSRValues([
          value.attack, value.decay, value.sustain, value.release,
        ]);
        const { duration } = value;
        const n = getSoundIndex(value.n, fonts.length);
        const font = fonts[n];
        const ctx = getAudioContext();
        const bufferSource = await getFontBufferSource(font, value, ctx);
        bufferSource.start(time);
        const envGain = ctx.createGain();
        const node = bufferSource.connect(envGain);
        const holdEnd = time + duration;
        getParamADSR(node.gain, attack, decay, sustain, release, 0, 0.3, time, holdEnd, 'linear');
        const envEnd = holdEnd + release + 0.01;
        const vibratoHandle = getVibratoOscillator(bufferSource.detune, value, time);
        getPitchEnvelope(bufferSource.detune, value, time, holdEnd);
        bufferSource.stop(envEnd);
        const stop = () => {};
        onceEnded(bufferSource, () => {
          releaseAudioNode(bufferSource);
          vibratoHandle?.stop();
          onended();
        });
        return { node, stop, nodes: { source: [bufferSource], ...vibratoHandle?.nodes } };
      },
      { type: 'soundfont', prebake: true, fonts },
    );
  }

  strudelEvaluate = mod.evaluate;
  strudelHush = mod.hush;

  // Load dirt-samples for drums (bd, sd, hh, oh, cp, etc.)
  await mod.samples('github:tidalcycles/dirt-samples');

  strudelReady = true;
}

export function isReady(): boolean {
  return strudelReady;
}

export async function evaluate(code: string): Promise<any> {
  if (!strudelReady || !strudelEvaluate) {
    throw new Error('Strudel not initialized');
  }
  return strudelEvaluate(code);
}

export function hush(): void {
  if (strudelHush) {
    strudelHush();
  }
}
