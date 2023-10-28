import { Table, Link as RadixLink, Heading } from "@radix-ui/themes";
import type { DataFunctionArgs, HeadersFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { Link, useLoaderData } from "@remix-run/react";
import { ContentContainer } from "~/components/ContentContainer";
import type { Game } from "~/types/Game";
import type { TableId } from "~/types/TableId";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { cachified } from "~/utils/cache.server";
import { getSheet } from "~/utils/dataService.server";
import { commandToUrlSegment } from "~/utils/moveUtils";
import {
  sheetSectionToTable,
  sheetToSections,
} from "~/utils/sheetUtils.server";

const hasHeaderMap: Record<TableId, boolean> = {
  frames_normal: true,
  frames_throws: true,
  frames_tenhit: false,
};

const tableIdToDisplayName: Record<TableId, string> = {
  frames_normal: "Standard",
  frames_tenhit: "10 hit",
  frames_throws: "Throws",
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
  const { tables, editUrl, characterName } = useLoaderData<typeof loader>();
  if (tables.length === 0) {
    return <div>Invalid or no data</div>;
  }
  return (
    <>
      <ContentContainer enableTopPadding>
        <div className="flex justify-between items-center">
          <Heading as="h1" my="2" className="capitalize">
            {characterName}
          </Heading>
          <a
            className="flex items-center gap-2"
            style={{ color: "var(--accent-a11" }}
            target="blank"
            href={editUrl}
          >
            <Pencil1Icon />
            Edit
          </a>
        </div>
      </ContentContainer>
      <ContentContainer disableXPadding>
        {tables.map((table) => {
          const columnNums = (table.headers || table.rows[0]).map(
            (_, index) => index
          );
          return (
            <section key={table.name} className="mt-8">
              <ContentContainer>
                <Heading as="h2" mb="4" size="4">
                  {tableIdToDisplayName[table.name]}
                </Heading>
              </ContentContainer>
              <Table.Root variant="surface" style={{ width: "100%" }}>
                {table.headers && (
                  <Table.Header>
                    <Table.Row>
                      {table.headers.map((h) => (
                        <Table.ColumnHeaderCell key={h}>
                          {h}
                        </Table.ColumnHeaderCell>
                      ))}
                    </Table.Row>
                  </Table.Header>
                )}
                <Table.Body>
                  {table.rows.map((row, i) => {
                    return (
                      <Table.Row key={row[0]}>
                        {columnNums.map((j) => {
                          const cell = row[j] || "";
                          if (j === 0 && table.name === "frames_normal") {
                            //this is a command, so make it link
                            return (
                              <Table.Cell key={j}>
                                <RadixLink asChild>
                                  <Link
                                    className="text-[#ab6400]"
                                    style={{ textDecoration: "none" }}
                                    to={commandToUrlSegment(cell)}
                                  >
                                    {cell}
                                  </Link>
                                </RadixLink>
                              </Table.Cell>
                            );
                          }
                          return <Table.Cell key={j}>{cell}</Table.Cell>;
                        })}
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </section>
          );
        })}
      </ContentContainer>
    </>
  );
}
