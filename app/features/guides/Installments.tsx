import { Heading } from '@radix-ui/themes'
import { TextWithCommand } from '~/components/TextWithCommand'
import { useGuideContext } from './GuideContext'
import { type Installment } from './GuideData'
import { GuideSectionHeading } from './GuideSectionHeading'

type InstallmentsProps = {
  installments: Installment[]
}
export const Installments = ({ installments }: InstallmentsProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext()
  return (
    <section className="my-6 mb-10" id="installments">
      <GuideSectionHeading title="Installments" />
      {installments.map(({ name, description }) => (
        <section key={name} className="my-4">
          <Heading as="h3" mb="1" size="3">
            {name}
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
