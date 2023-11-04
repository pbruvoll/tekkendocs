import { Heading } from "@radix-ui/themes";
import { json, type TypedResponse } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { CharacterCard } from "~/components/CharacterCard";
import { ContentContainer } from "~/components/ContentContainer";
import { getTekken7Characters } from "~/services/dataService.server";
import type { GamePageData } from "~/types/GamePageData";

export const loader = async (): Promise<TypedResponse<GamePageData>> => {
  return json<GamePageData>(
    { characterInfoList: getTekken7Characters() },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
};

export default function T7() {
  const { characterInfoList }: GamePageData = useLoaderData<typeof loader>();
  return (
    <ContentContainer>
      <Heading as="h2" mt="5" mb="4" size="5">
        <Link to="t7">Tekken 7</Link>
      </Heading>
      <ul className="flex flex-wrap gap-5">
        {characterInfoList.map(({ id, displayName }) => (
          <li className="cursor-pointer" key={id}>
            <CharacterCard name={displayName} url={"/" + id} />
          </li>
        ))}
      </ul>
    </ContentContainer>
  );
}
