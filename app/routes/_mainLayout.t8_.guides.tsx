import { type HeadersFunction, type MetaFunction } from '@remix-run/node'
import { CharacterGrid } from '~/components/CharacterGrid'
import { ContentContainer } from '~/components/ContentContainer'
import {
  characterGuideAuthors,
  getTekken8Characters,
} from '~/services/staticDataService'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { generateMetaTags } from '~/utils/seoUtils'
import { t8GuideImgSmallMap } from '~/utils/t8GuideImgSmallMap'

export const headers: HeadersFunction = () => ({
  ...getCacheControlHeaders({ seconds: 60 * 5 }),
})

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    matches,
    title: 'Tekken Guides | TekkenDocs',
    description:
      'Guides for Tekken 8 characters. The guides are written by high skilled players and include key moves, combos, punishers, frametraps, defensive tips and more',
    image: { url: `/t8/pages/character-guides.png` },
    url: `/t8/guides`,
  })
}

export default function () {
  const characterInfoList = getTekken8Characters()
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <h1 className="my-4 text-2xl">Tekken 8 Guides</h1>
      <section>
        <h2 className="my-3 text-xl">Character Guides</h2>
        <p className="mb-6">
          The character guides are written by high skilled players and are a
          good starting points for learning how to play with or against a
          character. The guides include information like overview, strengths,
          weaknesses, top 10 moves, combos, punishers, frametraps, notabable
          moves, defensive tips and more.
        </p>

        <CharacterGrid
          size="large"
          characterCards={characterInfoList
            .filter(({ id }) => characterGuideAuthors['T8'][id])
            .map(({ id, displayName }) => {
              const imgSrc = t8GuideImgSmallMap[id]
              return {
                name: displayName,
                author: characterGuideAuthors['T8'][id],
                size: 'large',
                imgSrc,
                url: '/t8/' + id + '/guide',
              }
            })}
        />
      </section>
    </ContentContainer>
  )
}
