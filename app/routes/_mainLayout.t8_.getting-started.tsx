import { type MetaFunction } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer'
import { generateMetaTags } from '~/utils/seoUtils'

export const meta: MetaFunction = ({ matches }) =>
  generateMetaTags({
    matches,
    title: 'Getting started with Tekken 8 | TekkenDocs',
    description: 'Learn how to get started with Tekken 8 as a new player',
    url: `/t8/getting-started`,
  })

export default function () {
  return (
    <ContentContainer
      enableTopPadding
      enableBottomPadding
      className="min-h-svh"
    >
      <h1 className="my-6 text-3xl">Getting started with Tekken 8</h1>
      <h2 className="mb-3 text-xl">Tekken 8 Complete Beginner Guide video</h2>
      <p className="mb-4">
        PhiDX has created a Tekken 8 complete beginner guide. It introduces all
        main concepts in Tekken 8. The video is around 30 minutes long.
      </p>
      <div className="relative mx-auto aspect-video">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube-nocookie.com/embed/D58LncnVbXM`}
          className="absolute left-0 top-0"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </ContentContainer>
  )
}
