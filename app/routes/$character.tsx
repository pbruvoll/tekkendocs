import { DataFunctionArgs, json } from "@remix-run/node";
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

    return json({ characterName: character, rows });
  } catch {
  }
  throw new Response(null, { status: 500, statusText: "server error" })
}

export default function Index() {
  const { rows, characterName } = useLoaderData<typeof loader>() as unknown as { rows: any[][], characterName: string };
  if (rows[0][0] !== "#framesnormal" || rows.length < 3) {
    return <div>Invalid or no data</div>
  }
  const headers = rows[1];
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1 style={{ textTransform: "capitalize" }}>{characterName}</h1>
      <table style={{ width: "100%" }}>
        <thead>
          {headers.map(h => <th key={h}>{h}</th>)}
        </thead>
        <tbody>
          {rows.slice(2).map(row => {
            return <tr key={row[0]}>
              {row.map((cell, index) => (<td key={headers[index]}>{cell}</td>))}
            </tr>
          })}
          <tr></tr>

        </tbody>
      </table>
    </div>
  );
}
