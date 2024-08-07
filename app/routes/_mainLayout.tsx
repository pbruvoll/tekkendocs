import { FaFacebook } from 'react-icons/fa'
import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  MagnifyingGlassIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons'
import { Link, Outlet } from '@remix-run/react'
import { ContentContainer } from '~/components/ContentContainer'
import { AppErrorBoundary } from '~/components/ErrorBoundary'
import {
  facebooklink,
  githubLink,
  twitterLink,
} from '~/services/staticDataService'
import { GetInTouchWith } from '~/utils/getInTouch'
import { GitHubIssueContactProvider } from '~/utils/getInTouch/providers/githubIssueContactProvider'
import { DiscordContactProvider } from '~/utils/getInTouch/providers/discordContactProvider'

type MainLayoutTemplateProps = React.PropsWithChildren<{}>
const MainLayoutTemplate = ({ children }: MainLayoutTemplateProps) => {
  const contactByGithub = new GetInTouchWith(new GitHubIssueContactProvider())
  const contactByDiscord = new GetInTouchWith(new DiscordContactProvider())
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
              <a title="Serach" href="/t8/search" className="px-2">
                <MagnifyingGlassIcon width="2em" height="2em" />
              </a>
              <a
                title="Invite to Tekkendocs Discord server"
                href={contactByDiscord.url('invite')}
                className="px-2"
              >
                <DiscordLogoIcon width="2em" height="2em" />
              </a>
              <a
                title="TekkenDocs source code on Github"
                href={githubLink}
                className="px-2"
              >
                <GitHubLogoIcon width="2em" height="2em" />
              </a>
            </div>
          </div>
        </ContentContainer>
      </header>
      {children}
      <footer style={{ background: 'var(--accent-5' }}>
        <ContentContainer enableBottomPadding enableTopPadding>
          <ul className="flex flex-col gap-3">
            <li>
              <a
                title="Invite to Tekkendocs Discord server"
                href={contactByDiscord.url('invite')}
                className="flex items-center gap-2 px-2"
              >
                Discord <DiscordLogoIcon width="2em" height="2em" />
              </a>
            </li>
            <li>
              <a
                title="TekkenDocs on Twitter (X)"
                href={twitterLink}
                className="flex items-center gap-2 px-2"
              >
                Twitter <TwitterLogoIcon width="2em" height="2em" />
              </a>
            </li>
            <li>
              <a
                title="TekkenDocs on Facebook"
                href={facebooklink}
                className="flex items-center gap-2 px-2"
              >
                Facebook <FaFacebook fontSize="2em" />
              </a>
            </li>
            <li>
              <a
                title="TekkenDocs source code on Github"
                href={githubLink}
                className="flex items-center gap-2 px-2"
              >
                Github <GitHubLogoIcon width="2em" height="2em" />
              </a>
            </li>
            <li>
              <a href={contactByGithub.url('featureRequest')} target="_blank">
                Feature Request
              </a>
            </li>
            <li>
              <a href={contactByGithub.url('bugReport')} target="_blank">
                Bug Report
              </a>
            </li>
            <li>
              <Link to="/features">Features</Link>
            </li>
            <li>
              <Link to="/credits">Credits</Link>
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

export default function MainLayout() {
  return (
    <MainLayoutTemplate>
      <Outlet />
    </MainLayoutTemplate>
  )
}

export function ErrorBoundary() {
  return (
    <MainLayoutTemplate>
      <AppErrorBoundary />
    </MainLayoutTemplate>
  )
}
