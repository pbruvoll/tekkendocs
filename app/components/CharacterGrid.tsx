import {
  CharacterCard,
  CharacterCard2,
  type CharacterCardProps,
} from '~/components/CharacterCard'

export type CharacterGridProps = {
  characterCards: CharacterCardProps[]
}
export const CharacterGrid = ({ characterCards }: CharacterGridProps) => {
  return (
    <ul className="xs:grid-cols-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      {characterCards.map(({ name, url, imgSrc }) => {
        return (
          <li className="cursor-pointer" key={name}>
            {imgSrc ? (
              <CharacterCard2 imgUrl={imgSrc} name={name} url={url} />
            ) : (
              <CharacterCard name={name} url={url} />
            )}
          </li>
        )
      })}
    </ul>
  )
}
