import { data, type MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'
import { CharacterGrid } from '~/components/CharacterGrid'
import { ContentContainer } from '~/components/ContentContainer'
import { getTekken8Characters } from '~/services/staticDataService'
import { type GamePageData } from '~/types/GamePageData'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { generateMetaTags } from '~/utils/seoUtils'
import { t8AvatarMap } from '~/utils/t8AvatarMap'

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    matches,
    title: 'TekkenDocs | Flash cards',
    description: 'Flash cards for Tekken 8',
    image: { url: `/images/tekkendocs-og-image-v2.png` },
    url: `/t8/flashcard`,
  })
}

type LoaderData = {
  gamePageDataT8: GamePageData
}
export const loader = async () => {
  return data<LoaderData>(
    {
      gamePageDataT8: { characterInfoList: getTekken8Characters() },
    },
    {
      headers: getCacheControlHeaders({ seconds: 60 * 5 }),
    },
  )
}

export default function () {
  const { gamePageDataT8 } = useLoaderData<typeof loader>()
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <h1 className="my-4 text-2xl">Tekken 8 flash cards</h1>
      <section>
        <h2 className="my-3 text-xl">How it works</h2>
        <p className="mb-2">
          A flash card shows a move on the front side. Your job is to guess a
          property of the move, for example how many frames it is on block. Then
          you flip the card and check if your guess was correct. Cards marked as
          "Wrong" will be shown again sooner than cards marked as "Correct".
          Cards marked as "Ignore" will never be shown again.
        </p>
      </section>

      <CharacterGrid
        characterCards={gamePageDataT8.characterInfoList.map(
          ({ id, displayName }) => {
            const imgSrc = t8AvatarMap[id]
            return {
              name: displayName,
              imgSrc,
              url: `/t8/${id}/flashcard`,
            }
          },
        )}
      />
    </ContentContainer>
  )
}
