declare module '@strudel/web' {
  export function initStrudel(options?: Record<string, any>): Promise<any>;
  export function evaluate(code: string, autoplay?: boolean): Promise<any>;
  export function hush(): void;
  export function samples(source: string | Record<string, any>, base?: string, options?: Record<string, any>): Promise<void>;
}
