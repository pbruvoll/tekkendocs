import { Heading } from '@radix-ui/themes'
import { TextWithCommand } from '~/components/TextWithCommand'
import { useGuideContext } from './GuideContext'
import { type DefensiveTip } from './GuideData'
import { GuideSectionHeading } from './GuideSectionHeading'

type DefensiveTipsProps = {
  tips: DefensiveTip[]
}
export const DefensiveTips = ({ tips }: DefensiveTipsProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext()
  return (
    <section className="my-6 mb-10" id="defensive-tips">
      <GuideSectionHeading title="Defensive tips" />
      {tips.map(({ title, description }) => (
        <section key={title} className="my-2 mb-4">
          <Heading as="h3" mb="1" size="3">
            {title}
          </Heading>

          <TextWithCommand
            text={description}
            charUrl={charUrl}
            compressedCommandMap={compressedCommandMap}
          />
        </section>
      ))}
    </section>
  )
}
