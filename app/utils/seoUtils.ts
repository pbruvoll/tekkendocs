import { type MetaFunction } from 'react-router'
import { type LoaderData as RootLoaderData } from '~/root'

type GenerateMetaTagsOptions = {
  matches: { id: string; data?: unknown }[]
  title?: string
  image?: {
    url: string
  }
  url?: string
  description: string
}

export const generateMetaTags = ({
  title: titleOption,
  description: descriptionOption,
  image,
  matches,
}: GenerateMetaTagsOptions): ReturnType<MetaFunction> => {
  const match = matches.find(m => m.id === 'root')
  const rootData = match?.data as RootLoaderData
  const url = new URL(rootData.url)
  const origin = url.origin
  const title =
    titleOption || 'TekkenDocs - Frame data and resources for Tekken'
  const description =
    descriptionOption ||
    'Frame data and resources for leveling up your skills in Tekken'
  const imageUrl =
    origin + (image ? image?.url : '/images/tekkendocs-og-image-v2.png')
  const tags = [
    { title },
    {
      property: 'og:title',
      content: title,
    },
    {
      name: 'description',
      content: description,
    },
    { name: 'twitter:site', content: '@tekkendocs' },
    { name: 'twitter:creator', content: '@tekkendocs' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: imageUrl },

    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { property: 'twitter:image', content: imageUrl },
  ]

  if (url) {
    tags.push({ property: 'og:url', content: url.origin + url.pathname })
    tags.push({ property: 'twitter:url', content: url.origin + url.pathname })
  }

  return tags
}
