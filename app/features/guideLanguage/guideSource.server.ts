import { getSheet } from '~/services/googleSheetService.server';
import { cdnUrl } from '~/services/staticDataService';
import { type Game } from '~/types/Game';
import { parseCsv } from './csvUtils.server';
import { defaultGuideLanguage, type GuideLanguage } from './guideLanguage';

export type GuideSource = {
  rows: string[][];
  /** Where the content is edited. Undefined when there is no editable source */
  editUrl: string | undefined;
  /** The language actually served, which is english when no translation exists */
  language: GuideLanguage;
};

const translatedGuideUrl = (
  game: Game,
  characterId: string,
  language: GuideLanguage,
) =>
  `${cdnUrl}/${game.toLowerCase()}/guides/${characterId}/${characterId}-guide-${language}.csv`;

/**Fetches a translated guide from the cdn, falling back to the english sheet
 * when the character has not been translated yet.
 */
export const getGuideSource = async (
  game: Game,
  characterId: string,
  language: GuideLanguage,
): Promise<GuideSource> => {
  if (language !== defaultGuideLanguage) {
    const url = translatedGuideUrl(game, characterId, language);
    try {
      const response = await fetch(url);
      if (response.ok) {
        return {
          rows: parseCsv(await response.text()),
          editUrl: undefined,
          language,
        };
      }
      if (response.status !== 404) {
        console.warn(`Error fetching ${url}: ${response.status}`);
      }
    } catch (e) {
      console.warn(`Error fetching ${url}`, e);
    }
  }

  const { editUrl, rows } = await getSheet(`${characterId}-guide`, game);
  return { rows, editUrl, language: defaultGuideLanguage };
};
