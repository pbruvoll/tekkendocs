import { Heading, Table } from "@radix-ui/themes";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import { google } from "~/google.server";
import { commandToUrlSegment } from "~/utils/moveUtils";

export const loader = async ({ params }: DataFunctionArgs) => {
  const character = params.character;
  const move = params.move;
  if (!character) {
    throw new Response(null, {
      status: 400,
      statusText: "Character cant be empty",
    });
  }

  if (!move) {
    throw new Response(null, {
      status: 400,
      statusText: "Move cant be empty",
    });
  }

  const target = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
  const jwt = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    scopes: target,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  });

  const sheets = google.sheets({ version: "v4", auth: jwt });
  let rows: any[][];
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64",
      range: character, // sheet name
    });

    if (!response.data.values) {
      throw json("not found", { status: 401, statusText: "Not found 1" });
    }

    rows = response.data.values;
  } catch {
    throw new Response(null, { status: 500, statusText: "server error" });
  }

  if (rows[0][0] !== "#frames_normal" || rows.length < 3) {
    throw json("no frame data found", {
      status: 401,
      statusText: "Not found 2",
    });
  }
  const dataHeaders = rows[1];
  const moveRow = rows.find((row) => commandToUrlSegment(row[0]) === move);
  if (!moveRow) {
    throw json("move not found in frame data", {
      status: 401,
      statusText: "Not found 4",
    });
  }

  return json(
    { characterName: character, dataHeaders, moveRow },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
};

export const headers = () => ({
  "Cache-Control": "public, max-age=300, s-maxage=300",
});

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const character = params.character;
  const move = params.move;
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

  const { dataHeaders, moveRow }: { dataHeaders: string[]; moveRow: string[] } =
    data;

  const characterTitle = character[0].toUpperCase() + character.substring(1);

  const title = `${move} - ${characterTitle} Tekken7 Frame Data | TekkenDocs`;
  const description = dataHeaders
    .map((header, index) => `${header}:   ${moveRow[index] || ""}`)
    .join("\n");

  return [
    { title },
    { description },
    { property: "og:title", content: title },
    { property: "description", content: description },
    { property: "og:description", content: description },
    { property: "og:image", content: `/t7/avatars/${characterTitle}.jpg` },
  ];
};

export default function Move() {
  const {
    dataHeaders: headers,
    moveRow,
    characterName,
  } = useLoaderData<typeof loader>() as unknown as {
    dataHeaders: string[];
    moveRow: string[];
    characterName: string;
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <Heading my="2" as="h1" className="capitalize">
        {characterName} : {moveRow[0]}
      </Heading>
      <Table.Root style={{ width: "100%" }}>
        <Table.Body>
          {headers.slice(1).map((header, i) => {
            return (
              <Table.Row key={header}>
                <Table.Cell>{header}</Table.Cell>
                <Table.Cell>{moveRow[i + 1] || ""}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
