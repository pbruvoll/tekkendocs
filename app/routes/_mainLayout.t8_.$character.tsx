import {
  data,
  Outlet,
  type ShouldRevalidateFunctionArgs,
  useMatches,
} from 'react-router';
import { environment } from '~/constants/environment.server';
import { CharacterPageHeader } from '~/features/characterPage/CharacterPageHeader';
import { loadFrameDataWithCache } from '~/features/clientCache/frameDataCache';
import { applyOverrideSheet } from '~/features/overrideSheet/applyOverrideSheet.server';
import { SheetServiceMock } from '~/mock/SheetServiceMock';
import { SheetServiceImpl } from '~/services/sheetServiceImpl.server';
import { charVideoInfoT8 } from '~/services/staticDataService';
import { type CharacterFrameDataPage } from '~/types/CharacterFrameDataPage';
import { type Game } from '~/types/Game';
import { type Move } from '~/types/Move';
import { type RouteHandle } from '~/types/RouteHandle';
import { type SheetService } from '~/types/SheetService';
import { frameDataTableToJson } from '~/utils/frameDataUtils';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { videoFileNameFromMove } from '~/utils/moveUtils';
import { type Route } from './+types/_mainLayout.t8_.$character';

export function shouldRevalidate({
  currentParams,
  nextParams,
}: ShouldRevalidateFunctionArgs): boolean {
  if (currentParams.character !== nextParams.character) {
    return true;
  }
  return false;
}

export const loader = async ({ params }: Route.LoaderArgs) => {
  const characterId = params.character;
  if (!characterId) {
    throw new Response(null, {
      status: 400,
      statusText: 'Character cant be empty',
    });
  }

  const game: Game = 'T8';

  const service: SheetService = environment.useMockData
    ? new SheetServiceMock()
    : new SheetServiceImpl();

  const sheetData = await service.getCharacterData(
    game,
    characterId,
    'frameData',
  );

  // the raw sheet rows stay on the server, the page only needs the moves
  const { tables, characterName, editUrl } = sheetData;

  const normalMoves = tables.find((t) => t.name === 'frames_normal');
  const moves: Move[] = normalMoves
    ? frameDataTableToJson(normalMoves, characterId)
    : [];
  // The videos of the override sheets are part of the frame data csv. Enable this to see
  // a change in an override sheet right away, without uploading the frame data again
  await applyOverrideSheet(service, game, characterId, moves, {
    enabled: false,
  });
  if (charVideoInfoT8[characterId]?.localVideoFolder) {
    moves.forEach((move) => {
      move.video = `${charVideoInfoT8[characterId].localVideoFolder}/${videoFileNameFromMove(move)}`;
    });
  }
  const frameData: CharacterFrameDataPage = {
    characterName,
    editUrl,
    moves,
  };

  return data(frameData, {
    headers: getCacheControlHeaders({ seconds: 60 * 5 }),
  });
};

/** Once the moves of every character are loaded, the page is made from them without a download */
export const clientLoader = ({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) =>
  loadFrameDataWithCache(
    serverLoader,
    // mokujin is every character
    params.character === 'mokujin' ? undefined : params.character,
  );
// also on the first page load, so the moves of a server rendered mokujin page are cached
clientLoader.hydrate = true as const;

export const handle: RouteHandle = {
  type: 'frameData',
};

export default function Index({ loaderData }: Route.ComponentProps) {
  const matches = useMatches();
  const leafMatch = matches[matches.length - 1];
  if ((leafMatch?.handle as RouteHandle)?.hideCharacterHeader) {
    return <Outlet />;
  }

  // The sub pages each edit a different sheet, so prefer the edit url of the
  // active page and fall back to the frame data one.
  const editUrl =
    (leafMatch?.loaderData as { editUrl?: string } | undefined)?.editUrl ??
    loaderData.editUrl;

  return (
    <>
      <CharacterPageHeader
        characterName={loaderData.characterName}
        editUrl={editUrl}
      />
      <Outlet />
    </>
  );
}
