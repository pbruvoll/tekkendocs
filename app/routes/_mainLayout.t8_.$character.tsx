import {
  data,
  type LoaderFunctionArgs,
  Outlet,
  type ShouldRevalidateFunctionArgs,
} from 'react-router';
import { environment } from '~/constants/environment.server';
import { SheetServiceMock } from '~/mock/SheetServiceMock';
import { SheetServiceImpl } from '~/services/sheetServiceImpl.server';
import { type CharacterFrameDataPage } from '~/types/CharacterFrameDataPage';
import { type CharacterPageData } from '~/types/CharacterPageData';
import { type Game } from '~/types/Game';
import { type Move } from '~/types/Move';
import { type SheetService } from '~/types/SheetService';
import { type TableData } from '~/types/TableData';
import { applyOverride, frameDataTableToJson } from '~/utils/frameDataUtils';
import { getCacheControlHeaders } from '~/utils/headerUtils';
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

  let overrideNormalMoves: TableData | undefined;

  let overrideSheetData: CharacterPageData | undefined;
  try {
    overrideSheetData = await service.getCharacterData(
      game,
      characterId,
      'overrideFrameData',
    );
  } catch (e) {
    console.warn('overrideSheetData error', e);
  }

  overrideNormalMoves = overrideSheetData?.tables.find(
    (t) => t.name === 'frames_normal',
  );

  // const sheetData = await sheetDataPromise

  const { tables } = sheetData;

  const normalMoves = tables.find((t) => t.name === 'frames_normal');
  const moves: Move[] = normalMoves ? frameDataTableToJson(normalMoves) : [];
  if (overrideNormalMoves) {
    applyOverride(moves, overrideNormalMoves);
  }
  const frameData: CharacterFrameDataPage = { ...sheetData, moves };

  return data(frameData, {
    headers: getCacheControlHeaders({ seconds: 60 * 5 }),
  });
};

export const handle = {
  type: 'frameData',
};

export default function Index() {
  return <Outlet />;
}
