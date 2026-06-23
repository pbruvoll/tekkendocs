import cx from 'classix';
import { useId, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { characterInfoT8List } from '~/constants/characterInfoListT8';
import { t8AvatarBrandMap } from '~/utils/t8AvatarMap';

type QuizCharacterFilterProps = {
  selectedCharacters: string[];
  onSelectionChange: (characters: string[]) => void;
  characterRankImages?: Record<string, string>;
  charStatsLoaded?: boolean;
};

export const QuizCharacterFilter = ({
  selectedCharacters,
  onSelectionChange,
  characterRankImages,
  charStatsLoaded,
}: QuizCharacterFilterProps) => {
  const id = useId();
  const multiSelectId = `${id}-multi-select`;
  const [multiSelect, setMultiSelect] = useState(false);

  const handleCharacterClick = (characterId: string) => {
    if (multiSelect) {
      if (selectedCharacters.includes(characterId)) {
        onSelectionChange(
          selectedCharacters.filter((id) => id !== characterId),
        );
      } else {
        onSelectionChange([...selectedCharacters, characterId]);
      }
    } else {
      if (
        selectedCharacters.length === 1 &&
        selectedCharacters[0] === characterId
      ) {
        onSelectionChange([]);
      } else {
        onSelectionChange([characterId]);
      }
    }
  };

  return (
    <div className="mt-6 border-t border-border/60 pt-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Characters
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        Character ranks are only tracked when you select a single character with
        no other filters or move range applied.
      </p>
      <div className="mb-4 flex items-center gap-3">
        <Switch
          id={multiSelectId}
          checked={multiSelect}
          onCheckedChange={setMultiSelect}
        />
        <Label htmlFor={multiSelectId} className="flex cursor-pointer flex-col">
          <span>Multi-select</span>
          <span className="text-xs font-normal text-muted-foreground">
            Select multiple characters at once
          </span>
        </Label>
      </div>
      <ul className="grid grid-cols-5 gap-1 xs:grid-cols-6 sm:grid-cols-8">
        {characterInfoT8List.map(({ id: characterId, displayName }) => {
          const imgSrc = t8AvatarBrandMap[characterId];
          const isSelected = selectedCharacters.includes(characterId);
          return (
            <li key={characterId}>
              <button
                type="button"
                onClick={() => handleCharacterClick(characterId)}
                aria-pressed={isSelected}
                aria-label={displayName}
                className={cx(
                  'flex w-full flex-col items-center rounded p-0.5 transition-opacity hover:opacity-90',
                  isSelected &&
                    'ring-2 ring-primary ring-offset-1 ring-offset-background',
                )}
              >
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt=""
                    className="aspect-square w-full rounded object-contain"
                  />
                )}
                <span className="mt-0.5 w-full truncate text-center text-[10px] leading-tight">
                  {displayName}
                </span>
                <img
                  src={characterRankImages?.[characterId]}
                  alt="Rank badge"
                  className={cx(
                    'mt-0.5 h-7 w-auto transition-opacity',
                    !charStatsLoaded && 'opacity-0',
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
