import { Table } from '@radix-ui/themes';
import { useMemo } from 'react';
import {
  data,
  isRouteErrorResponse,
  type LoaderFunctionArgs,
  type MetaFunction,
  useLoaderData,
  useRouteError,
} from 'react-router';
import { Heading } from '@/components/ui/heading';
import { Commands } from '~/components/Commands';
import { ContentContainer } from '~/components/ContentContainer';
import { AppErrorBoundary } from '~/components/ErrorBoundary';
import { TextWithCommand } from '~/components/TextWithCommand';
import { tableIdToDisplayName } from '~/constants/tableIdToDisplayName';
import { getCharacterDisplayName } from '~/features/characterPage/characterDisplayName';
import { useFrameData } from '~/hooks/useFrameData';
import { type CharacterFrameData } from '~/types/CharacterFrameData';
import { type Move } from '~/types/Move';
import { type RouteHandle } from '~/types/RouteHandle';
import { getCharacterFromParams } from '~/utils/characterRoute.utils.server';
import { compressCommand } from '~/utils/commandUtils';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { generateMetaTags } from '~/utils/seoUtils';
import { getSheetService } from '~/utils/sheetServiceUtils.server';

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 });

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const character = getCharacterFromParams(params);
  if (['lidia', 'heihachi', 'mokujin'].includes(character)) {
    throw new Response(null, {
      status: 404,
      statusText: 'Character not found',
    });
  }
  const sheetService = getSheetService();
  const sheet = await sheetService.getCharacterData(
    'T8',
    character,
    'antiStrat',
  );

  const { editUrl, tables } = sheet;

  return data(
    { characterName: character, editUrl, tables, gameId: sheet.game },
    {
      headers: {
        ...getCacheControlHeaders({ seconds: 60 * 5 }),
      },
    },
  );
};

export const meta: MetaFunction = ({ params, matches }) => {
  const frameData = matches.find(
    (m) => (m.handle as RouteHandle)?.type === 'frameData',
  )?.loaderData;
  if (!frameData) {
    return [
      {
        title: 'TekkenDocs - Uknown character',
      },
      {
        description: `There is no character with the ID of ${params.character}.`,
      },
    ];
  }
  const { characterName } = frameData as CharacterFrameData;
  const characterId = characterName.toLocaleLowerCase();
  const characterTitle =
    characterName[0].toUpperCase() + characterName.substring(1);
  const title = `${characterTitle} Tekken 8 Anti Strat | TekkenDocs`;
  const description = `An overview of the most important information for for how to beat ${characterTitle} in Tekken 8. See the most important moves to punish, which side to to side step, strings to duck and much more`;

  return generateMetaTags({
    title,
    description,
    matches,
    image: { url: `/t8/avatars/${characterId}-512.png` },
    url: `/t8/${characterId}/antistrat`,
  });
};

export default function Index() {
  const { characterName, tables, gameId } = useLoaderData<typeof loader>();

  const { moves: frameData } = useFrameData();
  const compressedCommandMap = useMemo(() => {
    return frameData.reduce<Record<string, Move>>((prev, current) => {
      prev[compressCommand(current.command)] = current;
      return prev;
    }, {});
  }, [frameData]);

  const charUrl = `/${gameId.toLowerCase()}/${characterName}`;

  if (tables.length === 0) {
    return <div>Invalid or no data</div>;
  }

  return (
    <ContentContainer
      className="flex flex-wrap gap-2"
      enableBottomPadding
      disableXPadding
    >
      <h1 className="sr-only capitalize">
        {getCharacterDisplayName(characterName)} Tekken 8 Anti Strat
      </h1>
      {tables.map((table) => {
        const columnNums = (table.headers || table.rows[0]).map(
          (_, index) => index,
        );
        return (
          <section key={table.name} className="mt-8">
            <ContentContainer>
              <Heading as="h2" size="4" className="mb-4">
                {tableIdToDisplayName[table.name] || table.name}
              </Heading>
            </ContentContainer>
            <Table.Root variant="surface" style={{ width: '100%' }}>
              <Table.Body>
                {table.rows.map((row, i) => {
                  return (
                    <Table.Row key={i}>
                      {columnNums.map((j) => {
                        const cell = row[j] || '';
                        return (
                          <Table.Cell key={j}>
                            {characterName === 'asuka' ? (
                              <TextWithCommand
                                text={cell}
                                charUrl={charUrl}
                                compressedCommandMap={compressedCommandMap}
                              />
                            ) : (
                              <Commands
                                command={cell}
                                charUrl={charUrl}
                                compressedCommandMap={compressedCommandMap}
                              />
                            )}
                          </Table.Cell>
                        );
                      })}
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </section>
        );
      })}
    </ContentContainer>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="prose prose-invert p-4">
        <h1>Anti strats not found</h1>
        <p>
          There is no antistrat for this character. If you would like to make
          one, please get in touch in discord, github or on X.
        </p>
      </div>
    );
  }

  return <AppErrorBoundary />;
}
