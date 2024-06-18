import { vitePlugin as remix } from '@remix-run/dev'
import { remixDevTools } from "remix-development-tools";
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [remixDevTools(), remix(), tsconfigPaths()],
  ssr: {
    noExternal: ['@radix-ui/themes'],
  },
})
