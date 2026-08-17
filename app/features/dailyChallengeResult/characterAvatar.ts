import { characterInfoT8List } from '~/constants/characterInfoListT8';
import { t8AvatarBrandMap256 } from '~/utils/t8AvatarBrandMap256';

// Answers only store the character's display name, so map back from that. The
// avatars are the same ones the front page uses.
const avatarSrcByCharacterName = characterInfoT8List.reduce<
  Record<string, string>
>((current, { id, displayName }) => {
  const src = t8AvatarBrandMap256[id];
  if (src) {
    current[displayName] = src;
  }
  return current;
}, {});

export const getCharacterAvatarSrc = (
  characterName: string,
): string | undefined => avatarSrcByCharacterName[characterName];
