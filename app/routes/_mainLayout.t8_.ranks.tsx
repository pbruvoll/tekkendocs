import { type MetaFunction } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer';
import { RankLadder } from '~/features/ranks/components/RankLadder';
import { RanksHeader } from '~/features/ranks/components/RanksHeader';
import { generateMetaTags } from '~/utils/seoUtils';

export const meta: MetaFunction = ({ matches }) => {
  return generateMetaTags({
    title: 'Tekken 8 ranks',
    description: 'A list of all ranks in tekken 8',
    matches,
    image: { url: `/t8/pages/ranks.png` },
    url: `/t8/ranks`,
  });
};

const Ranks = () => {
  return (
    <ContentContainer enableBottomPadding enableTopPadding>
      <RanksHeader />
      <RankLadder />
    </ContentContainer>
  );
};

export default Ranks;
