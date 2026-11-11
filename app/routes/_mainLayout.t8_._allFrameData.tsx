import { data, Outlet, type ShouldRevalidateFunction } from 'react-router';
import { environment } from '~/constants/environment.server';
import { loadFrameDataWithCache } from '~/features/clientCache/frameDataCache';
import { SheetServiceMock } from '~/mock/SheetServiceMock';
import { SheetServiceImpl } from '~/services/sheetServiceImpl.server';
import { type CharacterFrameDataPage } from '~/types/CharacterFrameDataPage';
import { type Game } from '~/types/Game';
import { type SheetService } from '~/types/SheetService';
import { frameDataTableToJson } from '~/utils/frameDataUtils';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { type Route } from './+types/_mainLayout.t8_._allFrameData';

export type LoaderData = CharacterFrameDataPage;

export const loader = async () => {
  const game: Game = 'T8';
  const service: SheetService = environment.useMockData
    ? new SheetServiceMock()
    : new SheetServiceImpl();

  const sheetData = await service.getCharacterData(
    game,
    'mokujin',
    'frameData',
  );
  // the raw sheet rows stay on the server, the pages only need the moves
  const { tables, characterName, editUrl } = sheetData;
  const normalMoves = tables.find((table) => table.name === 'frames_normal');
  const moves = normalMoves ? frameDataTableToJson(normalMoves, 'mokujin') : [];

  return data<LoaderData>(
    { characterName, editUrl, moves },
    {
      headers: getCacheControlHeaders({ seconds: 60 * 10 }),
    },
  );
};

/** Uses the moves of every character when a page has loaded them already */
export const clientLoader = ({ serverLoader }: Route.ClientLoaderArgs) =>
  loadFrameDataWithCache(serverLoader);
// also on the first page load, so the moves of a server rendered page are cached
clientLoader.hydrate = true as const;

export const shouldRevalidate: ShouldRevalidateFunction = () => false;

export default function AllFrameData() {
  return <Outlet />;
}
