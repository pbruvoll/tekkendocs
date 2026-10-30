import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import ewgf from '~/images/t8/externalResources/ewgf.webp';
import replayDatabase from '~/images/t8/externalResources/replay-database.webp';
import sidestepChart from '~/images/t8/externalResources/sidestep-chart.webp';
import tekkenGuess from '~/images/t8/externalResources/tekken-guess.svg';
import tekkenLibrary from '~/images/t8/externalResources/tekken-library.webp';
import tournamentFinder from '~/images/t8/externalResources/tournament-finder.webp';
import wavuWank from '~/images/t8/externalResources/wavu-wank.webp';
import wavuWiki from '~/images/t8/externalResources/wavu-wiki.webp';
import { cn } from '~/lib/utils';

type ExternalResourceLink = {
  name: string;
  url: string;
  imageUrl: string;
  description: string;
  /** For logos that would otherwise touch the card edges */
  padImage?: boolean;
};

const data: ExternalResourceLink[] = [
  {
    name: 'Applay Cheat Sheets',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTsgbCJNSTKajMNlJvQleJOl0eTiEcV-PbeU0obDg1lsSqmz0lTtcD2k6NzfTPt7Db9Ua2dz1o_34Sv/pubhtml#',
    imageUrl: tekkenLibrary,
    description:
      'Quick introductions to each character, including key moves, punishers and starter combos',
  },
  {
    name: 'Wavu Wiki',
    url: 'https://wavu.wiki',
    imageUrl: wavuWiki,
    description:
      'A wiki with extensive information about each characters and game mechanics',
  },
  {
    name: 'Wavu Wank',
    url: 'https://wank.wavu.wiki/',
    imageUrl: wavuWank,
    description:
      'A database with all online ranked games and a precise rating system inspired by chess',
  },
  {
    name: 'Tekken Guess',
    url: 'https://tekkenguess.com/',
    imageUrl: tekkenGuess,
    padImage: true,
    description: 'Various quizzes like guess the rank, move or stage music',
  },
  {
    name: 'Sidestep chart',
    url: '/t8/sidestep-chart.webp',
    imageUrl: sidestepChart,
    description: 'Advice on which side to generally step against a character',
  },
  {
    name: 'Ewgf.gg - stats',
    url: 'https://ewgf.gg',
    imageUrl: ewgf,
    description:
      'Stats for rank distribution, character win rate, leaderboards, player profiles etc.',
  },
  {
    name: 'Replay Database',
    url: 'https://replaydatabase.com/tekken/',
    imageUrl: replayDatabase,
    description:
      'Competitive Tekken 8 replays, filterable by character, matchup, player and patch',
  },
  {
    name: 'Tournament Finder',
    url: 'https://sk-tekken.com/tracker',
    imageUrl: tournamentFinder,
    description:
      'Shows upcoming offline tournaments registered on start.gg on a world map',
  },
];

export const ExternalResources = () => {
  return (
    <div className="grid grid-cols-2 gap-x-1 gap-y-3 xs:grid-cols-2 xs:gap-x-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
      {data.map(({ url, description, imageUrl, name, padImage }, index) => (
        <a href={url} key={index}>
          <Card className="h-full border border-card-raised-border bg-card-raised pt-0 ring-0 transition duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
            <div className={cn('flex aspect-video w-full', padImage && 'p-4')}>
              <img className="h-full w-full" src={imageUrl} alt="" />
            </div>
            <CardHeader>
              <CardTitle className="display-heading font-display uppercase">
                {name}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        </a>
      ))}
    </div>
  );
};
