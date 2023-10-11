import type { MetaFunction } from "@remix-run/react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import stylesUrl from "~/global.css";
import styles from "./tailwind.css";
import radixStyles from "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: radixStyles },
];

export const headers = () => ({
  "Cache-Control": "public, max-age=10, s-maxage=60",
});

export const meta: MetaFunction = () => [
  {
    title: "TekkenDocs | Frame data for Tekken",
  },
  {
    description: "Frame data and usefull resources for Tekken",
  },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
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
  );
}
