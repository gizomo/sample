import devConfig from './dev.config';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  ...devConfig(),
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/presentation/tv/app'),
    },
  },
});
