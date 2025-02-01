import { Heading } from '@radix-ui/themes'
import { Commands } from '~/components/Commands'
import { TextWithCommand } from '~/components/TextWithCommand'
import { type Move } from '~/types/Move'
import { compressCommand } from '~/utils/commandUtils'
import { useGuideContext } from './GuideContext'
import { type KeyMove } from './GuideData'
import { GuideSectionHeading } from './GuideSectionHeading'

type KeyMovesProps = {
  moves: KeyMove[]
  title: string
}
export const KeyMoves = ({ moves, title }: KeyMovesProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext()
  return (
    <section className="my-6 mb-10" id={title.toLowerCase().replace(/ /g, '-')}>
      <GuideSectionHeading title={title} />
      {moves.map(({ command, description }) => (
        <section key={command} className="my-2 mb-4">
          <Heading as="h3" mb="1" size="3">
            <Commands
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
          <MoveSummary
            command={command}
            compressedCommandMap={compressedCommandMap}
          />
        </section>
      ))}
    </section>
  )
}

const MoveSummary = ({
  command,
  compressedCommandMap,
}: {
  command: string
  compressedCommandMap: Record<string, Move>
}) => {
  const move = compressedCommandMap[compressCommand(command.split(' | ')[0])]
  if (!move) return null
  return (
    <div className="text-sm text-muted-foreground">
      {[
        move.hitLevel && move.hitLevel,
        move.startup && move.startup.split(',')[0],
        move.block && `${move.block} oB`,
        move.hit && `${move.hit} oH`,
        move.counterHit && `${move.counterHit} oCH`,
      ]
        .filter(Boolean)
        .join(', ')}
    </div>
  )
}
