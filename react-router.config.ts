import { type Config } from '@react-router/dev/config';
export default {
  ssr: true,
  routeDiscovery: { mode: 'initial' },
  // All of these are the default in React Router v8; adopt them on v7 first so
  // the jump to v8 is a no-op (see the v7->v8 upgrade guide).
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
    v8_passThroughRequests: true,
    v8_trailingSlashAwareDataRequests: true,
  },
} satisfies Config;
