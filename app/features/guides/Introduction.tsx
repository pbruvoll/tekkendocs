import { TextWithCommand } from '~/components/TextWithCommand'
import { useGuideContext } from './GuideContext'
import { GuideSectionHeading } from './GuideSectionHeading'

type IntroductionProps = {
  sections: string[]
}
export const Introduction = ({ sections }: IntroductionProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext()
  return (
    <section id="introduction" className="my-6 mb-10">
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
