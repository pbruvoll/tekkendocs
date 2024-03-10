import { useMemo } from 'react'
import { Link, type MetaFunction } from '@remix-run/react'
import { ContentContainer } from '~/components/ContentContainer'
import charMoveCount from '~/data/character-move-count.json'
import { generateMetaTags } from '~/utils/seoUtils'
import { t8AvatarMap } from '~/utils/t8AvatarMap'

export const meta: MetaFunction = ({ matches }) =>
  generateMetaTags({
    matches,
    title: 'Moves per character Tekken 8 | TekkenDocs',
    description:
      'The page shows a sorted list of how many moves each character in Tekken 8 has',
    image: { url: `/t8/pages/stats.png` },
    url: `/t8/stats`,
  })

export default function () {
  const totalMove = charMoveCount.reduce<number>(
    (prev, current) => prev + current.value,
    0,
  )
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <h1 className="text-3xl">Tekken 8 statistics</h1>
      <h2 className="mt-3 text-lg">Moves per character</h2>
      <CharacterStatistics
        className="mt-3"
        characterStatistics={charMoveCount}
      />
      <div className="mt-5">
        Total <strong>{totalMove}</strong> moves
      </div>
      <p>
        The stats weere created by counting the number of entries in each
        characters movelist imported from wavu wiki. Each hit in a string counts
        as a separate move since it has its own frame data. Throws are included,
        but 10-hit strings are not. Some moves are basically the same for all
        characters like 2+3, 1+3 and 1+2+3+4. Also some commands are counted
        muliple times, since they have different properties in different
        situations, like genric throws connecting from the front, side or back{' '}
      </p>
    </ContentContainer>
  )
}

type CharacterStat = {
  name: string
  value: number
}
type CharactersStatisticsProps = {
  characterStatistics: CharacterStat[]
  className?: string
}

const CharacterStatistics = ({
  characterStatistics,
  className,
}: CharactersStatisticsProps) => {
  const max: number = useMemo(() => {
    return Math.max(...characterStatistics.map(c => c.value))
  }, [characterStatistics])
  const colorClassnames = [
    'bg-stone-400',
    'bg-orange-400',
    'bg-lime-400',
    'bg-cyan-400',
    'bg-gray-400',
    'bg-amber-400',
    'bg-purple-400',
    'bg-green-400',
    'bg-purple-400',
    'bg-rose-400',
  ]
  return (
    <div className={className}>
      <div className="grid grid-cols-[auto_1fr_auto] gap-2">
        {characterStatistics
          .sort((a, b) => b.value - a.value)
          .map(({ name, value }, index) => {
            return (
              <>
                <Link to={'/t8/' + name}>
                  <img
                    src={t8AvatarMap[name]}
                    className="aspect-square h-10"
                    alt={name}
                  />
                </Link>
                <div>
                  <div
                    className={
                      'h-full ' +
                      colorClassnames[index % colorClassnames.length]
                    }
                    style={{ width: `${(value * 100) / max}%` }}
                  />
                </div>
                <div className="self-center">{value}</div>
              </>
            )
          })}
      </div>
    </div>
  )
}
