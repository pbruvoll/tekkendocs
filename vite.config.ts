import { vitePlugin as remix } from '@remix-run/dev'
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { remixDevTools } from 'remix-development-tools'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [remixDevTools(), remix(), tsconfigPaths(), sentryVitePlugin({
    org: "philip-bruvoll",
    project: "javascript-remix"
  })],

  ssr: {
    noExternal: ['@radix-ui/themes'],
  },

  build: {
    sourcemap: true
  }
})