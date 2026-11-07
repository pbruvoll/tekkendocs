import { type Game } from '~/types/Game';
import { type Move } from '~/types/Move';
import { type SheetService } from '~/types/SheetService';
import { applyOverride } from '~/utils/frameDataUtils';

/**
 * Fetches the <character>-override sheet and adds its YouTube videos and tags to the moves.
 *
 * The videos and tags of the override sheets are normally added to the frame data csv
 * when it is generated (utils/wavuOverrides.py), so this is only needed to see a change
 * in an override sheet right away, without generating and uploading the frame data again.
 * It does nothing unless enabled.
 */
export const applyOverrideSheet = async (
  service: SheetService,
  game: Game,
  characterId: string,
  moves: Move[],
  { enabled }: { enabled: boolean },
) => {
  if (!enabled || characterId === 'mokujin') {
    return;
  }
  try {
    const overrideSheetData = await service.getCharacterData(
      game,
      characterId,
      'overrideFrameData',
    );
    const overrideNormalMoves = overrideSheetData.tables.find(
      (t) => t.name === 'frames_normal',
    );
    if (overrideNormalMoves) {
      applyOverride(moves, overrideNormalMoves);
    }
  } catch (e) {
    console.warn('overrideSheetData error', e);
  }
};
