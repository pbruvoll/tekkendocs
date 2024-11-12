import { Heading } from '@radix-ui/themes'
import { Command } from '~/components/Command'
import { TextWithCommand } from '~/components/TextWithCommand'
import { useGuideContext } from './GuideContext'
import { GuideSectionHeading } from './GuideSectionHeading'

type HeatSystemProps = {
  heatSystem: string[]
}
export const HeatSystem = ({ heatSystem }: HeatSystemProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext()
  return (
    <section className="my-6 mb-10" id="heat-system">
      <GuideSectionHeading title="Heat System" />
      <ul className="mt-2">
        {heatSystem.map((text, index) => (
          <li key={index} className="ms-4 list-outside list-disc p-1">
            <TextWithCommand
              text={text}
              charUrl={charUrl}
              compressedCommandMap={compressedCommandMap}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
