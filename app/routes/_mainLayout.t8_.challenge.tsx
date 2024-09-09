import { Fragment } from 'react/jsx-runtime'
import { VideoIcon } from '@radix-ui/react-icons'
import { Link, type MetaFunction } from '@remix-run/react'
import { ContentContainer } from '~/components/ContentContainer'
import { TrophyProgress } from '~/components/TrophyProgress'
import { useAppState } from '~/hooks/useAppState'
import { commandToUrlSegment } from '~/utils/moveUtils'
import { generateMetaTags } from '~/utils/seoUtils'
import { t8AvatarMap } from '~/utils/t8AvatarMap'
import { rankGroups } from './_mainLayout.t8_.ranks'

type LowReactionMove = {
  characterId: string
  moveCommand: string
  mixupCommand: string
  startup: number
  completed?: {
    name: string
    sosial?: string
    video: string
  }
}

export const meta: MetaFunction = ({ matches }) => {
  const title = 'Tekken 8 Challenges | TekkenDocs'
  const description = `A set of challenges to test your skills at Tekken 8. See how many low moves you can block on reaction`

  return generateMetaTags({
    matches,
    title,
    description,
    image: { url: `/t8/pages/challenge.png` },
    url: `/t8/challenge`,
  })
}

export default function () {
  const lowReactionMoves: LowReactionMove[] = [
    {
      characterId: 'lili',
      moveCommand: 'db+4',
      mixupCommand: 'uf+4',
      startup: 30,
      completed: {
        name: 'TekkenDocs',
        sosial: 'https://twitter.com/tekkendocs',
        video: 'https://www.youtube.com/watch?v=o_Ky7_Dd0Ss',
      },
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
      characterId: 'asuka',
      moveCommand: 'df+3+4',
      mixupCommand: 'f+3+4',
      startup: 28,
    },
    {
      characterId: 'dragunov',
      moveCommand: 'db+3',
      mixupCommand: 'b+3+4',
      startup: 27,
    },
    {
      characterId: 'raven',
      moveCommand: 'db+3',
      mixupCommand: 'b+3',
      startup: 28,
    },
    {
      characterId: 'eddy',
      moveCommand: 'db+3',
      mixupCommand: 'uf+3,3',
      startup: 28,
    },
    {
      characterId: 'law',
      moveCommand: 'db+4',
      mixupCommand: 'f+3+4',
      startup: 26,
    },
    {
      characterId: 'steve',
      moveCommand: 'db+2',
      mixupCommand: 'db+1+2',
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
      characterId: 'lars',
      moveCommand: 'd+1+2',
      mixupCommand: '1+2',
      startup: 24,
    },
    {
      characterId: 'jack-8',
      moveCommand: 'db+2',
      mixupCommand: 'f+3+4',
      startup: 22,
    },
    {
      characterId: 'zafina',
      moveCommand: 'd+3',
      mixupCommand: 'b+4',
      startup: 22,
    },
    {
      characterId: 'alisa',
      moveCommand: 'db+4',
      mixupCommand: 'd+2',
      startup: 24,
    },
    {
      characterId: 'xiaoyu',
      moveCommand: 'BT.d+4',
      mixupCommand: 'BT.f+1+2',
      startup: 24,
    },
    {
      characterId: 'jun',
      moveCommand: 'db+4,4,4',
      mixupCommand: 'u+4',
      startup: 22,
    },
    {
      characterId: 'kazuya',
      moveCommand: 'd+1+2',
      mixupCommand: 'uf,n,4',
      startup: 23,
    },
    {
      characterId: 'king',
      moveCommand: 'db+3',
      mixupCommand: 'uf+3',
      startup: 23,
    },
    {
      characterId: 'lee',
      moveCommand: 'HMS.4',
      mixupCommand: 'HMS.u+3',
      startup: 22,
    },

    {
      characterId: 'jin',
      moveCommand: 'd+2',
      mixupCommand: 'f+3,1',
      startup: 22,
    },
    {
      characterId: 'leo',
      moveCommand: 'df+2+3',
      mixupCommand: 'd+2',
      startup: 21,
      completed: {
        name: 'DeliLizard',
        sosial: 'https://www.youtube.com/@DeliLizard',
        video: 'https://www.youtube.com/watch?v=AO3LI6PSv1U',
      },
    },
  ]

  const [appState, setAppState] = useAppState()
  const completedLowBlock = appState.reactChallenge.completedLowBlocks

  const ranks = rankGroups.flatMap(rg => rg.ranks)

  const numCompleted = lowReactionMoves.filter(m => {
    const moveId = `${m.characterId}-${m.moveCommand}`
    return completedLowBlock.includes(moveId)
  }).length

  const completedPercentage = (numCompleted / lowReactionMoves.length) * 100

  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <h1 className="my-4 text-2xl">Tekken 8 Reaction challenges</h1>
      <section>
        <h2 className="my-3 text-xl">Low Reaction challenge</h2>
        <p className="my-3">
          Set the computer to do the two moves listed randomly and at a random
          intervall. Block at least <strong>12</strong> moves in a row to
          complete the challenge. See this{' '}
          <a
            className="text-text-primary underline underline-offset-2"
            href="https://www.youtube.com/watch?v=o_Ky7_Dd0Ss"
          >
            video
          </a>{' '}
          for an example.
        </p>
        <p className="my-3">
          If you are the first to complete a challenge, you can tweet us a link
          to a video where you complete it at{' '}
          <a
            className="underline-offset-2t text-text-primary underline"
            href="https://twitter.com/tekkendocs"
          >
            @tekkendocs
          </a>
          , and we'll add it to this site.
        </p>

        <div className="my-3 mb-4 flex items-center gap-3">
          <h3>Progress</h3>
          <div className="h-5 flex-grow rounded-3xl bg-text-primary-subtle ">
            <div
              className="h-full rounded-3xl bg-text-primary"
              style={{ width: completedPercentage + '%' }}
            />
          </div>
          <div>
            {numCompleted} / {lowReactionMoves.length}
          </div>
          <TrophyProgress
            progressPercentage={completedPercentage}
          ></TrophyProgress>
        </div>

        <div className="grid grid-cols-[auto_auto_auto] items-center justify-items-center">
          <div className="py-3">Level</div>
          <div className="flex flex-wrap justify-around gap-2 justify-self-stretch">
            <div>Startup</div>
            <div>Low / Mid</div>
          </div>

          <div>Completed</div>
          {lowReactionMoves.map(
            (
              { characterId, mixupCommand, moveCommand, startup, completed },
              index,
            ) => {
              const moveId = `${characterId}-${moveCommand}`
              return (
                <Fragment key={characterId + moveCommand}>
                  <div className="flex flex-row-reverse flex-wrap justify-center gap-x-2 place-self-start">
                    <Link to={'/t8/' + characterId}>
                      <img
                        className="max-h-16"
                        src={t8AvatarMap[characterId]}
                        alt={characterId}
                      />
                    </Link>
                    <img
                      className="max-h-16"
                      src={ranks[index].image}
                      alt={ranks[index].name}
                    />
                  </div>

                  <div className="flex flex-wrap justify-around gap-2 justify-self-stretch">
                    <div>
                      <div className="hidden md:block">{startup} frames</div>
                      <div className="md:hidden">i{startup}</div>
                    </div>
                    <div className="text-center">
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
                      </Link>{' '}
                      /{' '}
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
                  </div>
                  <div className="p-2">
                    <div className="flex flex-wrap justify-center gap-2">
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
                    {completed && (
                      <div className="mt-2 text-center text-xs">
                        First completed by{' '}
                        {completed.sosial ? (
                          <a href={completed.sosial}>{completed.name}</a>
                        ) : (
                          completed.name
                        )}{' '}
                        <Link
                          className="text-xl text-text-primary"
                          style={{ textDecoration: 'none' }}
                          to={completed.video}
                        >
                          <VideoIcon
                            className="inline"
                            width="1em"
                            height="1em"
                          />
                        </Link>
                      </div>
                    )}
                  </div>
                </Fragment>
              )
            },
          )}
        </div>
      </section>
    </ContentContainer>
  )
}
