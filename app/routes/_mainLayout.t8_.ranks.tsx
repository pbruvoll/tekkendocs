import { Card, Inset } from '@radix-ui/themes'
import { type MetaFunction } from '@remix-run/node'
import { ContentContainer } from '~/components/ContentContainer'
import assaliant from '~/images/t8/ranks/assaliant.png'
import battleRuler from '~/images/t8/ranks/battle-ruler.png'
import beginner from '~/images/t8/ranks/beginner.png'
import brawler from '~/images/t8/ranks/brawler.png'
import bushin from '~/images/t8/ranks/bushin.png'
import cavalry from '~/images/t8/ranks/cavalry.png'
import combatant from '~/images/t8/ranks/combatant.png'
import destroyer from '~/images/t8/ranks/destroyer.png'
import dominator from '~/images/t8/ranks/dominator.png'
import eliminator from '~/images/t8/ranks/eliminator.png'
import fighter from '~/images/t8/ranks/fighter.png'
import firstDan from '~/images/t8/ranks/first-dan.png'
import flameRuler from '~/images/t8/ranks/flame-ruler.png'
import fujin from '~/images/t8/ranks/fujin.png'
import ganryu from '~/images/t8/ranks/ganryu.png'
import godOfDestruction from '~/images/t8/ranks/god-of-destruction.png'
import kisin from '~/images/t8/ranks/kishin.png'
import mightyRuler from '~/images/t8/ranks/mighty-ruler.png'
import raijin from '~/images/t8/ranks/raijin.png'
import ranger from '~/images/t8/ranks/ranger.png'
import secondDan from '~/images/t8/ranks/second-dan.png'
import shinryu from '~/images/t8/ranks/shinryu.png'
import strategist from '~/images/t8/ranks/strategist.png'
import tekkenEmperor from '~/images/t8/ranks/tekken-emperor.png'
import tekkenGod from '~/images/t8/ranks/tekken-god.png'
import tekkenGodSupreme from '~/images/t8/ranks/tekken-god-supreme.png'
import tekkenKing from '~/images/t8/ranks/tekken-king.png'
import tenryu from '~/images/t8/ranks/tenryu.png'
import vanquisher from '~/images/t8/ranks/vanquisher.png'
import warrior from '~/images/t8/ranks/warrior.png'
import { generateMetaTags } from '~/utils/seoUtils'

type Rank = {
  name: string
  image: string
  points: number
}

type RankGroup = {
  name: string
  ranks: Rank[]
}

const rankGroups: RankGroup[] = [
  {
    name: 'Silver',
    ranks: [
      {
        name: 'Beginner',
        points: 0,
        image: beginner,
      },
      {
        name: '1st Dan',
        points: 400,
        image: firstDan,
      },
      {
        name: '2nd Dan',
        points: 1000,
        image: secondDan,
      },
    ],
  },
  {
    name: 'Light blue',
    ranks: [
      {
        name: 'Fighter',
        points: 1600,
        image: fighter,
      },
      {
        name: 'Strategist',
        points: 2600,
        image: strategist,
      },
      {
        name: 'Combatant',
        points: 3400,
        image: combatant,
      },
    ],
  },
  {
    name: 'Green',
    ranks: [
      {
        name: 'Brawler',
        points: 4200,
        image: brawler,
      },
      {
        name: 'Ranger',
        points: 5400,
        image: ranger,
      },
      {
        name: 'Cavalry',
        points: 6400,
        image: cavalry,
      },
    ],
  },
  {
    name: 'Yellow',
    ranks: [
      {
        name: 'Warrior',
        points: 7400,
        image: warrior,
      },
      {
        name: 'Assaliant',
        points: 9200,
        image: assaliant,
      },
      {
        name: 'Dominator',
        points: 10800,
        image: dominator,
      },
    ],
  },
  {
    name: 'Orange',
    ranks: [
      {
        name: 'Vanquisher',
        points: 12400,
        image: vanquisher,
      },
      {
        name: 'Destroyer',
        points: 14700,
        image: destroyer,
      },
      {
        name: 'Eliminator',
        points: 16600,
        image: eliminator,
      },
    ],
  },
  {
    name: 'Red',
    ranks: [
      {
        name: 'Ganryu',
        points: 18500,
        image: ganryu,
      },
      {
        name: 'Shinryu',
        points: 23100,
        image: shinryu,
      },
      {
        name: 'Tenryu',
        points: 27300,
        image: tenryu,
      },
    ],
  },
  {
    name: 'Purple',
    ranks: [
      {
        name: 'Mighty Ruler',
        points: 31500,
        image: mightyRuler,
      },
      {
        name: 'Flame Ruler',
        points: 36500,
        image: flameRuler,
      },
      {
        name: 'Battle Ruler',
        points: 41100,
        image: battleRuler,
      },
    ],
  },
  {
    name: 'Blue',
    ranks: [
      {
        name: 'Fujin',
        points: 45700,
        image: fujin,
      },
      {
        name: 'Raijin',
        points: 52300,
        image: raijin,
      },
      {
        name: 'Kishin',
        points: 58500,
        image: kisin,
      },
      {
        name: 'Bushin',
        points: 64700,
        image: bushin,
      },
    ],
  },
  {
    name: 'Gold purple',
    ranks: [
      {
        name: 'Tekken King',
        points: 70900,
        image: tekkenKing,
      },
      {
        name: 'Tekken Emperor',
        points: 79100,
        image: tekkenEmperor,
      },
    ],
  },
  {
    name: 'Gold',
    ranks: [
      {
        name: 'Tekken God',
        points: 87900,
        image: tekkenGod,
      },
      {
        name: 'Tekken God Supreme',
        points: 97300,
        image: tekkenGodSupreme,
      },
      {
        name: 'God of Destruction',
        points: 109700,
        image: godOfDestruction,
      },
    ],
  },
]

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    title: 'Tekken 8 ranks',
    description: 'A list of all ranks in tekken 8',
    matches,
    image: { url: `/t8/pages/ranks.png` },
    url: `/t8/ranks`,
  })
}

const Ranks = () => {
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <h1 className="text-xl">Tekken 8 ranks</h1>
      {rankGroups.map(rg => (
        <RankGroup key={rg.name} name={rg.name} ranks={rg.ranks} />
      ))}
    </ContentContainer>
  )
}

export default Ranks

const RankCard = ({ image, name, points }: Rank) => {
  return (
    <Card>
      <Inset clip="padding-box" side="top" pb="current">
        <img src={image} className="aspect-[2] w-full" alt={name} />
      </Inset>
      <div className="flex flex-col flex-wrap items-center gap-1 text-center text-sm">
        <div>{name}</div>
        <div>{points} pts</div>
      </div>
    </Card>
  )
}

const RankGroup = ({ name, ranks }: RankGroup) => {
  return (
    <section className="mt-6">
      <h2 className="mt-3 text-lg">{name}</h2>
      <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
        {ranks.map(r => (
          <RankCard
            key={r.name}
            image={r.image}
            name={r.name}
            points={r.points}
          />
        ))}
      </div>
    </section>
  )
}
