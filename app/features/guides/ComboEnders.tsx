import { type ComboEnder } from './GuideData'
import { GuideSectionHeading } from './GuideSectionHeading'
import { formatCombo } from './guideUtils'

type ComboEndersProps = {
  combosEnders: ComboEnder[]
}
export const ComboEnders = ({ combosEnders }: ComboEndersProps) => {
  return (
    <section
      className="my-6 mb-10"
      id={'Combo Enders'.toLowerCase().replace(/ /g, '-')}
    >
      <GuideSectionHeading title="Combo enders" />
      {combosEnders.map(({ combo, type }, index) => (
        <div key={index}>
          {type} {formatCombo(combo)}
        </div>
      ))}
    </section>
  )
}
