import { data, Outlet, type ShouldRevalidateFunction } from 'react-router';
import { environment } from '~/constants/environment.server';
import { SheetServiceMock } from '~/mock/SheetServiceMock';
import { SheetServiceImpl } from '~/services/sheetServiceImpl.server';
import { type Game } from '~/types/Game';
import { type Move } from '~/types/Move';
import { type SheetService } from '~/types/SheetService';
import { frameDataTableToJson } from '~/utils/frameDataUtils';
import { getCacheControlHeaders } from '~/utils/headerUtils';

export type LoaderData = {
  moves: Move[];
};

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
  const normalMoves = sheetData.tables.find(
    (table) => table.name === 'frames_normal',
  );
  const moves = normalMoves ? frameDataTableToJson(normalMoves) : [];

  return data<LoaderData>(
    { moves },
    {
      headers: getCacheControlHeaders({ seconds: 60 * 10 }),
    },
  );
};

export const shouldRevalidate: ShouldRevalidateFunction = () => false;

export default function AllFrameData() {
  return <Outlet />;
}
