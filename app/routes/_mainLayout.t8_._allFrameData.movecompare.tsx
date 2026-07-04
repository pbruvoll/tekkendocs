import { useMemo } from 'react';
import {
  type MetaFunction,
  useRouteLoaderData,
  useSearchParams,
} from 'react-router';
import { ContentContainer } from '~/components/ContentContainer';
import {
  getCharacterDisplayName,
  getMoveId,
} from '~/features/frameQuiz/moveSelection';
import { MoveComparison } from '~/features/moveCompare/MoveComparison';
import { MovePicker } from '~/features/moveCompare/MovePicker';
import { charIdFromMove } from '~/utils/moveUtils';
import { generateMetaTags } from '~/utils/seoUtils';
import { type LoaderData } from './_mainLayout.t8_._allFrameData';

const moveAParamKey = 'moveA';
const moveBParamKey = 'moveB';

/** Build a "Kazuya df+2" style label from a wavu move id without frame data */
const moveIdToLabel = (moveId: string | null): string | null => {
  if (!moveId) {
    return null;
  }
  const separatorIndex = moveId.lastIndexOf('-');
  if (separatorIndex <= 0) {
    return null;
  }
  const charId = charIdFromMove({ wavuId: moveId });
  return `${getCharacterDisplayName(charId)} ${moveId.slice(separatorIndex + 1)}`;
};

export const meta: MetaFunction = ({ matches, location }) => {
  const searchParams = new URLSearchParams(location.search);
  const labelA = moveIdToLabel(searchParams.get(moveAParamKey));
  const labelB = moveIdToLabel(searchParams.get(moveBParamKey));
  const title =
    labelA && labelB
      ? `${labelA} vs ${labelB} | TekkenDocs`
      : 'Tekken 8 Move Comparison | TekkenDocs';

  return generateMetaTags({
    matches,
    title,
    description:
      'Compare two Tekken 8 moves side by side: video, startup, block and hit frames, damage, hit level and more.',
    image: { url: '/images/tekkendocs-og-image-v2.png' },
    url: '/t8/movecompare',
  });
};

export default function MoveCompare() {
  const { moves } = useRouteLoaderData<LoaderData>(
    'routes/_mainLayout.t8_._allFrameData',
  ) || { moves: [] };
  const [searchParams, setSearchParams] = useSearchParams();

  const moveById = useMemo(
    () => new Map(moves.map((move) => [getMoveId(move), move])),
    [moves],
  );

  const moveA = moveById.get(searchParams.get(moveAParamKey) ?? '') ?? null;
  const moveB = moveById.get(searchParams.get(moveBParamKey) ?? '') ?? null;

  const handleSelect = (paramKey: string) => (moveId: string | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (moveId) {
          next.set(paramKey, moveId);
        } else {
          next.delete(paramKey);
        }
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  return (
    <ContentContainer
      enableBottomPadding
      enableTopPadding
      className="max-w-4xl"
    >
      <h1 className="mb-2 mt-2 text-center text-2xl font-semibold tracking-tight">
        Move Comparison
      </h1>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Pick two moves, even from different characters, and compare them side by
        side.
      </p>
      {moveA && moveB ? (
        <div className="mt-6">
          <MoveComparison
            moveA={moveA}
            moveB={moveB}
            onClearMoveA={() => handleSelect(moveAParamKey)(null)}
            onClearMoveB={() => handleSelect(moveBParamKey)(null)}
          />
        </div>
      ) : (
        <>
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <MovePicker
              label="Move 1"
              moves={moves}
              selectedMove={moveA}
              onSelect={handleSelect(moveAParamKey)}
            />
            <MovePicker
              label="Move 2"
              moves={moves}
              selectedMove={moveB}
              onSelect={handleSelect(moveBParamKey)}
            />
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Select two moves to see the comparison.
          </p>
        </>
      )}
    </ContentContainer>
  );
}
