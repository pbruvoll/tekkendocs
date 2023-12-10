import { Badge, Heading } from '@radix-ui/themes'
import { json, type MetaFunction, type TypedResponse } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { CharacterCard } from '~/components/CharacterCard'
import { ContentContainer } from '~/components/ContentContainer'
import {
  getTekken7Characters,
  getTekken8Characters,
} from '~/services/dataService.server'
import type { GamePageData } from '~/types/GamePageData'

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
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    },
  )
}

export const meta: MetaFunction = () => {
  const title = 'TekkenDocs - Frame data and resources for Tekken'
  const description =
    'Frame data and resources for leveling up your skills in Tekken'
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
    { property: 'og:image', content: '/logo-512.png' },
  ]
}

export const headers = () => ({
  'Cache-Control': 'public, max-age=300, s-maxage=300',
})

export default function Index() {
  const { gamePageDataT7, gamePageDataT8 } = useLoaderData<typeof loader>()
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <h1 className="mb-4 text-2xl font-bold">TekkenDocs</h1>
      <p className="mb-4">Frame data and learning resources for Tekken</p>

      <Heading as="h2" mt="5" mb="4" size="5">
        Resources
      </Heading>
      <Link to="/matchvideo" className="cursor-pointer">
        <Badge size="2" style={{ cursor: 'pointer' }} variant="outline">
          Match videos
        </Badge>
      </Link>

      <Heading as="h2" mt="5" mb="2" size="5">
        <Link to="t8">Tekken 8</Link>
      </Heading>

      <p className="mb-4">
        Tekken is coming january 2024, so this section is work in progress
      </p>

      <ul className="flex flex-wrap gap-5">
        {gamePageDataT8.characterInfoList.map(({ id, displayName }) => (
          <li className="cursor-pointer" key={id}>
            <CharacterCard name={displayName} url={'/t8/' + id} />
          </li>
        ))}
      </ul>

      <Heading as="h2" mt="7" mb="4" size="5">
        <Link to="t7">Tekken 7</Link>
      </Heading>

      <ul className="flex flex-wrap gap-5">
        {gamePageDataT7.characterInfoList.map(({ id, displayName }) => (
          <li className="cursor-pointer" key={id}>
            <CharacterCard name={displayName} url={'/t7/' + id} />
          </li>
        ))}
      </ul>
    </ContentContainer>
  )
}
