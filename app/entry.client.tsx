/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */
import { startTransition, StrictMode, useEffect } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { RemixBrowser, useLocation, useMatches } from '@remix-run/react'
// import * as Sentry from '@sentry/remix'

// Sentry.init({
//   dsn: 'https://8a32ae3fd9e29311a78fee3d00d475ac@o4508064861061120.ingest.de.sentry.io/4508064863748176',
//   tracesSampleRate: 1,

//   integrations: [
//     Sentry.browserTracingIntegration({
//       useEffect,
//       useLocation,
//       useMatches,
//     }),
//     Sentry.replayIntegration({
//       maskAllText: true,
//       blockAllMedia: true,
//     }),
//   ],

//   replaysSessionSampleRate: 0.1,
//   replaysOnErrorSampleRate: 1,
// })

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  )
})
