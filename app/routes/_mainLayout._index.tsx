import { Badge, Heading } from '@radix-ui/themes'
import { json, type MetaFunction, type TypedResponse } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { CharacterGrid } from '~/components/CharacterGrid'
import { ContentContainer } from '~/components/ContentContainer'
import tekkenDocsLogo from '~/images/logo/tekkendocs.png'
import {
  getTekken7Characters,
  getTekken8Characters,
} from '~/services/staticDataService'
import type { GamePageData } from '~/types/GamePageData'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { t7AvatarMap } from '~/utils/t7AvatarMap'
import { t8AvatarMap } from '~/utils/t8AvatarMap'

type LoaderData = {
  gamePageDataT7: GamePageData
  gamePageDataT8: GamePageData
}
export const loader = async (): Promise<TypedResponse<LoaderData>> => {
  return json<LoaderData>(
    {
      gamePageDataT7: { characterInfoList: getTekken7Characters() },
      gamePageDataT8: { characterInfoList: getTekken8Characters() },
    },
    {
      headers: getCacheControlHeaders({ seconds: 60 * 5 }),
    },
  )
}

export const meta: MetaFunction = () => {
  const title = 'TekkenDocs - Frame data and resources for Tekken'
  const description =
    'Frame data and resources for leveling up your skills in Tekken'
  const image = '/images/tekkendocs-og-image.png'
  return [
    { title },
    {
      property: 'og:title',
      content: title,
    },
    {
      name: 'description',
      content: description,
    },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:type', content: 'website' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:domain', content: 'tekkendocs.com' },
    { property: 'twitter:url', content: 'https://tekkendocs.com' },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { property: 'twitter:image', content: image },
  ]
}

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 })

export default function Index() {
  const { gamePageDataT7, gamePageDataT8 } = useLoaderData<typeof loader>()
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <h1 className="sr-only mb-4 text-2xl font-bold">TekkenDocs</h1>
      <img
        src={tekkenDocsLogo}
        alt="TekkenDocs"
        width="567px"
        style={{
          maxWidth: '100%',
          aspectRatio: '6',
          marginLeft: '-4px',
          marginTop: '1rem',
        }}
      />
      <p className="mb-4">Frame data and learning resources for Tekken</p>

      <Heading as="h2" mt="5" mb="4" size="5">
        Resources
      </Heading>
      <Link to="/matchvideo" className="cursor-pointer">
        <Badge size="2" style={{ cursor: 'pointer' }} variant="outline">
          Match videos
        </Badge>
      </Link>

      <Heading as="h2" mt="7" mb="2" size="5">
        Tekken 8 Demo
      </Heading>

      <p className="mb-4">
        Tekken demo was release December 14th to PS5, so this section is still
        work in progress
      </p>

      <CharacterGrid
        characterCards={gamePageDataT8.characterInfoList
          .filter(c =>
            ['jin', 'nina', 'kazuya', 'paul'].some(demoChar =>
              c.id.startsWith(demoChar),
            ),
          )
          .map(({ id, displayName }) => {
            const imgSrc = t8AvatarMap[id]
            return { name: displayName, imgSrc, url: '/t8/' + id }
          })}
      />

      <Heading as="h2" mt="7" mb="2" size="5">
        <Link to="t8">Tekken 8</Link>
      </Heading>

      <p className="mb-4">
        Tekken is coming january 2024, so this section is work in progress
      </p>

      <CharacterGrid
        characterCards={gamePageDataT8.characterInfoList.map(
          ({ id, displayName }) => {
            const imgSrc = t8AvatarMap[id]
            return { name: displayName, imgSrc, url: '/t8/' + id }
          },
        )}
      />

      <Heading as="h2" mt="7" mb="4" size="5">
        <Link to="t7">Tekken 7</Link>
      </Heading>

      <CharacterGrid
        characterCards={gamePageDataT7.characterInfoList.map(
          ({ id, displayName }) => {
            const imgSrc = t7AvatarMap[id]
            return { name: displayName, imgSrc, url: '/t7/' + id }
          },
        )}
      />
    </ContentContainer>
  )
}
