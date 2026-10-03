import { useMemo } from 'react';
import {
  data,
  type HeadersFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
  useLoaderData,
} from 'react-router';
import invariant from 'tiny-invariant';
import { About } from '~/components/About';
import { Authors } from '~/components/Authors';
import { ContentContainer } from '~/components/ContentContainer';
import { PersonLinkList } from '~/components/PersonLinkList';
import {
  guideLanguageParam,
  parseGuideLanguage,
} from '~/features/guideLanguage/guideLanguage';
import { getGuideSource } from '~/features/guideLanguage/guideSource.server';
import { AboutAuthor } from '~/features/guides/AboutAuthor';
import { ComboEnders } from '~/features/guides/ComboEnders';
import { Combos } from '~/features/guides/Combos';
import { DefensiveTips } from '~/features/guides/DefensiveTips';
import { ExternalResources } from '~/features/guides/ExternalResources';
import { FrameTraps } from '~/features/guides/FrameTraps';
import { GamePlan } from '~/features/guides/GamePlan';
import { GuideContext } from '~/features/guides/GuideContext';
import { GuideNav } from '~/features/guides/GuideNav';
import { tablesToGuideData } from '~/features/guides/guideUtils.server';
import { HeatSystem } from '~/features/guides/HeatSystem';
import { Installments } from '~/features/guides/Installments';
import { Introduction } from '~/features/guides/Introduction';
import { KeyMoves } from '~/features/guides/KeyMoves';
import { Matchups } from '~/features/guides/Matchups';
import { Punishers } from '~/features/guides/Punishers';
import { Stances } from '~/features/guides/Stances';
import { StrengthsWeaknesses } from '~/features/guides/StrengthsWeaknesses';
import { WallCombos } from '~/features/guides/WallCombos';
import { useFrameData } from '~/hooks/useFrameData';
import { characterGuideAuthors } from '~/services/staticDataService';
import { type CharacterFrameData } from '~/types/CharacterFrameData';
import { type Game } from '~/types/Game';
import { type Move } from '~/types/Move';
import { type RouteHandle } from '~/types/RouteHandle';
import { cachified } from '~/utils/cache.server';
import { compressCommand } from '~/utils/commandUtils';
import { gameNameMap } from '~/utils/gameNameMap';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { generateMetaTags } from '~/utils/seoUtils';
import { sheetToSections } from '~/utils/sheetUtils.server';
import { t8GuideImgMap } from '~/utils/t8GuideImgMap';
import { t8GuideImgSmallMap } from '~/utils/t8GuideImgSmallMap';

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return loaderHeaders || getCacheControlHeaders({ seconds: 60 * 5 });
};

export const loader = async ({ params, url }: LoaderFunctionArgs) => {
  const isPreview = url.searchParams.get('preview') !== null;

  const character = params.character;
  if (!character) {
    throw new Response(null, {
      status: 400,
      statusText: 'Character cant be empty',
    });
  }

  if (!characterGuideAuthors.T8[character] && !isPreview) {
    throw data('Guide not found', {
      status: 404,
      statusText: 'Not found',
    });
  }

  const game: Game = 'T8';

  const requestedLanguage = parseGuideLanguage(
    url.searchParams.get(guideLanguageParam),
  );
  const key = `${character}-guide|_|${game}|_|${requestedLanguage}`;

  const getFreshValue = async () => {
    const { editUrl, language, rows } = await getGuideSource(
      game,
      character,
      requestedLanguage,
    );
    const sheetSections = sheetToSections(rows);
    const guideData = tablesToGuideData(sheetSections);

    return { editUrl, guideData, language };
  };

  const { guideData, editUrl, language } = isPreview
    ? await getFreshValue()
    : await cachified({
        key,
        ttl: 1000 * 30,
        staleWhileRevalidate: 1000 * 60 * 60 * 24 * 3,
        getFreshValue,
      });
  if (!guideData) {
    throw new Response(
      `Not able to find data for character ${character} in game ${game}`,
      { status: 500, statusText: 'server error' },
    );
  }

  return data(
    { characterName: character, editUrl, guideData, game, language },
    {
      headers: {
        ...getCacheControlHeaders({ seconds: isPreview ? 5 : 60 * 5 }),
      },
    },
  );
};

export const meta: MetaFunction<typeof loader> = ({
  loaderData,
  params,
  matches,
}) => {
  const frameData = matches.find(
    (m) => (m.handle as RouteHandle)?.type === 'frameData',
  )?.loaderData;
  if (!frameData) {
    return [
      {
        title: 'TekkenDocs - Uknown character',
      },
      {
        description: `There is no character with the ID of ${params.character}.`,
      },
    ];
  }
  const { characterName } = frameData as CharacterFrameData;
  const characterId = characterName.toLocaleLowerCase();
  const author = loaderData?.guideData?.authors?.[0]?.name;
  const authorLink =
    loaderData?.guideData?.authors?.[0]?.url?.split(' | ')?.[0];
  const version = characterGuideAuthors.T8[characterId]?.version;
  const characterTitle =
    characterName[0].toUpperCase() + characterName.substring(1);
  const title = `${characterTitle} Tekken 8 ${version === 'S2' ? 'Season 2 ' : 'Season 3 '}Guide ${author ? `by ${author}` : ''} | TekkenDocs`;
  const description = `An overview of the most important information for ${characterTitle} in Tekken 8. Quickly learn how to play the character by learning key moves, punishers, and combos.`;

  const imageUrl = `/t8/guides/${characterId}-1200.png`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: imageUrl,
    author: author
      ? {
          '@type': 'Person',
          name: author,
          url: authorLink,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'TekkenDocs',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tekkendocs.com//logo-256.png',
        width: 256,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://tekkendocs.com/t8/${characterId}/guide`,
    },
    about: {
      '@type': 'VideoGame',
      name: 'Tekken 8',
      character: characterTitle,
      genre: 'Fighting Game',
      gamePlatform: ['PlayStation 5', 'Xbox Series X|S', 'PC'],
    },
  };

  const generatedTags =
    generateMetaTags({
      matches,
      title,
      description,
      image: {
        url: imageUrl,
      },
      url: `/t8/${characterId}/guide`,
    }) || [];

  return [
    ...generatedTags,
    {
      'script:ld+json': jsonLd,
    },
    {
      // translations (?lang=xx) are not indexed separately yet
      tagName: 'link',
      rel: 'canonical',
      href: `https://tekkendocs.com/t8/${characterId}/guide`,
    },
  ];
};

export default function Index() {
  const {
    characterName: characterId,
    guideData,
    game,
    language,
  } = useLoaderData<typeof loader>();
  const { moves: frameData } = useFrameData();
  const gameId = game.toLowerCase();
  const compressedCommandMap = useMemo(() => {
    return frameData.reduce<Record<string, Move>>((prev, current) => {
      prev[compressCommand(current.command)] = current;
      return prev;
    }, {});
  }, [frameData]);
  invariant(frameData);

  const {
    authors,
    contributors,
    externalResources,
    keyMoves,
    panicMoves,
    heatSystem,
    gamePlan,
    introduction,
    strengths,
    weaknesses,
    standingPunishers,
    crouchingPunishers,
    whiffPunishers,
    combos,
    combosBeginner,
    comboEnders,
    wallCombos,
    smallCombos,
    frameTraps,
    knowledgeChecks,
    defensiveTips,
    defensiveMoves,
    goodMatchups,
    badMatchups,
    stances,
    installments,
    aboutAuthor,
    about,
  } = guideData;
  const { top10Moves, notableMoves } = {
    top10Moves: keyMoves?.slice(0, 10),
    notableMoves: keyMoves?.slice(10),
  };

  const version = characterGuideAuthors.T8[characterId]?.version;

  return (
    <GuideContext
      value={{
        compressedCommandMap,
        charUrl: `/${gameId}/${characterId}`,
      }}
    >
      <h1 className="sr-only">
        {characterId} {gameNameMap[game]}{' '}
        {version === 'S3' ? 'Season 3' : 'Season 2'} Guide
      </h1>
      <img
        src={t8GuideImgSmallMap[characterId]}
        className="m-2 mx-auto aspect-[1.77] w-full max-w-4xl md:hidden"
        alt=""
      ></img>
      <img
        src={t8GuideImgMap[characterId]}
        className="m-2 mx-auto aspect-[1.77] w-full max-w-4xl max-md:hidden"
        alt=""
      ></img>
      <ContentContainer enableBottomPadding lang={language}>
        {!!authors?.length && (
          <div className="mt-4">
            <Authors authors={authors} />
          </div>
        )}
        {!!contributors?.length && (
          <div className="mt-2">
            <div>
              <span>Contributors : </span>
              <PersonLinkList persons={contributors} />
            </div>
          </div>
        )}
        {about && <About about={about} />}
        <GuideNav guideData={guideData}></GuideNav>
        {!!aboutAuthor?.length && <AboutAuthor sections={aboutAuthor} />}
        {introduction?.length && <Introduction sections={introduction} />}
        {(strengths?.length || weaknesses?.length) && (
          <StrengthsWeaknesses strengths={strengths} weaknesses={weaknesses} />
        )}
        {heatSystem?.length && <HeatSystem heatSystem={heatSystem} />}
        {!!gamePlan?.length && <GamePlan sections={gamePlan} />}
        {installments?.length && <Installments installments={installments} />}
        {top10Moves?.length && (
          <KeyMoves moves={top10Moves} title="Top 10 Moves" />
        )}
        {(standingPunishers?.length ||
          crouchingPunishers?.length ||
          whiffPunishers?.length) && (
          <Punishers
            standing={standingPunishers}
            crouching={crouchingPunishers}
            whiff={whiffPunishers}
          />
        )}
        {combos?.length && <Combos combos={combos} title="Combos" />}
        {combosBeginner?.length && (
          <Combos combos={combosBeginner} title="Beginner Combos" />
        )}
        {comboEnders?.length && <ComboEnders comboEnders={comboEnders} />}
        {wallCombos?.length && <WallCombos wallCombos={wallCombos} />}
        {smallCombos?.length && (
          <Combos combos={smallCombos} title="Small Combos" />
        )}
        {notableMoves?.length && (
          <KeyMoves moves={notableMoves} title="Notable Moves" />
        )}
        {stances?.length && <Stances stances={stances} />}
        {panicMoves?.length && (
          <KeyMoves moves={panicMoves} title="Panic Moves" />
        )}
        {frameTraps?.length && <FrameTraps frameTraps={frameTraps} />}
        {knowledgeChecks?.length && (
          <KeyMoves moves={knowledgeChecks} title="Knowledge Checks" />
        )}
        {defensiveTips?.length && <DefensiveTips tips={defensiveTips} />}
        {defensiveMoves?.length && (
          <KeyMoves moves={defensiveMoves} title="Defensive Move Handling" />
        )}
        {!!(goodMatchups?.length || badMatchups?.length) && (
          <Matchups good={goodMatchups} bad={badMatchups} />
        )}
        {externalResources?.length && (
          <ExternalResources externalResources={externalResources} />
        )}
      </ContentContainer>
    </GuideContext>
  );
}
