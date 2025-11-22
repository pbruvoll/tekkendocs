import { reactRouter } from '@react-router/dev/vite';
//import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    devtoolsJson(),
    reactRouter(),
    tsconfigPaths(),
    // sentryVitePlugin({
    //   org: 'philip-bruvoll',
    //   project: 'javascript-remix',
    // }),
  ],

  build: {
    sourcemap: true,
  },
});
