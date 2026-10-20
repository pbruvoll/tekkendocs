import { type MetaFunction } from 'react-router';
import { type LoaderData as RootLoaderData } from '~/root';

type GenerateMetaTagsOptions = {
  matches: { id: string; loaderData?: unknown }[];
  title?: string;
  image?: {
    url: string;
  };
  /** Path of the page, relative to the origin. Defaults to the requested path. */
  url?: string;
  description: string;
};

const defaultImage = {
  url: '/images/tekkendocs-og-image-v3.jpg',
  width: 1200,
  height: 630,
};

export const generateMetaTags = ({
  title: titleOption,
  description: descriptionOption,
  image,
  url: urlOption,
  matches,
}: GenerateMetaTagsOptions): ReturnType<MetaFunction> => {
  const match = matches.find((m) => m.id === 'root');
  const rootData = match?.loaderData as RootLoaderData;
  const url = new URL(rootData.url);
  const origin = url.origin;
  const title =
    titleOption || 'TekkenDocs - Frame data and resources for Tekken';
  const description =
    descriptionOption ||
    'Frame data and resources for leveling up your skills in Tekken';
  const imagePath = image ? image.url : defaultImage.url;
  const imageUrl = origin + imagePath;
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
  ];

  if (imagePath === defaultImage.url) {
    tags.push(
      {
        property: 'og:image:width',
        content: defaultImage.width.toString(),
      },
      {
        property: 'og:image:height',
        content: defaultImage.height.toString(),
      },
    );
  }

  const pageUrl = origin + (urlOption || url.pathname);

  tags.push({ property: 'og:url', content: pageUrl });
  tags.push({ property: 'twitter:url', content: pageUrl });

  return tags;
};
