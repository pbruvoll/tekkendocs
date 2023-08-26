import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { google } from "~/google.server";

export const loader: LoaderFunction = async ({ params }) => {
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

    return json({ rows });
  } catch {
    throw new Response(null, { status: 500, statusText: "server error" })
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to TekkenDex</h1>
      <div>Verdi til celle A1 er {data.rows[0][0]}</div>
    </div>
  );
}
