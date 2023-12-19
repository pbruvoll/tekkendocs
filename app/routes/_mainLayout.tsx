import { DiscordLogoIcon, GitHubLogoIcon } from '@radix-ui/react-icons'
import {
  isRouteErrorResponse,
  Link,
  Outlet,
  useRouteError,
} from '@remix-run/react'
import { ContentContainer } from '~/components/ContentContainer'
import { discordInviteLink, githubLink } from '~/services/staticDataService'

export default function MainLayout() {
  return (
    <>
      <header style={{ background: 'var(--accent-4' }}>
        <ContentContainer>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-between py-1">
            <Link to="/">
              <img
                src="/logo-128.png"
                height="32px"
                width="32px"
                className="object-contain"
                alt="home"
              />
            </Link>
            <Link to="/" className="flex-grow text-center text-2xl">
              TekkenDocs
            </Link>
            <div className="flex place-self-end">
              <a
                title="Invite to Tekkendocs Discord server"
                href={discordInviteLink}
                className="px-2"
              >
                <DiscordLogoIcon width="2rem" height="2rem" />
              </a>
              <a
                title="TekkenDocs source code on Github"
                href={githubLink}
                className="px-2"
              >
                <GitHubLogoIcon width="2rem" height="2rem" />
              </a>
            </div>
          </div>
        </ContentContainer>
      </header>
      <Outlet />
      <footer style={{ background: 'var(--accent-5' }}>
        <ContentContainer enableBottomPadding enableTopPadding>
          <ul className="flex flex-col gap-3">
            <li>
              <a
                title="Invite to Tekkendocs Discord server"
                href={discordInviteLink}
                className="flex items-center gap-2 px-2"
              >
                Discord <DiscordLogoIcon width="2rem" height="2rem" />
              </a>
            </li>
            <li>
              <a
                title="TekkenDocs source code on Github"
                href={githubLink}
                className="flex items-center gap-2 px-2"
              >
                Github <GitHubLogoIcon width="2rem" height="2rem" />
              </a>
            </li>
          </ul>
          <p className="mt-4 text-sm">
            Tekkendocs is an independent website dedicated to frame data and
            learning resources for the fighting game TEKKEN®. This website is
            not connected with, sponsored, or endorsed by Namco Bandai or any of
            its affiliated companies.
          </p>
        </ContentContainer>
      </footer>
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    )
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    )
  } else {
    return <h1>Unknown Error</h1>
  }
}
