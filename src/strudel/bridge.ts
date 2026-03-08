let initialized = false;
let strudelReady = false;
let strudelEvaluate: ((code: string, autoplay?: boolean) => Promise<any>) | null = null;
let strudelHush: (() => void) | null = null;

export async function initStrudel(): Promise<void> {
  if (initialized) return;
  initialized = true;

  const mod = await import('@strudel/web');
  const { registerSoundfonts } = await import('@strudel/soundfonts');
  await mod.initStrudel();
  await registerSoundfonts();
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
