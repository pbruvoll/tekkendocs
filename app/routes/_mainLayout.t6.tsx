import { data, href, type MetaFunction } from 'react-router';
import { CharacterGrid } from '~/components/CharacterGrid';
import { ContentContainer } from '~/components/ContentContainer';
import { Heading } from '~/components/ui/heading';
import { t6AvatarUrl, t6Characters } from '~/features/t6/t6Characters';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { generateMetaTags } from '~/utils/seoUtils';

export const loader = async () => {
  return data(null, {
    headers: getCacheControlHeaders({ seconds: 60 * 5 }),
  });
};

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 });

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    matches,
    title: 'Tekken 6 Frame Data | TekkenDocs',
    description: 'Frame data for all characters in Tekken 6',
    image: { url: '/t6/pages/frame-data.png' },
  });
};

export default function T6() {
  return (
    <ContentContainer enableBottomPadding>
      <Heading as="h1" size="5" className="mt-6 mb-4">
        Tekken 6
      </Heading>
      <CharacterGrid
        characterCards={t6Characters.map(({ id, displayName }) => ({
          name: displayName,
          imgSrc: t6AvatarUrl(id),
          url: href('/t6/:character', { character: id }),
        }))}
      />
      <p className="mt-6 text-sm text-muted-foreground">
        Tekken 6 BR frame data, converted from the japanese frame data sites
        inatekken and the Tekken 6 BR wiki.
      </p>
    </ContentContainer>
  );
}
