import { Table, Link as RadixLink, Heading } from "@radix-ui/themes";
import type { DataFunctionArgs, HeadersFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { Link, useLoaderData } from "@remix-run/react";
import type { Game } from "~/types/Game";
import { cachified } from "~/utils/cache.server";
import { getSheet } from "~/utils/dataService.server";
import { commandToUrlSegment } from "~/utils/moveUtils";

type TableData = {
  name: string;
  headers: string[];
  rows: string[][];
};

type CharFrameData = {
  normalMoves: TableData;
  throws: TableData;
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
  const { rows, freshValueContext } = await cachified({
    key,
    ttl: 1000 * 30,
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 3,
    async getFreshValue(context) {
      const rows = await getSheet(character, game);
      return { rows, freshValueContext: context };
    },
  });
  if (!rows) {
    throw new Response(
      `Not able to find data for character ${character} in game ${game}`,
      { status: 500, statusText: "server error" }
    );
  }

  const dict: Record<string, string[][]> = {};
  let rows2 = rows;
  let idIndex = rows2.findIndex((row) => row[0]?.startsWith("#"));
  while (idIndex >= 0) {
    const tableId = rows2[idIndex][0];
    rows2 = rows2.slice(idIndex + 1);
    const nextIdIndex = rows2.findIndex((row) => row[0]?.startsWith("#"));
    const endIndex = nextIdIndex >= 0 ? nextIdIndex : rows2.length;
    const content = rows2.slice(0, endIndex).filter((row) => Boolean(row[0]));
    idIndex = nextIdIndex;
    dict[tableId] = content;
  }

  return json(
    { characterName: character, dict },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "X-Td-Cachecontext": JSON.stringify(freshValueContext),
      },
    }
  );
};

export const headers: HeadersFunction = (args) => ({
  "Cache-Control": "public, max-age=300, s-maxage=300",
  "X-Td-Cachecontext": args.loaderHeaders.get("X-Td-Cachecontext") || "none",
});

export const meta: MetaFunction = ({ data, params }) => {
  const character = params.character;
  if (!data || !character) {
    return [
      {
        title: "TekkenDocs - Uknown character",
      },
      {
        description: `There is no character with the ID of ${params.character}.`,
      },
    ];
  }

  const characterTitle = character[0].toUpperCase() + character.substring(1);
  const title = `${characterTitle} Tekken 7 Frame Data | TekkenDocs`;
  const description = `Frame data for ${characterTitle} in Tekken 7`;

  return [
    { title },
    { description },
    { property: "og:title", content: title },
    { property: "description", content: description },
    { property: "og:description", content: description },
    { property: "og:image", content: `/t7/avatars/${characterTitle}.jpg` },
  ];
};

export default function Index() {
  const { dict, characterName } = useLoaderData<typeof loader>();
  if (Object.keys(dict).length === 0) {
    return <div>Invalid or no data</div>;
  }
  const headers = dict["#frames_normal"][0];
  const rows = dict["#frames_normal"].slice(1);
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <Heading as="h1" my="2" className="capitalize">
        {characterName}
      </Heading>
      <Table.Root variant="surface" style={{ width: "100%" }}>
        <Table.Header>
          <Table.Row>
            {headers.map((h) => (
              <Table.ColumnHeaderCell key={h}>{h}</Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, i) => {
            return (
              <Table.Row key={row[0]}>
                {headers.map((_, j) => {
                  if (j === 0) {
                    //this is a command, so make it link
                    return (
                      <Table.Cell key={headers[j]}>
                        <RadixLink asChild>
                          <Link
                            className="text-[#ab6400]"
                            style={{ textDecoration: "none" }}
                            to={commandToUrlSegment(rows[i][j])}
                          >
                            {rows[i][j]}
                          </Link>
                        </RadixLink>
                      </Table.Cell>
                    );
                  }
                  return <Table.Cell key={headers[j]}>{rows[i][j]}</Table.Cell>;
                })}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
