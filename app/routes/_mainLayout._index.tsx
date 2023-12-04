import { Badge, Heading } from "@radix-ui/themes";
import type { MetaFunction, TypedResponse } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { CharacterCard } from "~/components/CharacterCard";
import { ContentContainer } from "~/components/ContentContainer";
import { getTekken7Characters } from "~/services/dataService.server";
import type { GamePageData } from "~/types/GamePageData";

export const loader = async (): Promise<TypedResponse<GamePageData>> => {
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

  return json<GamePageData>(
    { characterInfoList: getTekken7Characters() },
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
    { property: "og:image", content: "/logo-512.png" },
  ];
};

export const headers = () => ({
  "Cache-Control": "public, max-age=300, s-maxage=300",
});

export default function Index() {
  const { characterInfoList }: GamePageData = useLoaderData<typeof loader>();
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <h1 className="mb-4 font-bold text-2xl">TekkenDocs</h1>
      <p className="mb-4">Frame data and learning resources for Tekken</p>

      <Heading as="h2" mt="5" mb="4" size="5">
        Resources
      </Heading>
      <Link to="/matchvideo" className="cursor-pointer">
        <Badge size="2" style={{ cursor: "pointer" }} variant="outline">
          Match videos
        </Badge>
      </Link>

      <Heading as="h2" mt="5" mb="2" size="5">
        <Link to="t8">Tekken 8</Link>
      </Heading>

      <p>Coming january 2024</p>

      <Heading as="h2" mt="5" mb="4" size="5">
        <Link to="t7">Tekken 7</Link>
      </Heading>

      <ul className="flex flex-wrap gap-5">
        {characterInfoList.map(({ id, displayName }) => (
          <li className="cursor-pointer" key={id}>
            <CharacterCard name={displayName} url={"/t7/" + id} />
          </li>
        ))}
      </ul>
    </ContentContainer>
  );
}
