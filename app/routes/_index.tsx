import { Heading } from "@radix-ui/themes";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Link as RadixLink } from "@radix-ui/themes";

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

  return json(
    {},
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
};

export const meta: MetaFunction = () => {
  const title = "TekkenDocs - Frame data and resources for Tekken";
  const description =
    "Frame data and resources for leveling up your skills in Tekken";
  return [
    { title },
    {
      property: "og:title",
      content: title,
    },
    {
      name: "description",
      content: description,
    },
    { property: "og:description", content: description },
  ];
};

export const chars = [
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
  "Leo",
  "Leroy",
  "Lidia",
  "Lili",
  "Lucky-Chloe",
  "Marduk",
  "Master-Raven",
  "Miguel",
  "Negan",
  "Nina",
  "Noctis",
  "Paul",
  "Shaheen",
  "Steve",
  "Xiaoyu",
  "Yoshimitsu",
  "Zafina",
];

export const headers = () => ({
  "Cache-Control": "public, max-age=300, s-maxage=300",
});

export default function Index() {
  return (
    <div
      className="p-4"
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}
    >
      <Heading as="h1">Welcome to TekkenDocs</Heading>
      <p className="my-2">This site is under construction</p>
      <Heading as="h2" mt="5" mb="2" size="5">
        Tekken 8
      </Heading>
      <p>Coming january 2024</p>
      <Heading as="h2" mt="5" mb="2" size="5">
        Tekken 7
      </Heading>
      <ul>
        {chars.map((char) => (
          <li key={char}>
            <RadixLink asChild>
              <Link className="py-2" to={"/" + char}>
                {char}
              </Link>
            </RadixLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
