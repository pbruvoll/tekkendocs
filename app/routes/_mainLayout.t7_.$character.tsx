import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import type { Game } from "~/types/Game";
import type { TableId } from "~/types/TableId";
import { cachified } from "~/utils/cache.server";
import { getSheet } from "~/utils/dataService.server";
import {
  sheetSectionToTable,
  sheetToSections,
} from "~/utils/sheetUtils.server";

const hasHeaderMap: Record<TableId, boolean> = {
  frames_normal: true,
  frames_throws: true,
  frames_tenhit: false,
};

export const loader = async ({ params }: DataFunctionArgs) => {
  const character = params.character;
  if (!character) {
    throw new Response(null, {
      status: 400,
      statusText: "Character cant be empty",
    });
  }

  const game: Game = "T7";

  const key = `${character}|_|${game}`;
  const { sheet, freshValueContext } = await cachified({
    key,
    ttl: 1000 * 30,
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 3,
    async getFreshValue(context) {
      const sheet = await getSheet(character, game);
      return { sheet, freshValueContext: context };
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

  return json(
    { characterName: character, editUrl, tables },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-Td-Cachecontext": JSON.stringify(freshValueContext),
      },
    }
  );
};

export const handle = {
  type: "frameData",
};

export default function Index() {
  return <Outlet />;
}
