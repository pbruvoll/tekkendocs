import { Filter } from 'lucide-react';
import { useState } from 'react';
import {
  data,
  href,
  Link,
  type LoaderFunctionArgs,
  type MetaFunction,
  useLoaderData,
} from 'react-router';
import { ContentContainer } from '~/components/ContentContainer';
import { FrameDataTable } from '~/components/FrameDataTable';
import { Heading } from '~/components/ui/heading';
import { Input } from '~/components/ui/input';
import { StanceKey } from '~/features/t6/StanceKey';
import { getT6Character } from '~/features/t6/t6Characters';
import { getT6FrameData } from '~/features/t6/t6FrameData.server';
import { cleanCommand } from '~/utils/filterUtils';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { generateMetaTags } from '~/utils/seoUtils';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const characterId = params.character || '';
  const { frames: table, stances } = await getT6FrameData(characterId);
  const character = getT6Character(characterId);
  return data(
    { character, table, stances },
    { headers: getCacheControlHeaders({ seconds: 60 * 5 }) },
  );
};

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 });

export const meta: MetaFunction<typeof loader> = ({ loaderData, matches }) => {
  const name = loaderData?.character?.displayName || 'Unknown character';
  return generateMetaTags({
    matches,
    title: `${name} Tekken 6 Frame Data | TekkenDocs`,
    description: `Frame data for ${name} in Tekken 6`,
    image: { url: '/t6/pages/frame-data.png' },
  });
};

const toSearchableCommand = (command: string) =>
  cleanCommand(command.replace(/ /g, '')).replace(/ /g, '');

export default function T6Character() {
  const { character, table, stances } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState('');

  const searchableQuery = toSearchableCommand(searchQuery);
  const filteredRows = searchableQuery
    ? table.rows.filter((row) =>
        toSearchableCommand(row[0] || '').includes(searchableQuery),
      )
    : table.rows;

  return (
    <>
      <ContentContainer enableTopPadding>
        <Link className="text-sm text-primary" to={href('/t6')}>
          ← Character select
        </Link>
        <Heading as="h1" className="mt-2 mb-3">
          {character?.displayName}
        </Heading>
        <StanceKey stances={stances} />
        <div className="mb-3 flex items-center gap-2">
          <Filter />
          <Input
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ff2,1+2"
          />
        </div>
      </ContentContainer>
      <ContentContainer disableXPadding enableBottomPadding>
        <FrameDataTable
          table={{ ...table, rows: filteredRows }}
          linkCommands={false}
        />
      </ContentContainer>
    </>
  );
}
