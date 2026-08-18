import { type MetaFunction } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer';
import { ModList } from '~/features/mods/components/ModList';
import { ModsDisclaimer } from '~/features/mods/components/ModsDisclaimer';
import { SuggestModNote } from '~/features/mods/components/SuggestModNote';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { generateMetaTags } from '~/utils/seoUtils';

export const meta: MetaFunction = ({ matches }) =>
  generateMetaTags({
    matches,
    title: 'Useful Tekken 8 mods | TekkenDocs',
    description:
      'A list of useful community mods for Tekken 8, including practice mode tools and performance mods',
    url: `/t8/mods`,
  });

export const headers = () => getCacheControlHeaders({ seconds: 60 * 60 });

export default function Mods() {
  return (
    <ContentContainer enableTopPadding enableBottomPadding>
      <h1 className="my-6 text-3xl">Useful mods</h1>
      <p className="mb-4">
        Mods made by the community that are useful when learning and practicing
        Tekken 8.
      </p>
      <ModsDisclaimer />
      <div className="mt-6">
        <ModList />
      </div>
      <div className="mt-8">
        <SuggestModNote />
      </div>
    </ContentContainer>
  );
}
