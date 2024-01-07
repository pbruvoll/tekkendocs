import { Theme } from '@radix-ui/themes'
import radixStyles from '@radix-ui/themes/styles.css'
import type { LinksFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  type MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import stylesUrl from '~/global.css'
import styles from './tailwind.css'
import { getCacheControlHeaders } from './utils/headerUtils'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: radixStyles },
]

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 })

export const meta: MetaFunction = () => [
  {
    title: 'TekkenDocs | Frame data for Tekken',
  },
  {
    description: 'Frame data and usefull resources for Tekken',
  },
]

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="icon" sizes="512x512" href="/logo-512.png" />
        <link rel="icon" sizes="256x256" href="/logo-256.png" />
        <link rel="icon" sizes="128x128" href="/logo-128.png" />
        <link rel="shortcut" href="/logo-128.png" />
        <link rel="apple-touch-icon" href="logo-256.png" />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#ffca16" />
        <meta name="theme-color" content="#ffca16" />

        <Meta />
        <Links />
      </head>
      <body>
        <Theme
          appearance="dark"
          accentColor="amber"
          grayColor="gray"
          panelBackground="solid"
          scaling="100%"
          radius="full"
        >
          <Outlet />
        </Theme>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
