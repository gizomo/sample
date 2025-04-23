import Bundler from './bundler';
import path from 'path';
import portalConfig from './portal.config';
import {defineConfig} from 'vite';

export default defineConfig({
  ...portalConfig(new Bundler('../portal', 'tv')),
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/presentation/tv/app'),
    },
  },
});
