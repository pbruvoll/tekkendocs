import { Button } from "@radix-ui/themes";
import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Fragment, useState } from "react";
import { ContentContainer } from "~/components/ContentContainer";
import { MatchVideo, MatchVideoSet } from "~/types/MatchVideo";
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
  const videoSection = sheetSections.find(
    (s) => s.sectionId === "videos_match"
  );
  if (!videoSection) {
    throw json("Not able to find match video section", { status: 404 });
  }

  const matchVideoSets = videoSection.rows
    .slice(1)
    .reduce<MatchVideoSet[]>((matchSetList, row) => {
      const setName = row[1];
      const matchVideo: MatchVideo = {
        url: row[0],
        name: row[2],
        type: row[3],
        description: row[4],
        result: row[5],
        characters: row[6],
        thumbnail: row[7],
        date: new Date(row[8]),
      };
      const prevSet: MatchVideoSet | undefined =
        matchSetList[matchSetList.length - 1];
      if (prevSet && (prevSet.setName === setName || !setName)) {
        prevSet.videos.push(matchVideo);
      } else {
        matchSetList.push({ setName, videos: [matchVideo] });
      }
      return matchSetList;
    }, []);

  return json(
    { matchVideoSets },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
};

export default function TournamentVideos() {
  const data = useLoaderData<typeof loader>();
  const [setsToShow, setSetsToShow] = useState(1);
  return (
    <ContentContainer enableTopPadding>
      <h1 className="text-4xl mt-4 mb-6">Tournament videos</h1>
      <div className="space-y-12">
        {data.matchVideoSets.slice(0, setsToShow).map((vSet) => {
          return (
            <div className="space-y-8" key={vSet.setName}>
              <div>
                <h2 key={vSet.setName} className="text-2xl mb-2 mt-6">
                  {vSet.setName}
                </h2>
                <div className="space-y-4">
                  {vSet.videos.map((vid) => {
                    return (
                      <div key={vid.name}>
                        {vSet.videos.length > 1 && <h3>{vid.name}</h3>}
                        <iframe
                          width="560"
                          src={`https://www.youtube-nocookie.com/embed/${vid.url}`}
                          className="aspect-video max-w-full"
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {setsToShow < data.matchVideoSets.length && (
        <div className="mt-6">
          <Button onClick={() => setSetsToShow((prev) => prev + 5)}>
            Show more
          </Button>
        </div>
      )}
    </ContentContainer>
  );
}
