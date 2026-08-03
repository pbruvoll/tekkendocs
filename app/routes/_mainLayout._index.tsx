import { Badge, Heading } from '@radix-ui/themes';
import { href, Link, type MetaFunction } from 'react-router';
import { TextEffect } from '@/components/core/TextEffect';
import { CharacterGrid } from '~/components/CharacterGrid';
import { ContentContainer } from '~/components/ContentContainer';
import { ExternalResources } from '~/components/ExternalResources';
import { MainFeatureCards } from '~/components/MainFeatureCards';
import {
  getTekken7Characters,
  getTekken8Characters,
} from '~/services/staticDataService';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { generateMetaTags } from '~/utils/seoUtils';
import { t7AvatarMap } from '~/utils/t7AvatarMap';
import { t8AvatarBrandMap256 } from '~/utils/t8AvatarBrandMap256';

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    matches,
    description:
      'Frame data and resources for leveling up your skills in Tekken',
    image: { url: '/images/tekkendocs-og-image-v2.png' },
    title: 'TekkenDocs - Frame data and resources for Tekken',
    url: '',
  });
};

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 });

export default function Index() {
  const characterInfoListT7 = getTekken7Characters();
  const characterInfoListT8 = getTekken8Characters();
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <h1 className="sr-only mb-4 text-2xl font-bold">TekkenDocs</h1>
      {/* <img
        src={tekkenDocsLogoLarge}
        alt="TekkenDocs"
        width="567px"
        style={{
          maxWidth: '100%',
          aspectRatio: '6',
          marginLeft: '-4px',
          marginTop: '1rem',
        }}
      /> */}
      <TextEffect per="word" preset="fade" className="mb-4 mt-2">
        Frame data and learning resources for Tekken
      </TextEffect>

      <Heading as="h2" mt="5" mb="4" size="5">
        Main features
      </Heading>
      <MainFeatureCards />

      <Heading as="h2" mt="7" mb="4" size="5">
        <Link to={href('/t8')}>
          <span className="sr-only">Tekken 8 </span>Characters
        </Link>
      </Heading>

      <CharacterGrid
        characterCards={characterInfoListT8.map(({ id, displayName }) => {
          const imgSrc = t8AvatarBrandMap256[id];
          // const imgSrc =
          //   'https://tekkendocs.b-cdn.net' +
          //   '/t8/images/avatars/easter/' +
          //   id +
          //   '.jpg';
          return {
            name: displayName,
            imgSrc,
            url: href('/t8/:character', { character: id }),
          };
        })}
      />

      <Heading as="h2" mt="5" mb="4" size="5">
        Other features
      </Heading>
      <div className="flex flex-wrap gap-3">
        {/* <Link to="/matchvideo" className="cursor-pointer">
          <Badge size="3" style={{ cursor: 'pointer' }} variant="outline">
            Match videos
          </Badge>
        </Link> */}
        <Link to={href('/t8/getting-started')} className="cursor-pointer">
          <Badge size="3" style={{ cursor: 'pointer' }} variant="outline">
            <span className="p-0.5 px-1">Getting started with Tekken</span>
          </Badge>
        </Link>
        <Link to={href('/t8/movecompare')} className="cursor-pointer">
          <Badge size="3" style={{ cursor: 'pointer' }} variant="outline">
            <span className="p-0.5 px-1">Move comparison</span>
          </Badge>
        </Link>
        <Link to={href('/t8/stats')} className="cursor-pointer">
          <Badge size="3" style={{ cursor: 'pointer' }} variant="outline">
            <span className="p-0.5 px-1">Stats</span>
          </Badge>
        </Link>
        <Link to={href('/t8/ranks')} className="cursor-pointer">
          <Badge size="3" style={{ cursor: 'pointer' }} variant="outline">
            <span className="p-0.5 px-1">Ranks</span>
          </Badge>
        </Link>
        <Link to={href('/t8/challenge')} className="cursor-pointer">
          <Badge size="3" style={{ cursor: 'pointer' }} variant="outline">
            <span className="p-0.5 px-1">Challenges</span>
          </Badge>
        </Link>
        <Link to={href('/t8/flashcard')} className="cursor-pointer">
          <Badge size="3" style={{ cursor: 'pointer' }} variant="outline">
            <span className="p-0.5 px-1">Flash cards</span>
          </Badge>
        </Link>
      </div>

      <Heading as="h2" mt="7" mb="4" size="5" id="externalResources">
        External Resources
      </Heading>
      <ExternalResources />

      <Heading as="h2" mt="7" mb="4" size="5">
        <Link to={href('/t7')}>Tekken 7</Link>
      </Heading>

      <CharacterGrid
        characterCards={characterInfoListT7.map(({ id, displayName }) => {
          const imgSrc = t7AvatarMap[id];
          return {
            name: displayName,
            imgSrc,
            url: href('/t7/:character', { character: id }),
          };
        })}
      />

      <Heading as="h2" mt="7" mb="4" size="5">
        <Link to={href('/tag2')}>Tekken Tag 2</Link>
      </Heading>

      <Link
        to={href('/tag2')}
        className="text-primary underline underline-offset-2"
      >
        Go to character select
      </Link>
    </ContentContainer>
  );
}
