import { Heading } from '@radix-ui/themes'
import { Command } from '~/components/Command'
import { TextWithCommand } from '~/components/TextWithCommand'
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
    <section className="my-6 mb-10">
      <GuideSectionHeading title={title} />
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
