import Bundler from './bundler';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';
import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';

const bundler: Bundler = new Bundler('../webos', 'tv');

export default defineConfig({
  base: '',
  build: {
    assetsInlineLimit: Infinity,
    chunkSizeWarningLimit: Infinity,
    outDir: bundler.getOutDir(),
    emptyOutDir: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/presentation/stb/app'),
    },
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
        return bundler.parseScripts(html).toHtml(['<script src="webOSTVjs-1.2.11/webOSTV.js"></script>'], true);
      },
      writeBundle(): void {
        bundler.bundlePlayer().clearScripts();
      },
    },
  ],
});
