import {
  data,
  Outlet,
  type ShouldRevalidateFunctionArgs,
  useMatches,
} from 'react-router';
import { environment } from '~/constants/environment.server';
import { CharacterPageHeader } from '~/features/characterPage/CharacterPageHeader';
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

  const { tables } = sheetData;

  const normalMoves = tables.find((t) => t.name === 'frames_normal');
  const moves: Move[] = normalMoves
    ? frameDataTableToJson(normalMoves, characterId)
    : [];
  // The videos of the override sheets are part of the frame data csv. Enable this to see
  // a change in an override sheet right away, without uploading the frame data again
  await applyOverrideSheet(service, game, characterId, moves, {
    enabled: false,
  });
  if (charVideoInfoT8[characterId]?.autoGenerateFileName) {
    moves.forEach((move) => {
      if (!move.video) {
        move.video = `/t8-p2-${characterId}-${videoFileNameFromMove(move)}.mp4`;
      }
    });
  }
  if (charVideoInfoT8[characterId]?.localVideoFolder) {
    moves.forEach((move) => {
      move.video = `${charVideoInfoT8[characterId].localVideoFolder}/${videoFileNameFromMove(move)}`;
    });
  }
  const frameData: CharacterFrameDataPage = { ...sheetData, moves };

  return data(frameData, {
    headers: getCacheControlHeaders({ seconds: 60 * 5 }),
  });
};

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
