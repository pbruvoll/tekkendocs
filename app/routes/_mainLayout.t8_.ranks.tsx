import { Card } from '@radix-ui/themes'
import { type MetaFunction } from '@remix-run/node'
import { ContentContainer } from '~/components/ContentContainer'
import beginner from '~/images/t8/ranks/beginner.png'
import bushin from '~/images/t8/ranks/bushin.png'
import combatant from '~/images/t8/ranks/combatant.png'
import fighter from '~/images/t8/ranks/fighter.png'
import firstDan from '~/images/t8/ranks/first-dan.png'
import fujin from '~/images/t8/ranks/fujin.png'
import kisin from '~/images/t8/ranks/kishin.png'
import raijin from '~/images/t8/ranks/raijin.png'
import secondDan from '~/images/t8/ranks/second-dan.png'
import strategist from '~/images/t8/ranks/strategist.png'
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
    name: 'Blue',
    ranks: [
      {
        name: 'Fujin',
        points: 457,
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
]

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    title: 'Tekken 8 ranks',
    description: 'A list of all ranks in tekken 8',
    matches,
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
    <Card className="max-w-[12rem] flex-1">
      <img src={image} className="aspect-[2] w-full" alt={name} />
      <div className="mt-2 flex flex-wrap justify-center gap-2 gap-x-10">
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
      <div className="mt-3 flex flex-wrap gap-2">
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
