import { characterGuideAuthors } from '~/services/staticDataService';
import { type NavLinkInfo } from './Nav';

/** Links are relative to the character layout route, so they resolve the same
    way no matter which sub page is active. */
const baseNavData: NavLinkInfo[] = [
  { link: '', displayName: 'Frame data' },
  { link: 'meta', displayName: 'Cheat sheet' },
  { link: 'antistrat', displayName: 'Anti strats' },
  { link: 'flashcard', displayName: 'Flash card' },
];

export const getCharacterNavData = (characterName: string): NavLinkInfo[] =>
  characterGuideAuthors.T8[characterName]
    ? [...baseNavData, { link: 'guide', displayName: 'Guide' }]
    : baseNavData;
