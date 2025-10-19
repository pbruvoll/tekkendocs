import { type Params } from 'react-router';

export const getCharacterFromParams = (params: Params<string>): string => {
  const character = params.character;
  if (!character) {
    throw new Response(null, {
      status: 400,
      statusText: 'Character cant be empty',
    });
  }
  return character;
};
