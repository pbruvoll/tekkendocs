import { Pencil1Icon } from "@radix-ui/react-icons";
import { Heading, Link as RadixLink,Table } from "@radix-ui/themes";
import { type DataFunctionArgs,json,type MetaFunction  } from "@remix-run/node";
import { Link, NavLink, useLoaderData } from "@remix-run/react";
import { ContentContainer } from "~/components/ContentContainer";
import { hasHeaderMap } from "~/constants/hasHeaderMap";
import { tableIdToDisplayName } from "~/constants/tableIdToDisplayName";
import type { CharacterFrameData } from "~/types/CharacterFrameData";
import type { Game } from "~/types/Game";
import type { RouteHandle } from "~/types/RouteHandle";
import { cachified } from "~/utils/cache.server";
import { getSheet } from "~/utils/dataService.server";
import { commandToUrlSegment } from "~/utils/moveUtils";
import {
  sheetSectionToTable,
  sheetToSections,
} from "~/utils/sheetUtils.server";

export const loader = async ({ params }: DataFunctionArgs) => {
  const character = params.character;
  if (!character) {
    throw new Response(null, {
      status: 400,
      statusText: "Character cant be empty",
    });
  }

  const game: Game = "T7";

  const sheetName = `${character}-meta`;
  const key = `${sheetName}|_|${game}`;
  const { sheet, freshValueContext } = await cachified({
    key,
    ttl: 1000 * 30,
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 3,
    async getFreshValue(context) {
      const sheet = await getSheet(sheetName, game);
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

export const meta: MetaFunction = ({ data, params, matches }) => {
  const frameData = matches.find(
    (m) => (m.handle as RouteHandle)?.type === "frameData"
  )?.data;
  if (!frameData) {
    return [
      {
        title: "TekkenDocs - Uknown character",
      },
      {
        description: `There is no character with the ID of ${params.character}.`,
      },
    ];
  }
  const { characterName } = frameData as CharacterFrameData;
  const characterId = characterName.toLocaleLowerCase();
  const characterTitle =
    characterName[0].toUpperCase() + characterName.substring(1);
  const title = `${characterTitle} Tekken 7 Guide | TekkenDocs`;
  const description = `Guide with cheat sheet for ${characterTitle} in Tekken 7`;

  return [
    { title },
    { description },
    { property: "og:title", content: title },
    { property: "description", content: description },
    { property: "og:description", content: description },
    { property: "og:image", content: `/t7/avatars/${characterTitle}.jpg` },
    {
      tagName: "link",
      rel: "canonical",
      href: `https://tekkendocs.com/t7/${characterId}/meta`,
    },
  ];
};

export default function Index() {
  const { characterName, editUrl, tables } = useLoaderData<typeof loader>();

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
        <div className="flex gap-3">
          <NavLink to="../">Frame data</NavLink>
          <NavLink to="">Guide</NavLink>
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
                          if (table.headers && table.headers[j] === "Command") {
                            //this is a command, so make it link
                            return (
                              <Table.Cell key={j}>
                                <RadixLink asChild>
                                  <Link
                                    className="text-[#ab6400]"
                                    style={{ textDecoration: "none" }}
                                    to={`/t7/${characterName}/${commandToUrlSegment(
                                      cell
                                    )}`}
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
