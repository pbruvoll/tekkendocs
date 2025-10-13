import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ewgf from '~/images/t8/externalResources/ewgf.webp'
import naGuide from '~/images/t8/externalResources/naguide.webp'
import sidestepChart from '~/images/t8/externalResources/sidestep-chart.webp'
import tekkenLibrary from '~/images/t8/externalResources/tekken-library.webp'
import wavuWank from '~/images/t8/externalResources/wavu-wank.webp'
import wavuWiki from '~/images/t8/externalResources/wavu-wiki.webp'

type ExternalResourceLink = {
  name: string
  url: string
  imageUrl: string
  description: string
}

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
    name: 'NaGuide',
    url: 'https://www.naguide.com/tekken-8-cheat-sheets-for-all-characters/',
    imageUrl: naGuide,
    description:
      'A website with a collection of visual cheat sheets for characters',
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
]

export const ExternalResources = () => {
  return (
    <div className="grid grid-cols-2 gap-x-1 gap-y-3 xs:grid-cols-2 xs:gap-x-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
      {data.map(({ url, description, imageUrl, name }, index) => (
        <a href={url} key={index}>
          <Card className="h-full transform transition duration-500 hover:scale-110">
            <div className="flex aspect-video w-full p-2">
              <img className="h-full w-full" src={imageUrl} alt="" />
            </div>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        </a>
      ))}
    </div>
  )
}
