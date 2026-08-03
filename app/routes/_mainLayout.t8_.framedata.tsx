import { Heading } from '@radix-ui/themes';
import { href, type MetaFunction } from 'react-router';
import { CharacterGrid } from '~/components/CharacterGrid';
import { ContentContainer } from '~/components/ContentContainer';
import { getTekken8Characters } from '~/services/staticDataService';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { generateMetaTags } from '~/utils/seoUtils';
import { t8AvatarBrandMap256 } from '~/utils/t8AvatarBrandMap256';

export const headers = () => getCacheControlHeaders({ seconds: 60 * 5 });

export const meta: MetaFunction = ({ matches }) =>
  generateMetaTags({
    matches,
    title: 'Tekken 8 frame data | TekkenDocs',
    description:
      'Frame data for every character in Tekken 8. Select a character to see startup, block advantage, hit advantage and more for all their moves.',
    url: href('/t8/framedata'),
  });

export default function T8FrameData() {
  const characterInfoList = getTekken8Characters();
  return (
    <ContentContainer enableTopPadding enableBottomPadding>
      <Heading as="h1" mb="4" size="6">
        Tekken 8 frame data
      </Heading>

      <div className="mb-6 flex max-w-prose flex-col gap-3">
        <p>
          Frame data describes how long a move takes, measured in frames. Tekken
          runs at 60 frames per second, so one frame is 1/60 of a second.
        </p>
        <p>
          The two numbers that matter most are <strong>startup</strong>, which
          is how many frames pass before the move can hit, and{' '}
          <strong>block advantage</strong>, which is how many frames you are
          ahead or behind once the opponent blocks it. A move that is -10 on
          block leaves you 10 frames behind, which is long enough for the
          opponent to punish it with a 10 frame move. A move that is plus on
          block leaves you ahead, so it is your turn to attack again.
        </p>
        <p>
          Knowing these numbers tells you when it is safe to press a button,
          which of your opponent&apos;s moves you can punish, and how much you
          get to do about it. Pick a character below to browse their moves.
        </p>
      </div>

      <Heading as="h2" mb="4" size="5">
        Characters
      </Heading>
      <CharacterGrid
        characterCards={characterInfoList.map(({ id, displayName }) => {
          const imgSrc = t8AvatarBrandMap256[id];
          return {
            name: displayName,
            imgSrc,
            url: href('/t8/:character', { character: id }),
          };
        })}
      />
    </ContentContainer>
  );
}
