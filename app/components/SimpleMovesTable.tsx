import { VideoIcon } from '@radix-ui/react-icons'
import { Link } from 'react-router'
import cx from 'classix'
import { type Move, type MoveT8 } from '~/types/Move'
import { charIdFromMove, commandToUrlSegmentEncoded } from '~/utils/moveUtils'

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
  ))
}

// function which extract just the number from frame data, eg "i15~16, i30~32,i31~32" => "i15"
const simplifyFrameValue = (frameData: string) => {
  return frameData.match(/i?[+-]?\d+/)?.[0] || ''
}

interface SimpleMovesTableProps {
  moves: Move[]
  selectedCharId: string
  showsMultipleChars: boolean
  includeCharNameInFrames: boolean
}

export function SimpleMovesTable({
  moves,
  selectedCharId,
  showsMultipleChars,
  includeCharNameInFrames,
}: SimpleMovesTableProps) {
  return (
    <table className="relative w-full text-sm">
      <thead className="[&_tr]:border-b">
        <tr className="border-b transition-colors hover:bg-muted/50">
          <th className="sticky top-0 z-10 h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4">
            Cmd
          </th>
          <th className="sticky top-0 z-10 h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4">
            Hit Lvl
          </th>
          <th className="sticky top-0 z-10 h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4">
            Startup
          </th>
          <th className="sticky top-0 z-10 h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4">
            Block
          </th>
          <th className="sticky top-0 z-10 h-12 bg-background px-2 text-left align-middle font-medium text-muted-foreground sm:px-4">
            Hit / CH
          </th>
        </tr>
      </thead>
      <tbody className="[&_tr:last-child]:border-0">
        {moves.map((move, index) => {
          const simpleBlock = simplifyFrameValue(move.block || '')
          const blockValue = Number(simpleBlock)
          const simpleHit = simplifyFrameValue(move.hit || '')
          const simpleCh = simplifyFrameValue(move.counterHit || '')
          return (
            <tr
              key={move.moveNumber}
              className={`border-b transition-colors hover:bg-muted/50 ${
                index % 2 === 0 ? 'bg-muted/40' : 'bg-transparent'
              }`}
            >
              <td className="p-2 align-middle sm:p-4">
                <Link
                  className="inline-flex flex-wrap items-center gap-2 text-primary hover:underline"
                  to={`/t8/${
                    showsMultipleChars
                      ? charIdFromMove(move as MoveT8)
                      : selectedCharId
                  }/${commandToUrlSegmentEncoded(move.command)}`}
                >
                  {includeCharNameInFrames && (
                    <span className="text-muted-foreground">
                      {showsMultipleChars
                        ? charIdFromMove(move as MoveT8)
                        : selectedCharId}{' '}
                    </span>
                  )}
                  <span className="break-words">
                    {formatWordWithBreaks(move.command)}
                  </span>
                  {(move.video || move.ytVideo) && <VideoIcon />}
                </Link>
              </td>
              <td className="p-2 align-middle sm:p-4">
                {formatWordWithBreaks(move.hitLevel)}
              </td>
              <td className="break-words p-2 align-middle sm:p-4">
                {simplifyFrameValue(move.startup || '')}
              </td>
              <td
                className={cx(
                  'break-words p-2 align-middle sm:p-4',
                  blockValue <= -10 && 'text-text-destructive',
                  blockValue > 0 && 'text-text-success',
                )}
              >
                {simpleBlock}
              </td>
              <td className="break-words p-2 align-middle sm:p-4">
                {simpleHit}
                {move.counterHit && move.counterHit !== move.hit && (
                  <span className="text-muted-foreground"> / {simpleCh}</span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
