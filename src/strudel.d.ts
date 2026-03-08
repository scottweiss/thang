declare module '@strudel/web' {
  export function initStrudel(options?: Record<string, any>): Promise<any>;
  export function evaluate(code: string, autoplay?: boolean): Promise<any>;
  export function hush(): void;
  export function samples(source: string | Record<string, any>, base?: string, options?: Record<string, any>): Promise<void>;
}

declare module '@strudel/soundfonts' {
  export function registerSoundfonts(): Promise<void>;
  export function setSoundfontUrl(url: string): void;
  export function getFontBufferSource(name: string, value: any, ctx: AudioContext): Promise<AudioBufferSourceNode>;
}

declare module '@strudel/soundfonts/gm.mjs' {
  const gm: Record<string, string[]>;
  export default gm;
}
