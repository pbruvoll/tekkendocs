const baseUrl = 'https://replaydatabase.com/tekken/';

/** replaydatabase.com uses underscores (devil_jin, miary_zo) and "jack8" */
const toReplayDatabaseCharId = (characterId: string): string =>
  characterId === 'jack-8' ? 'jack8' : characterId.replaceAll('-', '_');

export const getReplayDatabaseUrl = (characterId: string): string =>
  `${baseUrl}?c=${toReplayDatabaseCharId(characterId)}`;
