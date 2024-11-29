import { Command } from '~/components/Command'
import { useGuideContext } from './GuideContext'
import { type ComboEnder } from './GuideData'
import { GuideSectionHeading } from './GuideSectionHeading'
import { formatCombo } from './guideUtils'

type ComboEndersProps = {
  comboEnders: ComboEnder[]
}
export const ComboEnders = ({ comboEnders }: ComboEndersProps) => {
  const carry = comboEnders.filter(c => c.type === 'carry')
  const floorBreak = comboEnders.filter(c => c.type === 'floor_break')
  const wallBreak = comboEnders.filter(c => c.type === 'wall_break')

  return (
    <section
      className="my-6 mb-10"
      id={'Combo Enders'.toLowerCase().replace(/ /g, '-')}
    >
      <GuideSectionHeading title="Combo enders" />
      <div className="flex gap-2 md:gap-4 lg:gap-8">
        {!!carry.length && <EnderList title="Carry" enders={carry} />}
        {!!floorBreak.length && (
          <EnderList title="Floor break" enders={floorBreak} />
        )}
        {!!wallBreak.length && (
          <EnderList title="Wall break" enders={wallBreak} />
        )}
      </div>
    </section>
  )
}

const EnderList = ({
  title,
  enders,
}: {
  title: string
  enders: { combo: string }[]
}) => {
  const { charUrl, compressedCommandMap } = useGuideContext()
  return (
    <section className="flex-grow">
      <div className="mb-2 bg-muted text-center">{title}</div>
      {enders?.map(({ combo }, index) => (
        <div key={index} className="mb-2">
          {combo.includes('>') ? (
            formatCombo(combo)
          ) : (
            <Command
              command={combo}
              charUrl={charUrl}
              compressedCommandMap={compressedCommandMap}
            />
          )}
        </div>
      ))}
    </section>
  )
}
