import { Heading } from '@radix-ui/themes'
import { Command } from '~/components/Command'
import { TextWithCommand } from '~/components/TextWithCommand'
import { type Move } from '~/types/Move'
import { type KeyMove } from './GuideData'

type KeyMovesProps = {
  moves: KeyMove[]
  title: string
  characterId: string
  gameId: string
  compressedCommandMap: Record<string, Move>
}
export const KeyMoves = ({
  moves,
  title,
  characterId,
  gameId,
  compressedCommandMap,
}: KeyMovesProps) => {
  const charUrl = `/${gameId}/${characterId}`
  return (
    <section className="my-4">
      <Heading as="h2" mb="4" size="4">
        {title}
      </Heading>
      {moves.map(({ command, description }) => (
        <section key={command} className="my-2 mb-4">
          <Heading as="h3" mb="1" size="3">
            <Command
              charUrl={charUrl}
              compressedCommandMap={compressedCommandMap}
              command={command}
            />
          </Heading>
          {description && (
            <TextWithCommand
              text={description}
              charUrl={charUrl}
              compressedCommandMap={compressedCommandMap}
            />
          )}
        </section>
      ))}
    </section>
  )
}
