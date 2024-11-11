import { Heading } from '@radix-ui/themes'
import cx from 'classix'
import { TextWithCommand } from '~/components/TextWithCommand'
import { type Move } from '~/types/Move'

type CoreProps = {
  section: string[]
  type: 'strength' | 'weakness'
  characterId: string
  gameId: string
  compressedCommandMap: Record<string, Move>
}
const Core = ({
  section,
  type,
  gameId,
  characterId,
  compressedCommandMap,
}: CoreProps) => {
  const charUrl = `/${gameId}/${characterId}`
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
  characterId: string
  gameId: string
  compressedCommandMap: Record<string, Move>
}

export const StrengthsWeaknesses = ({
  strengths,
  weaknesses,
  characterId,
  compressedCommandMap,
  gameId,
}: StrengthsWeaknessesProps) => {
  return (
    <section className="grid-cols-2 gap-2 md:grid">
      {strengths?.length && (
        <Core
          section={strengths}
          type="strength"
          characterId={characterId}
          gameId={gameId}
          compressedCommandMap={compressedCommandMap}
        />
      )}
      {weaknesses?.length && (
        <Core
          section={weaknesses}
          type="weakness"
          characterId={characterId}
          gameId={gameId}
          compressedCommandMap={compressedCommandMap}
        />
      )}
    </section>
  )
}
