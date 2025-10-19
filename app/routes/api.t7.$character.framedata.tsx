import { data, type LoaderFunctionArgs } from 'react-router';
import { hasHeaderMap } from '~/constants/hasHeaderMap';
import { getSheet } from '~/services/googleSheetService.server';
import { type Game } from '~/types/Game';
import { type Move } from '~/types/Move';
import { type Throw } from '~/types/Throw';
import { cachified } from '~/utils/cache.server';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import {
  sheetSectionToTable,
  sheetToSections,
} from '~/utils/sheetUtils.server';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const character = params.character;
  if (!character) {
    throw new Response(null, {
      status: 400,
      statusText: 'Character cant be empty',
    });
  }

  const game: Game = 'T7';

  const key = `${character}|_|${game}`;
  const { sheet } = await cachified({
    key,
    ttl: 1000 * 30,
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 3,
    async getFreshValue() {
      const sheet = await getSheet(character, game);
      return { sheet };
    },
  });
  if (!sheet) {
    throw new Response(
      `Not able to find data for character ${character} in game ${game}`,
      { status: 500, statusText: 'server error' },
    );
  }

  const { editUrl, rows } = sheet;
  const sheetSections = sheetToSections(rows);
  const tables = sheetSections.map((ss) =>
    sheetSectionToTable({
      name: ss.sectionId,
      sheetSection: ss,
      hasHeader: hasHeaderMap[ss.sectionId],
    }),
  );
  const framesNormalTable = tables.find((t) => t.name === 'frames_normal');
  if (!framesNormalTable) {
    throw data('Not able to find frame for character', { status: 500 });
  }

  const framesNormal = framesNormalTable.rows.map<Move>((row, index) => ({
    moveNumber: index + 1,
    command: row[0],
    hitLevel: row[1],
    damage: row[2],
    startup: row[3],
    block: row[4],
    hit: row[5],
    counterHit: row[6],
    notes: row[7],
  }));

  const framesThrowsTable = tables.find((t) => t.name === 'frames_throws');
  const framesThrows = framesThrowsTable
    ? framesThrowsTable.rows.map<Throw>((row) => ({
        command: row[0],
        hitLevel: row[1],
        damage: row[2],
        startup: row[3],
        hit: '?',
        break: row[5],
        breakCommand: row[4],
        notes: row[6],
      }))
    : undefined;

  return data(
    { characterName: character, editUrl, framesNormal, framesThrows },
    {
      headers: getCacheControlHeaders({ seconds: 60 * 5 }),
    },
  );
};
