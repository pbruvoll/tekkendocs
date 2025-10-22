import { Heading } from '@radix-ui/themes';
import { data } from 'react-router';
import { Link, useLoaderData } from 'react-router';
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
      <Heading as="h2" mt="5" mb="4" size="5">
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
