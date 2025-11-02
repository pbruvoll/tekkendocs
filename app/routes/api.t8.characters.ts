import { data } from 'react-router';
import { characterInfoT8List } from '~/constants/characterInfoListT8';
import { getCacheControlHeaders } from '~/utils/headerUtils';

export const loader = () => {
  const charListMapped = characterInfoT8List.map(
    ({ id, displayName, wavuName, aliasList }) => ({
      id,
      displayName,
      wavuName,
      aliasList,
      images: {
        largePng: `https://tekkendocs.com/t8/avatars/${id}-brand-512.png`,
        officialLargePng: `https://tekkendocs.com/t8/avatars/${id}-512.png`,
      },
    }),
  );
    return data( { characters: charListMapped }, {
    headers: getCacheControlHeaders({ seconds: 60 * 5 }),
  });
};
