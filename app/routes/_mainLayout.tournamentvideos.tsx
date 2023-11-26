import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ContentContainer } from "~/components/ContentContainer";
import { SpreadSheetDocName } from "~/types/SpreadSheetDocName";
import { cachified } from "~/utils/cache.server";
import { getSheet } from "~/utils/dataService.server";
import {
  sheetSectionToTable,
  sheetToSections,
} from "~/utils/sheetUtils.server";

export const meta: MetaFunction = () => {
  const title = "Tournament videos from Tekken";
  const description =
    "A curated list of vidoes from the biggest Tekken tournaments";
  return [
    { title },
    { description },
    { property: "og:title", content: title },
    { property: "description", content: description },
    { property: "og:description", content: description },
    {
      property: "og:image",
      content: "https://i.ytimg.com/vi/dQ5hje6Fnfw/maxresdefault.jpg",
    },
  ];
};

export const loader = async () => {
  const sheetDoc: SpreadSheetDocName = "T7_MatchVideo";
  const { sheet } = await cachified({
    key: sheetDoc,
    ttl: 1000 * 30,
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 3,
    async getFreshValue() {
      const sheet = await getSheet("videos_match", sheetDoc);
      return { sheet };
    },
  });
  if (!sheet) {
    throw new Response(`Not able to find data for match videos`, {
      status: 500,
      statusText: "server error",
    });
  }

  const { editUrl, rows } = sheet;
  const sheetSections = sheetToSections(rows);
  const tables = sheetSections.map((ss) =>
    sheetSectionToTable({
      name: ss.sectionId,
      sheetSection: ss,
      hasHeader: true,
    })
  );

  return json(
    { editUrl, tables },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
};

export default function TournamentVideos() {
  const data = useLoaderData();
  console.log("tourn", data);
  return (
    <ContentContainer enableTopPadding>
      <h1 className="text-4xl mt-4 mb-6">Tournament videos</h1>
      <h2 id="tu-23" className="text-2xl mb-2 mt-6">
        Thaiger Uppercut 2023
      </h2>
      <iframe
        width="560"
        src="https://www.youtube-nocookie.com/embed/3Cz9J-YhchU"
        className="aspect-video max-w-full"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
      <iframe
        width="560"
        src="https://www.youtube-nocookie.com/embed/XdvwVrUfhjk"
        className="aspect-video max-w-full"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>

      <h2 id="rev-major-23" className="text-2xl mb-2 mt-6">
        Rev major 2023
      </h2>
      <iframe
        width="560"
        src="https://www.youtube-nocookie.com/embed/dQ5hje6Fnfw"
        className="aspect-video max-w-full"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
      <iframe
        width="560"
        src="https://www.youtube-nocookie.com/embed/YaHbTVwuYl0"
        className="aspect-video max-w-full"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </ContentContainer>
  );
}
