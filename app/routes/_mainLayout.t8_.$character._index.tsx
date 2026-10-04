import { type HeadersFunction, type MetaFunction } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer';
import { FrameDataSection } from '~/components/FrameDataSection';
import { getCharacterDisplayName } from '~/features/characterPage/characterDisplayName';
import { useFrameData } from '~/hooks/useFrameData';
import { type CharacterFrameDataPage } from '~/types/CharacterFrameDataPage';
import { type RouteHandle } from '~/types/RouteHandle';
import { filterToDescription, getFilterFromParams } from '~/utils/filterUtils';
import { filterMoves, sortMovesV2 } from '~/utils/frameDataUtils';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { charIdFromMove } from '~/utils/moveUtils';
import { generateMetaTags } from '~/utils/seoUtils';
import { getSortSettings } from '~/utils/sortingUtils';

export const headers: HeadersFunction = (args) => ({
  ...getCacheControlHeaders({ seconds: 60 * 5 }),
  'X-Td-Cachecontext': args.loaderHeaders.get('X-Td-Cachecontext') || 'none',
});

export function shouldRevalidate() {
  return false;
}

export const meta: MetaFunction = ({ params, matches, location }) => {
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

  const { characterName, moves } = frameData as CharacterFrameDataPage;
  const characterId = characterName.toLocaleLowerCase();
  const characterTitle =
    characterId === 'mokujin'
      ? 'All Characters'
      : characterName[0].toUpperCase() + characterName.substring(1);
  const title = `${characterTitle} Tekken 8 Frame Data | TekkenDocs`;

  let rowsDescription: string = '';
  // the the actual filtered and sorted frame data
  const searchParams = new URLSearchParams(location.search);

  const filter = getFilterFromParams(searchParams);

  const filteredMoves = filterMoves(moves, filter);

  // same sorting as the table itself, so that keys which are not a Move
  // property, such as interruptible, are described correctly
  const sortSettings = getSortSettings(searchParams);
  const sortedMoves = sortMovesV2(filteredMoves, sortSettings);

  const orderDesription = sortSettings
    ? `order by ${sortSettings.sortByKey} ${sortSettings.sortDirection}`
    : '';

  const filterStr = filterToDescription(filter);
  const filterDescription = filterStr ? `filter : ${filterStr}` : '';

  rowsDescription = [
    [orderDesription, filterDescription].filter(Boolean).join(', '),
    ['Command', 'Hit level', 'Damage', 'Block frame', 'Hit frame'].join(' | '),
  ]
    .concat(
      sortedMoves
        .slice(0, 9)
        .map(({ command, hitLevel, damage, block, hit, id }) =>
          [
            ...(characterId === 'mokujin' && id
              ? [charIdFromMove({ id })]
              : []),
            command,
            hitLevel,
            damage,
            block,
            hit,
          ].join(' | '),
        ),
    )
    .filter(Boolean)
    .join('\n');

  const description = `Frame data for ${characterTitle} in Tekken 8\n${rowsDescription}`;

  return generateMetaTags({
    matches,
    description,
    title,
    url: `/t8/${characterId}`,
    image: { url: `/t8/avatars/${characterId}-brand-512.png` },
  });
};

export default function Index() {
  const { tables, characterName, moves } = useFrameData();
  if (moves.length === 0) {
    return <div>Invalid or no data</div>;
  }
  return (
    <ContentContainer disableXPadding>
      <h1 className="sr-only capitalize">
        {getCharacterDisplayName(characterName)} Tekken 8 Frame Data
      </h1>
      {tables.map((table) => {
        if (table.headers && table.name === 'frames_normal') {
          return (
            <FrameDataSection
              key={table.name}
              gameRouteId="t8"
              charId={characterName === 'mokujin' ? undefined : characterName}
              moves={moves}
            />
          );
        }
        return <div key={table.name}>Unknown table name {table.name}</div>;
      })}
    </ContentContainer>
  );
}
