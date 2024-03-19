import { Fragment, useMemo } from 'react'
import { Link, type MetaFunction, useSearchParams } from '@remix-run/react'
import cx from 'classix'
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
  const landscape = useSearchParams()[0].get('landscape') !== null
  return (
    <>
      <ContentContainer enableTopPadding>
        <h1 className="text-3xl">Tekken 8 statistics</h1>
        <h2 className="mt-3 text-lg">Moves per character</h2>
      </ContentContainer>
      <ContentContainer disableMaxWidth={landscape}>
        <CharacterStatistics
          landscape={landscape}
          className="mt-3"
          characterStatistics={charMoveCount}
        />{' '}
      </ContentContainer>{' '}
      <ContentContainer enableBottomPadding>
        <div className="mt-5">
          Total <strong>{totalMove}</strong> moves
        </div>
        <p>
          The stats weere created by counting the number of entries in each
          characters movelist imported from wavu wiki. Each hit in a string
          counts as a separate move since it has its own frame data. Throws are
          included, but 10-hit strings are not. Some moves are basically the
          same for all characters like 2+3, 1+3 and 1+2+3+4. Also some commands
          are counted muliple times, since they have different properties in
          different situations, like genric throws connecting from the front,
          side or back. Panda and Kuma are counted as separate characters{' '}
        </p>
      </ContentContainer>
    </>
  )
}

type CharacterStat = {
  name: string
  value: number
}
type CharactersStatisticsProps = {
  characterStatistics: CharacterStat[]
  className?: string
  landscape?: boolean
}

const CharacterStatistics = ({
  characterStatistics,
  className,
  landscape,
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
      <div
        className={cx(
          'grid gap-2',
          landscape
            ? 'h-[40rem] grid-flow-col grid-rows-[1fr_auto_auto]'
            : 'grid-cols-[auto_1fr_auto]',
        )}
      >
        {characterStatistics
          .sort((a, b) => b.value - a.value)
          .map(({ name, value }, index) => {
            if (landscape) {
              return (
                <Fragment key={name}>
                  <div className="flex flex-col justify-end">
                    <div
                      className={
                        colorClassnames[index % colorClassnames.length]
                      }
                      style={{ height: `${(value * 100) / max}%` }}
                    />
                  </div>
                  <Link to={'/t8/' + name}>
                    <img
                      src={t8AvatarMap[name]}
                      className="aspect-square h-10"
                      alt={name}
                    />
                  </Link>

                  <div className="self-center">{value}</div>
                </Fragment>
              )
            }
            return (
              <Fragment key={name}>
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
              </Fragment>
            )
          })}
      </div>
    </div>
  )
}
