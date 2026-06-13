import cx from 'classix';
import { Link, useSearchParams } from 'react-router';
import { type FrameDataListProps } from '~/types/FrameDataListProps';
import { type MoveT8 } from '~/types/Move';
import { getRecoveryFrames } from '~/utils/frameDataUtils';
import {
  getBlockFrameColorClasses,
  getHitFrameColorClasses,
  simplifyFrameValue,
} from '~/utils/frameDataViewUtils';
import {
  charIdFromMove,
  commandToUrlSegmentEncoded,
  videoFileNameFromMove,
} from '~/utils/moveUtils';
import { MovePreviewDialogButton } from './MovePreviewDialogButton';

// Helper function to format command for line breaks at commas
const formatWordWithBreaks = (command: string) => {
  return command.split(',').map((part, index, array) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: Static list
    <span key={index} className="inline-block">
      {part}
      {index < array.length - 1 && (
        <>
          ,<wbr />
        </>
      )}
    </span>
  ));
};

type SimpleMovesTableProps = FrameDataListProps;

export function SimpleMovesTable({
  gameRouteId,
  charId,
  moves,
  stickyHeader = true,
  forceShowCharacter,
  className,
  sortSettings,
}: SimpleMovesTableProps) {
  const showCharacter = forceShowCharacter || !charId;
  const showVidoeFileName = useSearchParams()[0].get('videoName') !== null;
  return (
    <table className={cx('relative w-full text-sm', className)}>
      <thead className="[&_tr]:border-b">
        <tr className="border-b transition-colors hover:bg-muted/50">
          <th
            className={cx(
              'h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4',
              stickyHeader && 'sticky top-header-height z-10',
            )}
          >
            Cmd
          </th>
          <th
            className={cx(
              'h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4',
              stickyHeader && 'sticky top-header-height z-10',
            )}
          >
            Hit Lvl
          </th>
          <th
            className={cx(
              'h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4',
              stickyHeader && 'sticky top-header-height z-10',
            )}
          >
            Start
            <wbr />
            up
          </th>
          <th
            className={cx(
              'h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4',
              stickyHeader && 'sticky top-header-height z-10',
            )}
          >
            Blo
            <wbr />
            ck
          </th>
          <th
            className={cx(
              'h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4',
              stickyHeader && 'sticky top-header-height z-10',
            )}
          >
            {showVidoeFileName ? (
              'Vid name'
            ) : sortSettings?.sortByKey === 'recovery' ? (
              <>
                Reco
                <wbr />
                very
              </>
            ) : (
              'Hit / CH'
            )}
          </th>
        </tr>
      </thead>
      <tbody className="[&_tr:last-child]:border-0">
        {moves.map((move, index) => {
          const simpleBlock = simplifyFrameValue(move.block || '');
          const simpleHit = simplifyFrameValue(move.hit || '');
          const simpleCh = simplifyFrameValue(move.counterHit || '');
          const hasVideo = Boolean(move.ytVideo || move.video);
          const computedCharId = charId || charIdFromMove(move as MoveT8);
          const moveUrl = `/${gameRouteId}/${computedCharId}/${commandToUrlSegmentEncoded(move.command)}`;
          const commandContent = formatWordWithBreaks(move.command);
          return (
            <tr
              key={move.moveNumber}
              className={`border-b transition-colors hover:bg-muted/50 ${
                index % 2 === 0 ? 'bg-muted/40' : 'bg-transparent'
              }`}
            >
              <td className="p-2 align-middle sm:p-4">
                <span className="inline-flex items-center gap-2 text-primary">
                  {showCharacter && (
                    <span className="text-muted-foreground">
                      {computedCharId}{' '}
                    </span>
                  )}
                  <Link style={{ textDecoration: 'none' }} to={moveUrl}>
                    {commandContent}
                  </Link>
                  {hasVideo && (
                    <MovePreviewDialogButton move={move} url={moveUrl} />
                  )}
                </span>
              </td>
              <td className="p-2 align-middle sm:p-4">
                {formatWordWithBreaks(move.hitLevel)}
              </td>
              <td className="wrap-break-word p-2 align-middle sm:p-4">
                {simplifyFrameValue(move.startup || '')}
              </td>
              <td
                className={cx(
                  'wrap-break-word p-2 align-middle sm:p-4',
                  getBlockFrameColorClasses(simpleBlock),
                )}
              >
                {simpleBlock}
              </td>
              <td className="wrap-break-word p-2 align-middle sm:p-4">
                {showVidoeFileName ? (
                  videoFileNameFromMove(move as MoveT8).replace(
                    `${charId}-`,
                    '',
                  )
                ) : sortSettings?.sortByKey === 'recovery' ? (
                  getRecoveryFrames(move)
                ) : (
                  <>
                    <span className={getHitFrameColorClasses(simpleHit)}>
                      {simpleHit}
                    </span>

                    {move.counterHit && move.counterHit !== move.hit && (
                      <span className="text-muted-foreground">
                        {' '}
                        / {simpleCh}
                      </span>
                    )}
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
