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
import {
  matchCharacters,
  parseCharacterMoveQuery,
  searchMoves,
} from '~/features/moveSearch/moveSearch';
import { useSearchParamState } from '~/hooks/useSearchParamState';
import { getTekken8Characters } from '~/services/staticDataService';
import { type CharacterFrameDataPage } from '~/types/CharacterFrameDataPage';
import { type GameRouteId } from '~/types/GameRouteId';
import { commandInputProps } from '~/utils/commandUtils';
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

  const { characterQuery, moveQuery } = useMemo(
    () => parseCharacterMoveQuery(searchQuery),
    [searchQuery],
  );

  const navigate = useNavigate();

  const charList = getTekken8Characters();

  const filteredCharList =
    characterQuery === '?'
      ? charList.filter((char) => char.id === 'mokujin')
      : matchCharacters(charList, characterQuery);

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
      return searchMoves(data.moves, moveQuery);
    }
    return [];
  }, [data, filteredCharList.length, moveQuery, selectedCharId]);

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
      if (characterQuery && !moveQuery.trim()) {
        if (filteredCharList.length > 0) {
          navigate(`/${gameRouteId}/${filteredCharList[0].id}`);
        }
        return;
      }
      if (moveQuery.trim() && paginatedMoves.length > 0) {
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
