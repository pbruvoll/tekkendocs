import { Heading } from '@radix-ui/themes'
import { TextWithCommand } from '~/components/TextWithCommand'
import { type Move } from '~/types/Move'
import { GuideSectionHeading } from './GuideSectionHeading'

type IntroductionProps = {
  sections: string[]
  characterId: string
  gameId: string
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
    <section className="my-6 mb-10">
      <GuideSectionHeading title="Introduction" />
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
