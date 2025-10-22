import { Heading } from '@radix-ui/themes';
import { data } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { CharacterGrid } from '~/components/CharacterGrid';
import { ContentContainer } from '~/components/ContentContainer';
import { getTekken8Characters } from '~/services/staticDataService';
import { type GamePageData } from '~/types/GamePageData';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { t8AvatarMap } from '~/utils/t8AvatarMap';

export const loader = async () => {
  return data<GamePageData>(
    { characterInfoList: getTekken8Characters() },
    {
      headers: getCacheControlHeaders({ seconds: 60 * 5 }),
    },
  );
};

export default function T8() {
  const { characterInfoList }: GamePageData = useLoaderData<typeof loader>();
  return (
    <ContentContainer>
      <Heading as="h2" mt="5" mb="4" size="5">
        <Link to="t7">Tekken 8</Link>
      </Heading>
      <CharacterGrid
        characterCards={characterInfoList.map(({ id, displayName }) => {
          const imgSrc = t8AvatarMap[id];
          return { name: displayName, imgSrc, url: `/t8/${id}` };
        })}
      />
    </ContentContainer>
  );
}
