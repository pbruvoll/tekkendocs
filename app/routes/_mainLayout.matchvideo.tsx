import { useState } from 'react'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { Button } from '@radix-ui/themes'
import { json, type MetaFunction, type TypedResponse } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { ContentContainer } from '~/components/ContentContainer'
import type { MatchVideo, MatchVideoSet } from '~/types/MatchVideo'
import type { SpreadSheetDocName } from '~/types/SpreadSheetDocName'
import { cachified } from '~/utils/cache.server'
import { getSheet } from '~/utils/dataService.server'
import { getCacheControlHeaders } from '~/utils/headerUtils'
import { sheetToSections } from '~/utils/sheetUtils.server'

export const meta: MetaFunction = ({ data }) => {
  let image = 'https://i.ytimg.com/vi/dQ5hje6Fnfw/maxresdefault.jpg'
  if (data) {
    image = (data as LoaderData).matchVideoSets[0].videos[0].thumbnail || image
  }
  const title = 'Tournament videos from Tekken'
  const description =
    'A curated list of vidoes from the biggest Tekken tournaments'
  return [
    { title },
    { description },
    { property: 'og:title', content: title },
    { property: 'description', content: description },
    { property: 'og:description', content: description },
    {
      property: 'og:image',
      content: image,
    },
  ]
}

type LoaderData = {
  editUrl: string
  matchVideoSets: MatchVideoSet[]
}

export const loader = async (): Promise<TypedResponse<LoaderData>> => {
  const sheetDoc: SpreadSheetDocName = 'T7_MatchVideo'
  const { sheet } = await cachified({
    key: sheetDoc,
    ttl: 1000 * 30,
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 3,
    async getFreshValue() {
      const sheet = await getSheet('videos_match', sheetDoc)
      return { sheet }
    },
  })
  if (!sheet) {
    throw new Response(`Not able to find data for match videos`, {
      status: 500,
      statusText: 'server error',
    })
  }

  const { editUrl, rows } = sheet
  const sheetSections = sheetToSections(rows)
  const videoSection = sheetSections.find(s => s.sectionId === 'videos_match')
  if (!videoSection) {
    throw json('Not able to find match video section', { status: 404 })
  }

  const matchVideoSets = videoSection.rows
    .slice(1)
    .reduce<MatchVideoSet[]>((matchSetList, row) => {
      const setName = row[1]
      const matchVideo: MatchVideo = {
        url: row[0],
        name: row[2],
        type: row[3],
        description: row[4],
        result: row[5],
        characters: row[6],
        thumbnail: row[7],
        date: new Date(row[8]),
      }
      const prevSet: MatchVideoSet | undefined =
        matchSetList[matchSetList.length - 1]
      if (prevSet && (prevSet.setName === setName || !setName)) {
        prevSet.videos.push(matchVideo)
      } else {
        matchSetList.push({ setName, videos: [matchVideo] })
      }
      return matchSetList
    }, [])

  return json(
    { matchVideoSets, editUrl },
    {
      headers: getCacheControlHeaders({ seconds: 60 * 5 }),
    },
  )
}

export default function TournamentVideos() {
  const { matchVideoSets, editUrl } = useLoaderData<typeof loader>()
  const [setsToShow, setSetsToShow] = useState(3)
  return (
    <ContentContainer enableTopPadding>
      <div className="flex justify-between">
        <h1 className="mb-6 mt-4 text-4xl">Tournament videos</h1>
        <a
          className="flex items-center gap-2"
          style={{ color: 'var(--accent-a11' }}
          target="blank"
          href={editUrl}
        >
          <Pencil1Icon />
          Edit
        </a>
      </div>

      <div className="space-y-12">
        {matchVideoSets.slice(0, setsToShow).map(vSet => {
          return (
            <div className="space-y-8" key={vSet.setName}>
              <div>
                <h2 key={vSet.setName} className="mb-2 mt-6 text-2xl">
                  {vSet.setName}
                </h2>
                <div className="space-y-4">
                  {vSet.videos.map(vid => {
                    return (
                      <div key={vid.name}>
                        {vSet.videos.length > 1 && <h3>{vid.name}</h3>}
                        <iframe
                          width="560"
                          src={`https://www.youtube-nocookie.com/embed/${vid.url}`}
                          className="aspect-video max-w-full"
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {setsToShow < matchVideoSets.length && (
        <div className="mt-6">
          <Button onClick={() => setSetsToShow(prev => prev + 5)}>
            Show more
          </Button>
        </div>
      )}
    </ContentContainer>
  )
}
