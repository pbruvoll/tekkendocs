import { data, Link, useLoaderData } from 'react-router';
import { Heading } from '@/components/ui/heading';
import { CharacterGrid } from '~/components/CharacterGrid';
import { ContentContainer } from '~/components/ContentContainer';
import { getTekken7Characters } from '~/services/staticDataService';
import { type GamePageData } from '~/types/GamePageData';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { t7AvatarMap } from '~/utils/t7AvatarMap';

export const loader = async () => {
  return data<GamePageData>(
    { characterInfoList: getTekken7Characters() },
    {
      headers: getCacheControlHeaders({ seconds: 60 * 5 }),
    },
  );
};

export default function T7() {
  const { characterInfoList }: GamePageData = useLoaderData<typeof loader>();
  return (
    <ContentContainer>
      <Heading as="h2" size="5" className="mt-6 mb-4">
        <Link to="t7">Tekken 7</Link>
      </Heading>
      <CharacterGrid
        characterCards={characterInfoList.map(({ id, displayName }) => {
          const imgSrc = t7AvatarMap[id];
          return { name: displayName, imgSrc, url: `/t7/${id}` };
        })}
      />
    </ContentContainer>
  );
}
