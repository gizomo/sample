import {defineConfig, type UserConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';

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
    plugins: [svelte()],
  });
