import { VideoIcon } from '@radix-ui/react-icons';
import cx from 'classix';
import { Link } from 'react-router';
import { type Move, type MoveT8 } from '~/types/Move';
import { charIdFromMove, commandToUrlSegmentEncoded } from '~/utils/moveUtils';
import { MovePreviewDialogButton } from './MovePreviewDialogButton';

// Helper function to format command for line breaks at commas
const formatWordWithBreaks = (command: string) => {
  return command.split(',').map((part, index, array) => (
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

// function which extract just the number from frame data, eg "i15~16, i30~32,i31~32" => "i15"
const simplifyFrameValue = (frameData: string) => {
  return frameData.match(/i?[+-]?\d+/)?.[0] || '';
};

type SimpleMovesTableProps = {
  gameRouteId: string;
  charId?: string;
  moves: Move[];
  forceShowCharacter?: boolean;
  className?: string;
};

export function SimpleMovesTable({
  gameRouteId,
  charId,
  moves,
  forceShowCharacter,
  className,
}: SimpleMovesTableProps) {
  const showCharacter = forceShowCharacter || !charId;
  return (
    <table className={cx('relative w-full text-sm', className)}>
      <thead className="[&_tr]:border-b">
        <tr className="border-b transition-colors hover:bg-muted/50">
          <th className="sticky top-0 z-10 h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4">
            Cmd
          </th>
          <th className="sticky top-0 z-10 h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4">
            Hit Lvl
          </th>
          <th className="sticky top-0 z-10 h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4">
            Start
            <wbr />
            up
          </th>
          <th className="sticky top-0 z-10 h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4">
            Blo
            <wbr />
            ck
          </th>
          <th className="sticky top-0 z-10 h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4">
            Hit / CH
          </th>
        </tr>
      </thead>
      <tbody className="[&_tr:last-child]:border-0">
        {moves.map((move, index) => {
          const simpleBlock = simplifyFrameValue(move.block || '');
          const blockValue = Number(simpleBlock);
          const simpleHit = simplifyFrameValue(move.hit || '');
          const simpleCh = simplifyFrameValue(move.counterHit || '');
          const computedCharId = charId || charIdFromMove(move as MoveT8);
          const moveUrl = `/${gameRouteId}/${computedCharId}/${commandToUrlSegmentEncoded(move.command)}`;
          return (
            <tr
              key={move.moveNumber}
              className={`border-b transition-colors hover:bg-muted/50 ${
                index % 2 === 0 ? 'bg-muted/40' : 'bg-transparent'
              }`}
            >
              <td className="p-2 align-middle sm:p-4">
                <span className="inline-flex items-center gap-2 text-text-primary">
                  {showCharacter && (
                    <span className="text-muted-foreground">
                      {computedCharId}{' '}
                    </span>
                  )}
                  <Link style={{ textDecoration: 'none' }} to={moveUrl}>
                    {formatWordWithBreaks(move.command)}
                  </Link>
                  {move.ytVideo && (
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
                  blockValue <= -10 && 'text-text-destructive',
                  blockValue > 0 && 'text-text-success',
                )}
              >
                {simpleBlock}
              </td>
              <td className="wrap-break-word p-2 align-middle sm:p-4">
                {simpleHit}
                {move.counterHit && move.counterHit !== move.hit && (
                  <span className="text-muted-foreground"> / {simpleCh}</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
