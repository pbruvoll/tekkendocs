import { Heading } from '@radix-ui/themes';
import { data, type MetaFunction } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer';
import { charsTag2 } from '~/services/staticDataService';
import { getCacheControlHeaders } from '~/utils/headerUtils';
import { generateMetaTags } from '~/utils/seoUtils';

export const loader = async () => {
  return data(null, {
    headers: getCacheControlHeaders({ seconds: 60 * 5 }),
  });
};

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    matches,
    description: 'Frame data for Tekken Tag Tournament 2',
    title: 'Tekken Tag 2 Frame data',
    url: '',
  });
};

type Tag2CharacterCardProps = {
  name: string;
  url: string;
};

const Tag2CharacterCard = ({ name, url }: Tag2CharacterCardProps) => {
  return (
    <a href={url} className="group block cursor-pointer">
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:scale-105 hover:border-orange-400 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-500">
        <div className="flex min-h-[100px] items-center justify-center p-4">
          <div className="text-center">
            <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-clip-text text-base font-bold tracking-wide text-transparent transition-all duration-300 group-hover:scale-105 group-hover:from-orange-600 group-hover:via-orange-700 group-hover:to-orange-600 dark:from-gray-200 dark:via-gray-100 dark:to-gray-200 dark:group-hover:from-orange-400 dark:group-hover:via-orange-500 dark:group-hover:to-orange-400">
              {name}
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    </a>
  );
};

export default function Tag2() {
  return (
    <ContentContainer>
      <Heading as="h2" mt="5" mb="4" size="5">
        Tekken Tag Tournament 2
      </Heading>
      <ul className="grid grid-cols-2 gap-x-2 gap-y-2 xs:grid-cols-3 xs:gap-x-3 xs:gap-y-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {charsTag2.map((charName, index) => {
          // Map character name to filename format
          const fileName = charName.replaceAll('-', '_').replaceAll(' ', '_');
          const url = `/tag2/framedata/${fileName}TUD-converted.html`;

          return (
            <li key={charName}>
              <Tag2CharacterCard name={charName} url={url} />
            </li>
          );
        })}
      </ul>
    </ContentContainer>
  );
}
