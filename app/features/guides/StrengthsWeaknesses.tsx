import { Heading } from '@radix-ui/themes'
import cx from 'classix'
import { TextWithCommand } from '~/components/TextWithCommand'
import { useGuideContext } from './GuideContext'

type CoreProps = {
  section: string[]
  type: 'strength' | 'weakness'
}
const Core = ({ section, type }: CoreProps) => {
  const { charUrl, compressedCommandMap } = useGuideContext()
  return (
    <section className="mb-4">
      <Heading
        as="h2"
        size="4"
        className={cx(
          type === 'strength' ? 'bg-[#005500]' : 'bg-[#440000]',
          'p-2 text-white',
        )}
      >
        {type === 'strength' ? 'Strengths' : 'Weaknesses'}
      </Heading>
      <ul className="mt-2">
        {section.map((section, index) => (
          <li key={index} className="list-inside list-disc p-1">
            <TextWithCommand
              text={section}
              charUrl={charUrl}
              compressedCommandMap={compressedCommandMap}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

type StrengthsWeaknessesProps = {
  strengths?: string[]
  weaknesses?: string[]
}

export const StrengthsWeaknesses = ({
  strengths,
  weaknesses,
}: StrengthsWeaknessesProps) => {
  return (
    <section className="grid-cols-2 gap-2 md:grid">
      {strengths?.length && <Core section={strengths} type="strength" />}
      {weaknesses?.length && <Core section={weaknesses} type="weakness" />}
    </section>
  )
}
