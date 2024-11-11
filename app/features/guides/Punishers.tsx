import { Command } from '~/components/Command'
import { useGuideContext } from './GuideContext'
import { type Punisher } from './GuideData'
import { GuideSectionHeading } from './GuideSectionHeading'

type PunishersProps = {
  standing?: Punisher[]
}
export const Punishers = ({ standing }: PunishersProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext()
  return (
    <section id="punishers">
      <GuideSectionHeading title="Punishers" />
      {standing?.map(({ startup, command, description }, index) => (
        <div key={index} className="mb-2">
          {startup}{' '}
          <Command
            command={command}
            charUrl={charUrl}
            compressedCommandMap={compressedCommandMap}
          />{' '}
          {description ? `(${description})` : ''}
        </div>
      ))}
    </section>
  )
}
