import {defineConfig, type UserConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import legacy from '@vitejs/plugin-legacy';

export default (): UserConfig =>
  defineConfig({
    base: '',
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    server: {
      host: '0.0.0.0',
    },
    plugins: [
      svelte(),
      legacy({
        renderModernChunks: false,
        targets: ['> 0.1%', 'IE 9'],
      }),
    ],
  });
