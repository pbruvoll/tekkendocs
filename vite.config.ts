import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  environments: {
    ssr: {
      build: {
        rollupOptions: {
          input: './server/app.ts',
        },
      },
    },
  },
  plugins: [tailwindcss(), reactRouter()],
  // base-ui is only found when a page using it is opened, and bundling it then gives the page two copies
  // of React ("Cannot read properties of null (reading 'useContext')"), so it is bundled on start
  optimizeDeps: {
    include: [
      '@base-ui/react/button',
      '@base-ui/react/dialog',
      '@base-ui/react/input',
      '@base-ui/react/menu',
      '@base-ui/react/merge-props',
      '@base-ui/react/slider',
      '@base-ui/react/switch',
      '@base-ui/react/use-render',
    ],
  },
  resolve: {
    tsconfigPaths: true,
  },
});
