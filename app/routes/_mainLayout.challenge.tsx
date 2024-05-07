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
      characterId: 'lili',
      moveCommand: 'db+4',
      mixupCommand: 'uf+4',
      startup: 30,
    },
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
      characterId: 'raven',
      moveCommand: 'db+3',
      mixupCommand: 'b+3',
      startup: 28,
    },
    {
      characterId: 'dragunov',
      moveCommand: 'db+3',
      mixupCommand: 'b+3+4',
      startup: 27,
    },
    {
      characterId: 'law',
      moveCommand: 'db+4',
      mixupCommand: 'f+3+4',
      startup: 26,
    },
    {
      characterId: 'yoshimitsu',
      moveCommand: 'db+1',
      mixupCommand: '4~3',
      startup: 26,
    },
    {
      characterId: 'kuma',
      moveCommand: 'HBS.b+1+2',
      mixupCommand: 'HBS.3+4',
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
      characterId: 'nina',
      moveCommand: 'd,DF+4',
      mixupCommand: 'db+2',
      startup: 24,
    },
    {
      characterId: 'eddy',
      moveCommand: 'FC.df+4',
      mixupCommand: 'ws3+4',
      startup: 24,
    },
    {
      characterId: 'jun',
      moveCommand: 'db+2',
      mixupCommand: 'df+3+4',
      startup: 24,
    },
    {
      characterId: 'xiaoyu',
      moveCommand: 'BT.d+4',
      mixupCommand: 'BT.f+1+2',
      startup: 24,
    },
    {
      characterId: 'lars',
      moveCommand: 'd+1+2',
      mixupCommand: '1+2',
      startup: 24,
    },
    {
      characterId: 'alisa',
      moveCommand: 'db+4',
      mixupCommand: 'd+2',
      startup: 24,
    },
    {
      characterId: 'kazuya',
      moveCommand: 'd+1+2',
      mixupCommand: 'b+1+2',
      startup: 23,
    },
    {
      characterId: 'king',
      moveCommand: 'db+3',
      mixupCommand: 'd+1+2',
      startup: 23,
    },
    {
      characterId: 'zafina',
      moveCommand: 'd+3',
      mixupCommand: 'b+4',
      startup: 22,
    },
    {
      characterId: 'lee',
      moveCommand: 'HMS.4',
      mixupCommand: 'HMS.u+3',
      startup: 22,
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
      startup: 22,
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
            ({ characterId, mixupCommand, moveCommand, startup }, index) => {
              const moveId = `${characterId}-${moveCommand}`
              return (
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
                      <label htmlFor={`completed-${moveId}`}>Completed</label>{' '}
                      <input
                        id={`completed-${moveId}`}
                        type="checkbox"
                        onChange={e => {
                          const filtered = completedLowBlock.filter(
                            c => c !== moveId,
                          )
                          if (e.currentTarget.checked) {
                            filtered.push(moveId)
                          }
                          setAppState({
                            ...appState,
                            reactChallenge: {
                              ...appState.reactChallenge,
                              completedLowBlocks: filtered,
                            },
                          })
                        }}
                        checked={completedLowBlock.includes(moveId)}
                      />
                    </div>
                  </div>
                </Fragment>
              )
            },
          )}
        </div>
      </section>
    </>
  )
}
