import { vitePlugin as remix } from '@remix-run/dev'
//import { sentryVitePlugin } from '@sentry/vite-plugin'
import { remixDevTools } from 'remix-development-tools'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    remixDevTools(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    // sentryVitePlugin({
    //   org: 'philip-bruvoll',
    //   project: 'javascript-remix',
    // }),
  ],

  build: {
    sourcemap: true,
  },
})
