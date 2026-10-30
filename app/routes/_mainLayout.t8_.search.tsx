import { useDeferredValue, useEffect, useMemo } from 'react';
import {
  Link,
  type MetaFunction,
  useFetcher,
  useNavigate,
  useSearchParams,
} from 'react-router';
import { ContentContainer } from '~/components/ContentContainer';
import { Input } from '~/components/ui/input';
import { filterKey } from '~/constants/filterConstants';
import { CompactMoveList } from '~/features/compactMoveList/CompactMoveList';
import { useSearchParamState } from '~/hooks/useSearchParamState';
import { getTekken8Characters } from '~/services/staticDataService';
import { type CharacterFrameDataPage } from '~/types/CharacterFrameDataPage';
import { type GameRouteId } from '~/types/GameRouteId';
import { type Move } from '~/types/Move';
import { commandInputProps } from '~/utils/commandUtils';
import { cleanCommand } from '~/utils/filterUtils';
import { sortMovesV2 } from '~/utils/frameDataUtils';
import { commandToUrlSegmentEncoded } from '~/utils/moveUtils';
import { generateMetaTags } from '~/utils/seoUtils';
import { getSortSettings } from '~/utils/sortingUtils';

export const meta: MetaFunction = ({ matches }) => {
  const title = 'Tekken 8 Frame data search page | TekkenDocs';
  const description = `Search for any move in the game to see its's frame data. Exampel: "Drag fff2"`;

  return generateMetaTags({
    matches,
    title,
    description,
    image: { url: '/images/tekkendocs-og-image-v3.jpg' },
    url: `/t8/search`,
  });
};

const maxMovesToShow = 400;
const gameRouteId: GameRouteId = 't8';

export default function () {
  const [searchInput, setSearchInput] = useSearchParamState(filterKey.Query);
  // Derive the results from a deferred value so typing stays responsive
  // while filtering and rendering the move table lags behind
  const searchQuery = useDeferredValue(searchInput);

  const [characterQuery, moveQuery] = useMemo(() => {
    if (!searchQuery) {
      return ['', ''];
    }
    const splitted = searchQuery.split(' ');
    if (splitted.length === 1) {
      return [searchQuery.toLowerCase(), ''];
    }
    if (splitted.length === 2) {
      return [splitted[0].toLowerCase(), splitted[1].toLowerCase()];
    }
    return [
      splitted[0].toLowerCase(),
      splitted.slice(1).join('').toLowerCase(),
    ];
  }, [searchQuery]);

  const navigate = useNavigate();

  const charList = getTekken8Characters();

  const filteredCharList =
    characterQuery === '?'
      ? charList.filter((char) => char.id === 'mokujin')
      : charList.filter((char) =>
          char.id
            .replace('-', '')
            .replace(' ', '')
            .toLowerCase()
            .startsWith(characterQuery.replace('-', '')),
        );

  const selectedCharacter =
    filteredCharList.length === 1 ? filteredCharList[0] : undefined;
  const selectedCharId = useMemo(() => {
    return selectedCharacter?.id;
  }, [selectedCharacter?.id]);

  const showsMultipleChars = selectedCharId === 'mokujin';

  const includeCharNameInFrames = useMemo(
    () => showsMultipleChars || (!moveQuery && !searchQuery.endsWith(' ')),
    [moveQuery, searchQuery, showsMultipleChars],
  );

  const { load, state, data } = useFetcher<CharacterFrameDataPage>({
    key: selectedCharId,
  });

  const filteredMoves = useMemo(() => {
    if (
      filteredCharList.length === 1 &&
      data &&
      data.characterName === selectedCharId
    ) {
      const cleanMoveQuery = cleanCommand(moveQuery);

      let filteredByCommand: Move[] = [];
      if (cleanMoveQuery.includes('?')) {
        // filter by wildcard, so "1?2", matches "1,2,3".
        // we use ? as wildcard instead of *, since som move have * in them (it means hold button)
        const w = cleanMoveQuery.replace(/[*.+^${}()|[\]\\]/g, '\\$&'); // regexp escape
        const re = new RegExp(
          `^${w.replace(/\?/g, '.*')}${searchQuery.endsWith(' ') ? '' : '.*'}$`,
        );
        filteredByCommand = data.moves.filter((move) => re.test(move.command));
      } else if (cleanMoveQuery && searchQuery.endsWith(' ')) {
        filteredByCommand = data.moves.filter(
          (move) => cleanCommand(move.command) === cleanMoveQuery,
        );
      } else {
        filteredByCommand = data.moves.filter((move) =>
          cleanCommand(move.command).startsWith(cleanMoveQuery),
        );
      }
      if (filteredByCommand.length > 0) {
        return filteredByCommand;
      }
      if (moveQuery.length > 2) {
        const filteredByName = data.moves.filter((move) =>
          move.name
            ?.toLowerCase()
            .replace(' ', '')
            .includes(moveQuery.toLowerCase()),
        );
        if (filteredByName.length > 0) {
          return filteredByName;
        }
      }
      return [];
    }
    return [];
  }, [data, filteredCharList.length, moveQuery, searchQuery, selectedCharId]);

  // The compact list's column headers sort through the url
  const [searchParams] = useSearchParams();
  const sortSettings = useMemo(
    () => getSortSettings(searchParams),
    [searchParams],
  );
  const sortedMoves = useMemo(
    () => sortMovesV2(filteredMoves, sortSettings),
    [filteredMoves, sortSettings],
  );

  const paginatedMoves = useMemo(() => {
    if (sortedMoves.length > maxMovesToShow) {
      return sortedMoves.slice(0, maxMovesToShow);
    }
    return sortedMoves;
  }, [sortedMoves]);

  useEffect(() => {
    if (
      selectedCharId &&
      state === 'idle' &&
      data?.characterName !== selectedCharId
    ) {
      load(`/${gameRouteId}/${selectedCharId}`);
    }
  }, [selectedCharId, state, load, data?.characterName]);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (characterQuery && !moveQuery) {
        navigate(`/${gameRouteId}/${filteredCharList[0].id}`);
        return;
      }
      if (moveQuery && paginatedMoves.length > 0) {
        navigate(
          `/${gameRouteId}/${selectedCharId}/${commandToUrlSegmentEncoded(paginatedMoves[0].command)}`,
        );
      }
    }
  };

  return (
    <ContentContainer enableBottomPadding enableTopPadding className="min-h-96">
      <h1 className="pb-2 text-2xl">Search</h1>
      <p className="py-2">Enter a character, followed by a command</p>
      <Input
        value={searchInput}
        onChange={(e) => handleOnChange(e)}
        onKeyDown={handleOnKeyDown}
        placeholder="drag fff2"
        className="mb-4"
        autoFocus
        {...commandInputProps}
      ></Input>
      {filteredCharList.length === 0 && (
        <div>No characters matches the search query</div>
      )}
      {filteredCharList.length > 1 && (
        <ul>
          {filteredCharList.map((char) => (
            <li key={char.id}>
              <Link
                className="text-primary capitalize no-underline"
                to={`/t8/${char.id}`}
              >
                {char.displayName}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {selectedCharId && state === 'idle' && filteredMoves.length === 0 && (
        <div>
          No moves for {selectedCharacter?.displayName} matches the query
        </div>
      )}

      {selectedCharId && state !== 'idle' && <div>Loading...</div>}
      {paginatedMoves.length > 0 && selectedCharId && (
        // cancel the list's own side padding, so it lines up with the input
        <div className="-mx-2 sm:-mx-4">
          <CompactMoveList
            gameRouteId={gameRouteId}
            charId={showsMultipleChars ? undefined : selectedCharId}
            moves={paginatedMoves}
            forceShowCharacter={includeCharNameInFrames}
          />
        </div>
      )}

      {paginatedMoves.length < filteredMoves.length && (
        <p className="my-2">
          Showing {paginatedMoves.length} of {filteredMoves.length}
        </p>
      )}
    </ContentContainer>
  );
}
