import { DataFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { google } from "~/google.server";

export const loader = async ({ params }: DataFunctionArgs) => {
  const character = params.character;
  if (!character) {
    throw new Response(null, {
      status: 400,
      statusText: "Character cant be empty",
    });
  }

  const target = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
  const jwt = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    scopes: target,
    key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  });

  const sheets = google.sheets({ version: 'v4', auth: jwt });
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64",
      range: character, // sheet name
    });

    const rows = response.data.values;
    response

    return json({ characterName: character, rows }, {
      headers: {
        "Cache-Control": "public, max-age=10, s-maxage=60",
      }
    });

  } catch {
  }
  throw new Response(null, { status: 500, statusText: "server error" })
}

export const headers = () => ({
  "Cache-Control": "public, max-age=10, s-maxage=60",
});

export const meta: MetaFunction = ({
  data,
  params,
}) => {
  const character = params.character;
  if (!data || !character) {
    return {
      title: "TekkenDocs - Uknown character",
      description: `There is no character with the ID of ${params.character}.`,
    };
  }

  const characterTitle = character[0].toUpperCase() + character.substring(1)

  return {
    title: `${characterTitle} T7 Frame Data | TekkenDocs`,
    description: `Frame data for ${characterTitle} in Tekken 7`,
    "og:image": `/t7/avatars/${characterTitle}.jpg`,
  };
};


export default function Index() {
  const { rows, characterName } = useLoaderData<typeof loader>() as unknown as { rows: any[][], characterName: string };
  if (rows[0][0] !== "#framesnormal" || rows.length < 3) {
    return <div>Invalid or no data</div>
  }
  const headers = rows[1];
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1 style={{ textTransform: "capitalize" }}>{characterName}</h1>
      <table style={{ width: "100%" }} className="styled-table">
        <thead>
          <tr>
            {headers.map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice(2).map((row, i) => {
            return <tr key={row[0]}>
              {headers.map((_, j) => (<td key={headers[j]}>{rows[2 + i][j]}</td>))}
            </tr>
          })}
        </tbody>
      </table>
    </div>
  );
}
