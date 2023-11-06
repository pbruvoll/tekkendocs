import type { MetaFunction } from "@remix-run/node";
import { ContentContainer } from "~/components/ContentContainer";

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

export default function TournamentVideos() {
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
