import { Fragment } from 'react/jsx-runtime'
import { Link } from '@remix-run/react'
import { useAppState } from '~/hooks/useAppState'
import { commandToUrlSegment } from '~/utils/moveUtils'
import { t8AvatarMap } from '~/utils/t8AvatarMap'
import { rankGroups } from './_mainLayout.t8_.ranks'

type LowReactionMove = {
  characterId: string
  moveCommand: string
  mixupCommand: string
  startup: number
}

export default function () {
  const lowReactionMoves: LowReactionMove[] = [
    {
      characterId: 'feng',
      moveCommand: 'db+4',
      mixupCommand: '4~3',
      startup: 30,
    },
    {
      characterId: 'bryan',
      moveCommand: 'df+3',
      mixupCommand: 'b+1+4',
      startup: 29,
    },
    {
      characterId: 'law',
      moveCommand: 'db+4',
      mixupCommand: 'f+3+4',
      startup: 26,
    },
    {
      characterId: 'azucena',
      moveCommand: 'd+1+2',
      mixupCommand: 'db+3+4',
      startup: 25,
    },
    {
      characterId: 'claudio',
      moveCommand: 'db+3',
      mixupCommand: '3+4',
      startup: 24,
    },
    {
      characterId: 'king',
      moveCommand: 'db+3',
      mixupCommand: 'd+1+2',
      startup: 23,
    },
    {
      characterId: 'jack-8',
      moveCommand: 'db+2',
      mixupCommand: 'f+3+4',
      startup: 22,
    },
    {
      characterId: 'jin',
      moveCommand: 'd+2',
      mixupCommand: 'uf+3',
      startup: 21,
    },
  ]

  const [appState, setAppState] = useAppState()
  const completedLowBlock = appState.reactChallenge.completedLowBlocks

  const ranks = rankGroups.flatMap(rg => rg.ranks)

  return (
    <>
      <h1 className="my-4 text-2xl">Tekken 8 Reaction challenges</h1>
      <section>
        <h2 className="my-3 text-xl">Low Reaction challenge</h2>
        <p className="my-2">
          Set the computer to do the two moves randomly and action intervals to
          random. Try to block 10 moves in a row
        </p>
        <div className="grid grid-cols-[auto_auto_auto_auto_auto] items-center justify-items-center">
          <div>Level</div>
          <div>Startup</div>
          <div>Low</div>
          <div>Mid</div>
          <div>Completed</div>
          {lowReactionMoves.map(
            ({ characterId, mixupCommand, moveCommand, startup }, index) => (
              <Fragment key={characterId + moveCommand}>
                <div className="flex flex-row-reverse flex-wrap justify-center gap-x-2 place-self-start">
                  <img
                    className="max-h-16"
                    src={t8AvatarMap[characterId]}
                    alt={characterId}
                  />
                  <img
                    className="max-h-16"
                    src={ranks[index].image}
                    alt={ranks[index].name}
                  />
                </div>

                <div>
                  <div className="hidden md:block">{startup} frames</div>
                  <div className="md:hidden">i{startup}</div>
                </div>
                <div>
                  <Link
                    className="text-text-primary"
                    style={{ textDecoration: 'none' }}
                    to={
                      '/t8/' +
                      characterId +
                      '/' +
                      commandToUrlSegment(moveCommand)
                    }
                  >
                    {moveCommand}
                  </Link>
                </div>
                <div>
                  <Link
                    className="text-text-primary"
                    style={{ textDecoration: 'none' }}
                    to={
                      '/t8/' +
                      characterId +
                      '/' +
                      commandToUrlSegment(mixupCommand)
                    }
                  >
                    {mixupCommand}
                  </Link>
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <label htmlFor={`completed-${characterId}-${moveCommand}`}>
                      Completed
                    </label>{' '}
                    <input
                      id={`completed-${characterId}-${moveCommand}`}
                      type="checkbox"
                      onChange={e => {
                        const filtered = completedLowBlock.filter(
                          c => c !== moveCommand,
                        )
                        if (e.currentTarget.checked) {
                          filtered.push(moveCommand)
                        }
                        setAppState({
                          ...appState,
                          reactChallenge: {
                            ...appState.reactChallenge,
                            completedLowBlocks: filtered,
                          },
                        })
                      }}
                      checked={completedLowBlock.includes(moveCommand)}
                    />
                  </div>
                </div>
              </Fragment>
            ),
          )}
        </div>
      </section>
    </>
  )
}
