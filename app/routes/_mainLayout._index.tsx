import { Badge, Heading } from '@radix-ui/themes'
import { json, type MetaFunction, type TypedResponse } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { CharacterGrid } from '~/components/CharacterGrid'
import { ContentContainer } from '~/components/ContentContainer'
import tekkenDocsLogoLarge from '~/images/logo/tekkendocs-logo-large.svg'
import {
  getTekken7Characters,
  getTekken8Characters,
} from '~/services/staticDataService'
import type { GamePageData } from '~/types/GamePageData'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { generateMetaTags } from '~/utils/seoUtils'
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

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    matches,
    description:
      'Frame data and resources for leveling up your skills in Tekken',
    image: { url: '/images/tekkendocs-og-image-v2.png' },
    title: 'TekkenDocs - Frame data and resources for Tekken',
    url: '',
  })
}

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 })

export default function Index() {
  const { gamePageDataT7, gamePageDataT8 } = useLoaderData<typeof loader>()
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <h1 className="sr-only mb-4 text-2xl font-bold">TekkenDocs</h1>
      <img
        src={tekkenDocsLogoLarge}
        alt="TekkenDocs"
        width="567px"
        style={{
          maxWidth: '100%',
          aspectRatio: '6',
          marginLeft: '-4px',
          marginTop: '1rem',
        }}
      />
      <p className="mb-4 mt-2">Frame data and learning resources for Tekken</p>

      <Heading as="h2" mt="5" mb="4" size="5">
        Resources
      </Heading>
      <Link to="/matchvideo" className="cursor-pointer">
        <Badge size="2" style={{ cursor: 'pointer' }} variant="outline">
          Match videos
        </Badge>
      </Link>

      <Heading as="h2" mt="7" mb="2" size="5">
        <Link to="t8">Tekken 8</Link>
      </Heading>

      <p className="mb-4">
        Tekken was release january 26th 2024. We already have frame data for
        several characters, and working on the rest
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
