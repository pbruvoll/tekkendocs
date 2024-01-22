import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { getSheet } from '~/services/googleSheetService.server'
import { type MatchVideo, type MatchVideoSet } from '~/types/MatchVideo'
import { type SpreadSheetDocName } from '~/types/SpreadSheetDocName'
import { cachified } from '~/utils/cache.server'
import { sheetToSections } from '~/utils/sheetUtils.server'

function escapeCdata(s: string) {
  return s.replace(/\]\]>/g, ']]]]><![CDATA[>')
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const getMatchVidoeSets = async () => {
  //copy paste from loader in _mainLayout.matchvideo for now
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

  const { rows } = sheet
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

  return matchVideoSets
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const matchSets = await getMatchVidoeSets()
  const matchVidoes: MatchVideo[] = matchSets.map(vSet => {
    return { ...vSet.videos[0], name: `${vSet.setName} ${vSet.videos[0].name}` }
  })

  const host =
    request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')
  if (!host) {
    throw new Error('Could not determine domain URL.')
  }
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const domain = `${protocol}://${host}`
  const rssUrl = `${domain}/rss/matchvideo`

  const rssString = `
    <rss xmlns:blogChannel="${rssUrl}" version="2.0">
      <channel>
        <title>TekkenDocs Match Videos</title>
        <link>https://tekkendocs.com</link>
        <description>See the latest match videos from Tekken</description>
        <language>en-us</language>
        <category>Video Game</category>
        <image>
          <url>https://tekkendocs.com/images/tekkendocs-og-image.png</url>
          <title>tekkendocs.com</title>
          <link>https://tekkendocs.com</link>
        </image> 
        <ttl>60</ttl>
        ${matchVidoes
          .map(matchVideo =>
            `
            <item>
              <title><![CDATA[${escapeCdata(matchVideo.name)}]]></title>
              <description><![CDATA[Video from ${escapeHtml(
                matchVideo.name,
              )}]]></description>
              <pubDate>${matchVideo.date}</pubDate>
              <link>https://www.youtube.com/watch?v${matchVideo.url}</link>
              <guid>${rssUrl}/${matchVideo.url}</guid>
            </item>
          `.trim(),
          )
          .join('\n')}
      </channel>
    </rss>
  `.trim()

  return new Response(rssString, {
    headers: {
      'Cache-Control': `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24}`,
      'Content-Type': 'application/xml',
      'Content-Length': String(Buffer.byteLength(rssString)),
    },
  })
}
