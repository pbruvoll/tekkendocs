import { Heading } from '@radix-ui/themes'
import { TextWithCommand } from '~/components/TextWithCommand'
import { type Move } from '~/types/Move'

type IntroductionProps = {
  sections: string[]
  characterId: string
  gameId: GameId
  compressedCommandMap: Record<string, Move>
}
export const Introduction = ({
  sections,
  characterId,
  gameId,
  compressedCommandMap,
}: IntroductionProps) => {
  const charUrl = `/${gameId}/${characterId}`
  return (
    <section className="my-4">
      <Heading as="h2" mb="4" size="4">
        Introduction
      </Heading>
      {sections.map((section, index) => (
        <p key={index} className="my-2 mb-4">
          <TextWithCommand
            text={section}
            charUrl={charUrl}
            compressedCommandMap={compressedCommandMap}
          />
        </p>
      ))}
    </section>
  )
}
