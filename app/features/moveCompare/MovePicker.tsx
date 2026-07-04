import { X } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { characterInfoT8List } from '~/constants/characterInfoListT8';
import {
  getCharacterDisplayName,
  getMoveId,
} from '~/features/frameQuiz/moveSelection';
import { type Move } from '~/types/Move';
import { cleanCommand } from '~/utils/filterUtils';
import { t8AvatarBrandMap } from '~/utils/t8AvatarMap';

const maxResults = 20;

type MovePickerProps = {
  label: string;
  moves: Move[];
  selectedMove: Move | null;
  onSelect: (moveId: string | null) => void;
};

export const MovePicker = ({
  label,
  moves,
  selectedMove,
  onSelect,
}: MovePickerProps) => {
  const [searchInput, setSearchInput] = useState('');
  // Derive the results from a deferred value so typing stays responsive
  // while filtering the move list lags behind
  const searchQuery = useDeferredValue(searchInput);

  const [characterQuery, moveQuery] = useMemo(() => {
    const trimmed = searchQuery.trimStart();
    const spaceIndex = trimmed.indexOf(' ');
    if (spaceIndex === -1) {
      return [trimmed.toLowerCase(), ''];
    }
    return [
      trimmed.slice(0, spaceIndex).toLowerCase(),
      trimmed
        .slice(spaceIndex + 1)
        .replace(/ /g, '')
        .toLowerCase(),
    ];
  }, [searchQuery]);

  const matchingCharacters = useMemo(() => {
    if (!characterQuery) {
      return [];
    }
    const normalizedQuery = characterQuery.replace(/-/g, '');
    return characterInfoT8List.filter(
      (char) =>
        char.id.replace(/-/g, '').startsWith(normalizedQuery) ||
        char.aliasList.includes(normalizedQuery),
    );
  }, [characterQuery]);

  const selectedCharacter =
    matchingCharacters.length === 1 ? matchingCharacters[0] : null;

  const matchingMoves = useMemo(() => {
    if (!selectedCharacter) {
      return [];
    }
    const characterMoves = moves.filter(
      (move) => move.characterId === selectedCharacter.id,
    );
    const cleanMoveQuery = cleanCommand(moveQuery);
    const filteredByCommand = characterMoves.filter((move) =>
      cleanCommand(move.command).startsWith(cleanMoveQuery),
    );
    if (filteredByCommand.length > 0 || moveQuery.length <= 2) {
      return filteredByCommand;
    }
    return characterMoves.filter((move) =>
      move.name?.toLowerCase().replace(/ /g, '').includes(moveQuery),
    );
  }, [moves, selectedCharacter, moveQuery]);

  if (selectedMove) {
    const charId = selectedMove.characterId;
    return (
      <div className="rounded-xl border border-border/70 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="flex items-center gap-3">
          {charId && (
            <img
              src={t8AvatarBrandMap[charId]}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {charId ? `${getCharacterDisplayName(charId)}: ` : ''}
              {selectedMove.command}
            </p>
            {selectedMove.name && (
              <p className="truncate text-xs text-muted-foreground">
                {selectedMove.name}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label={`Clear ${label}`}
            onClick={() => onSelect(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <Input
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="drag fff2"
        aria-label={`Search move for ${label}`}
      />
      <div className="mt-2 max-h-72 overflow-y-auto">
        {!characterQuery && (
          <p className="p-2 text-sm text-muted-foreground">
            Type a character, followed by a command
          </p>
        )}
        {characterQuery && matchingCharacters.length === 0 && (
          <p className="p-2 text-sm text-muted-foreground">
            No characters matches the search query
          </p>
        )}
        {matchingCharacters.length > 1 && (
          <ul>
            {matchingCharacters.map((char) => (
              <li key={char.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-accent/40"
                  onClick={() => setSearchInput(`${char.id} `)}
                >
                  <img
                    src={t8AvatarBrandMap[char.id]}
                    alt=""
                    className="h-8 w-8 rounded"
                  />
                  <span>{char.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {selectedCharacter &&
          (matchingMoves.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">
              No moves for {selectedCharacter.displayName} matches the query
            </p>
          ) : (
            <>
              <ul>
                {matchingMoves.slice(0, maxResults).map((move) => (
                  <li key={getMoveId(move)}>
                    <button
                      type="button"
                      className="block w-full rounded-md p-2 text-left font-medium hover:bg-accent/40"
                      onClick={() => {
                        onSelect(getMoveId(move));
                        setSearchInput('');
                      }}
                    >
                      {move.command}
                    </button>
                  </li>
                ))}
              </ul>
              {matchingMoves.length > maxResults && (
                <p className="p-2 text-xs text-muted-foreground">
                  Showing {maxResults} of {matchingMoves.length} moves
                </p>
              )}
            </>
          ))}
      </div>
    </div>
  );
};
