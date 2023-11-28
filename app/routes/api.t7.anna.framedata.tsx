import { json, type DataFunctionArgs } from "@remix-run/node";
import { hasHeaderMap } from "~/constants/hasHeaderMap";
import type { Game } from "~/types/Game";
import { cachified } from "~/utils/cache.server";
import { getSheet } from "~/utils/dataService.server";
import {
  sheetSectionToTable,
  sheetToSections,
} from "~/utils/sheetUtils.server";

export const loader = async ({ params }: DataFunctionArgs) => {
  const character = "anna"; // params.character;
  if (!character) {
    throw new Response(null, {
      status: 400,
      statusText: "Character cant be empty",
    });
  }

  const game: Game = "T7";

  const key = `${character}|_|${game}`;
  const { sheet } = await cachified({
    key,
    ttl: 1000 * 30,
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 3,
    async getFreshValue(context) {
      const sheet = await getSheet(character, game);
      return { sheet };
    },
  });
  if (!sheet) {
    throw new Response(
      `Not able to find data for character ${character} in game ${game}`,
      { status: 500, statusText: "server error" }
    );
  }

  const { editUrl, rows } = sheet;
  const sheetSections = sheetToSections(rows);
  const tables = sheetSections.map((ss) =>
    sheetSectionToTable({
      name: ss.sectionId,
      sheetSection: ss,
      hasHeader: hasHeaderMap[ss.sectionId],
    })
  );
  const tableJson = tables.reduce((prev, current) => {
    prev[current.name] = {
      headers: current.headers,
      rows: current.rows,
    };
    return prev;
  }, {} as any);

  return json(
    { characterName: character, editUrl, ...tableJson },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
};
