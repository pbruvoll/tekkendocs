/** Mokujin holds the frame data for every character, so it is presented as
    "All Characters" rather than as a character of its own. */
export const getCharacterDisplayName = (characterName: string): string =>
  characterName === 'mokujin' ? 'All Characters' : characterName;
