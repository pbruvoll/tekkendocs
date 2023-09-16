import { LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { google } from "~/google.server";

export const loader: LoaderFunction = async () => {
  // const target = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
  // const jwt = new google.auth.JWT({
  //   email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  //   scopes: target,
  //   key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  // });

  // const sheets = google.sheets({ version: 'v4', auth: jwt });
  // const response = await sheets.spreadsheets.values.get({
  //   spreadsheetId: "1p-QCqB_Tb1GNX0KaicHr0tZwKa1taK5XeNvMr1N3D64",
  //   range: 'landingpage', // sheet name
  // });

  //const rows = response.data.values;

  return json({});
};

const chars = [
  "Akuma",
  "Alisa",
  "Anna",
  "Armor-King",
  "Asuka",
  "Bob",
  "Bryan",
  "Claudio",
  "Devil-Jin",
  "Dragunov",
  "Eddy",
  "Eliza",
  "Fahkumram",
  "Feng",
  "Ganryu",
  "Geese",
  "Gigas",
  "Heihachi",
  "Hwoarang",
  "Jack-7",
  "Jin",
  "Josie",
  "Julia",
  "Katarina",
  "Kazumi",
  "Kazuya",
  "King",
  "Kuma",
  "Kunimitsu",
  "Lars",
  "Law",
  "Lee",
  "Lei",
];

export const headers = () => ({
  "Cache-Control": "public, max-age=10, s-maxage=60",
});

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to TekkenDocs</h1>
      <div>This site is under construction</div>
      <h2>Tekken 8</h2>
      <p>Coming later...</p>
      <h2>Tekken 7</h2>
      <ul>
        {chars.map((char) => (
          <li key={char}>
            <Link to={"/" + char}>{char}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
