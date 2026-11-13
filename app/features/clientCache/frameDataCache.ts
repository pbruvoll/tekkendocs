import { data } from 'react-router';
import { type CharacterFrameDataPage } from '~/types/CharacterFrameDataPage';
import { ServerStatusCode } from '~/types/ServerStatusCode';

/** The frame data of every character (mokujin), kept in the browser once a page
 * has loaded it, so other pages can be made without a download.
 * Only the client loaders use it, so it is never shared between server requests */
let cachedAllFrameData: CharacterFrameDataPage | undefined;

/** For a client loader: the frame data of the character, or of every character
 * without a characterId. Made from the cache, or loaded from the server, and
 * cached if it is the frame data of every character */
export const loadFrameDataWithCache = async (
  serverLoader: () => Promise<CharacterFrameDataPage>,
  characterId?: string,
): Promise<CharacterFrameDataPage> => {
  if (cachedAllFrameData) {
    return characterFrameData(cachedAllFrameData, characterId);
  }
  const frameData = await serverLoader();
  if (frameData.characterName === 'mokujin') {
    cachedAllFrameData = frameData;
  }
  return frameData;
};

const characterFrameData = (
  allFrameData: CharacterFrameDataPage,
  characterId: string | undefined,
): CharacterFrameDataPage => {
  if (!characterId) {
    return allFrameData;
  }
  const moves = allFrameData.moves.filter(
    (move) => move.characterId === characterId,
  );
  if (moves.length === 0) {
    // the server has the same frame data, so it would not find the character either
    throw data(
      { title: `There is no frame data for ${characterId}` },
      { status: ServerStatusCode.NotFound, statusText: 'Not found' },
    );
  }
  return { ...allFrameData, characterName: characterId, moves };
};
