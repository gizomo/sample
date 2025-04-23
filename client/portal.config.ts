import legacy from '@vitejs/plugin-legacy';
import process from 'node:process';
import type Bundler from './bundler';
import {defineConfig, type UserConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';

const debug: boolean = process.env.DEBUG ? '1' === process.env.DEBUG : false;

export default (bundler: Bundler): UserConfig =>
  defineConfig({
    base: '',
    build: {
      minify: !debug,
      assetsInlineLimit: Infinity,
      chunkSizeWarningLimit: Infinity,
      outDir: bundler.getOutDir(),
      emptyOutDir: false,
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
      {
        name: 'index-html-build',
        apply: 'build',
        enforce: 'post',
        transformIndexHtml(html: string): string {
          return bundler.parseScripts(html).toHtml(undefined, debug);
        },
        writeBundle(): void {
          bundler.bundlePlayer().clearScripts();
        },
      },
    ],
  });
