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
    <ul className="xs:grid-cols-5 xs:gap-x-2 grid grid-cols-4 gap-x-1 gap-y-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9">
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
