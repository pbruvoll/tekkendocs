import {
  CodeIcon,
  ColorWheelIcon,
  GitHubLogoIcon,
  ImageIcon,
  Pencil1Icon,
  ReaderIcon,
  TableIcon,
  VideoIcon,
} from '@radix-ui/react-icons';
import { data, href, Link, useLoaderData } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer';
import { PersonLinkList } from '~/components/PersonLinkList';
import { getRepoContributors } from '~/services/githubService.server';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { t8AvatarMap } from '~/utils/t8AvatarMap';

type VideoRecorder = {
  name: string;
  url?: string;
  characters: string[];
};

const videoRecordersT8: VideoRecorder[] = [
  {
    name: 'MadCow',
    characters: ['Anna', 'Armor King', 'Fahkumram'],
    url: 'https://x.com/tekkendocs',
  },
  {
    name: 'Byce',
    characters: ['Kunimitsu', 'Miary Zo', 'Shaheen'],
  },
];

export const loader = async () => {
  let contributors: Awaited<ReturnType<typeof getRepoContributors>> = [];
  try {
    contributors = await getRepoContributors();
  } catch (error) {
    console.error('Failed to load GitHub contributors', error);
  }
  return data(
    { contributors },
    { headers: getCacheControlHeaders({ seconds: 60 * 60 * 24 }) },
  );
};

const linkClass = 'text-primary underline underline-offset-2';

type CreditEntry = {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};

const t8Credits: CreditEntry[] = [
  {
    title: 'Frame data source',
    icon: <TableIcon />,
    content: (
      <>
        Frame data for Tekken 8 is imported from{' '}
        <a className={linkClass} href="https://wavu.wiki/">
          wavu.wiki
        </a>
        . A big thanks to everyone who has contributed to frame data and videos
        there
      </>
    ),
  },
  {
    title: 'Main programmer',
    icon: <CodeIcon />,
    content: 'MadCow',
  },
  {
    title: 'Designer',
    icon: <ColorWheelIcon />,
    content: (
      <span className="inline-flex flex-wrap items-center gap-x-1">
        <PersonLinkList
          persons={[{ name: 'SkytorRush', url: 'https://x.com/9SkytorRush0' }]}
        />
        Logo, character avatars and images for guides
      </span>
    ),
  },
];

const iconsCredit: CreditEntry = {
  title: 'Icons',
  icon: <ImageIcon />,
  content: (
    <>
      Icons for move properties and images for ranks are from{' '}
      <a className={linkClass} href="https://tekkenwarehouse.com">
        tekkenwarehouse.com
      </a>
      .
    </>
  ),
};

const t7Credits: CreditEntry[] = [
  {
    title: 'Frame data source',
    icon: <TableIcon />,
    content: (
      <>
        This app uses the RBN frame data which is also found at{' '}
        <a className={linkClass} href="http://rbnorway.org/t7-frame-data/">
          rbnorway.org
        </a>
        . That data was originally a translation of a japanese site called
        inatekken. After season 1 of tekken 7, that site went offline. We
        continued to update the data, using multiple sources. This includes
        manually testing, comments from the community at{' '}
        <a className={linkClass} href="http://rbnorway.org/t7-frame-data/">
          rbnorway.org
        </a>
        , the official patch notes for each season, in game frame data and also
        using the site{' '}
        <a className={linkClass} href="http://geppopotamus.info/game/tekken7fr">
          geppoppotmus.info
        </a>{' '}
        as a cross reference.
      </>
    ),
  },
  {
    title: 'Main programmer and frame translator',
    icon: <CodeIcon />,
    content: 'MadCow',
  },
  {
    title: 'Guide data source',
    icon: <ReaderIcon />,
    content: (
      <>
        A big thanks to Applay for letting us use the data from his{' '}
        <a
          className={linkClass}
          href="https://docs.google.com/spreadsheets/d/11ETDnPJuku2ref3PzODMpZ4y7e5_wfILR2aPv83WpSw/edit?usp=sharing"
        >
          Tekken 7 cheat sheet
        </a>
        . See the readme in the link for all members who have contributed.
      </>
    ),
  },
  {
    title: 'Frame data update helpers',
    icon: <Pencil1Icon />,
    content: (
      <>
        <p className="mb-2">
          <span className="font-medium text-muted-foreground">Season 4:</span>{' '}
          Bager, Mollatt, The Last Phoenix, Seik, JBoy and Kokkos
        </p>
        <p>
          <span className="font-medium text-muted-foreground">Season 3:</span>{' '}
          Seik, Bager, Mollatt, LastPheonix, DopeShoe, JBoy, Deku, Mode and
          Knekk
        </p>
      </>
    ),
  },
];

const GameHeading = ({ children }: React.PropsWithChildren) => (
  <div className="mb-5 mt-12 flex items-center gap-4 first:mt-0">
    <h2 className="shrink-0 text-2xl font-bold tracking-tight">{children}</h2>
    <span className="h-px grow bg-linear-to-r from-primary/50 via-border to-transparent" />
  </div>
);

type SectionHeadingProps = React.PropsWithChildren<{ icon: React.ReactNode }>;

const SectionHeading = ({ icon, children }: SectionHeadingProps) => (
  <div className="mb-4 mt-8 flex items-center gap-3">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
      {icon}
    </span>
    <h3 className="shrink-0 text-lg font-semibold tracking-tight">
      {children}
    </h3>
    <span className="h-px grow bg-linear-to-r from-border to-transparent" />
  </div>
);

type CreditCardProps = React.PropsWithChildren<{
  title: string;
  icon: React.ReactNode;
  className?: string;
}>;

const CreditCard = ({ title, icon, className, children }: CreditCardProps) => (
  <div
    className={`paper-card group px-5 py-5 text-card-foreground drop-shadow-lg transition-all duration-200 hover:-translate-y-1 hover:drop-shadow-2xl ${className ?? ''}`}
  >
    <div className="mb-1.5 flex items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/20">
        {icon}
      </span>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
    </div>
    <div className="leading-relaxed">{children}</div>
  </div>
);

const CharacterChip = ({ name }: { name: string }) => {
  const characterId = name.toLowerCase().replaceAll(' ', '-');
  const avatar = t8AvatarMap[characterId];
  return (
    <Link
      to={`${href(`/t8/:character`, { character: characterId })}?viewMode=videoCards`}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-1 pr-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted"
    >
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="size-6 rounded-full object-cover ring-1 ring-border"
        />
      ) : (
        <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {name.charAt(0)}
        </span>
      )}
      {name}
    </Link>
  );
};

export default function Credits() {
  const { contributors } = useLoaderData<typeof loader>();
  return (
    <ContentContainer
      className="animate-in fade-in duration-700"
      enableBottomPadding
      enableTopPadding
    >
      <h1 className="text-4xl font-bold tracking-tight">Credits</h1>
      <div className="mt-3 h-1 w-16 rounded-full bg-linear-to-r from-primary to-primary/10" />
      <p className="mt-4 mb-2 max-w-2xl text-muted-foreground">
        TekkenDocs is built on the work of many people and communities. Thanks
        to everyone listed below.
      </p>

      <GameHeading>Tekken 8</GameHeading>
      <div className="grid gap-6">
        {t8Credits.map((credit) => (
          <CreditCard
            key={credit.title}
            title={credit.title}
            icon={credit.icon}
          >
            {credit.content}
          </CreditCard>
        ))}
      </div>

      {videoRecordersT8.length > 0 && (
        <>
          <SectionHeading icon={<VideoIcon />}>Video recordings</SectionHeading>
          <div className="grid gap-6">
            {videoRecordersT8.map((recorder) => (
              <div
                key={recorder.name}
                className="paper-card group px-5 py-5 text-card-foreground drop-shadow-lg transition-all duration-200 hover:-translate-y-1 hover:drop-shadow-2xl"
              >
                <div className="mb-3 font-semibold">
                  <PersonLinkList
                    persons={[{ name: recorder.name, url: recorder.url }]}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {recorder.characters.map((character) => (
                    <CharacterChip key={character} name={character} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 grid gap-6">
        <CreditCard title={iconsCredit.title} icon={iconsCredit.icon}>
          {iconsCredit.content}
        </CreditCard>
      </div>

      {contributors.length > 0 && (
        <>
          <SectionHeading icon={<GitHubLogoIcon />}>
            Code contributors
          </SectionHeading>
          <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
            Everyone who has contributed code to the{' '}
            <a
              className={linkClass}
              href="https://github.com/pbruvoll/tekkendocs"
            >
              open source repository
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-2">
            {contributors.map((contributor) => (
              <a
                key={contributor.login}
                href={contributor.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`${contributor.contributions} contribution${
                  contributor.contributions === 1 ? '' : 's'
                }`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-1 pr-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted"
              >
                <img
                  src={contributor.avatarUrl}
                  alt=""
                  loading="lazy"
                  className="size-6 rounded-full object-cover ring-1 ring-border"
                />
                {contributor.login}
              </a>
            ))}
          </div>
        </>
      )}

      <GameHeading>Tekken 7</GameHeading>
      <div className="grid gap-6">
        {t7Credits.map((credit) => (
          <CreditCard
            key={credit.title}
            title={credit.title}
            icon={credit.icon}
          >
            {credit.content}
          </CreditCard>
        ))}
      </div>
    </ContentContainer>
  );
}
