import { defineConfig } from 'vite';

export default defineConfig({
  base: '/thang/',
  build: {
    outDir: 'docs',
  },
  optimizeDeps: {
    include: [
      '@strudel/web',
      '@strudel/soundfonts',
      '@strudel/core',
      '@strudel/webaudio',
    ],
  },
  resolve: {
    dedupe: [
      '@strudel/core',
      'superdough',
    ],
  },
});
