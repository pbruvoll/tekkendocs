import invariant from "tiny-invariant";
import { type Move } from "~/types/Move";
import { type TableData } from "~/types/TableData";

export const frameDataTableToJson = (normalFrameData: TableData): Move[] => {
  invariant(normalFrameData.headers);
  invariant(normalFrameData.headers[0].localeCompare('command'));
  invariant(normalFrameData.headers[1].localeCompare('hit level'));
  invariant(normalFrameData.headers[2].localeCompare('damage'));
  invariant(normalFrameData.headers[3].localeCompare('start up frame'));
  invariant(normalFrameData.headers[4].localeCompare('block frame'));
  invariant(normalFrameData.headers[5].localeCompare('hit frame'));
  invariant(normalFrameData.headers[5].localeCompare('counter hit frame'));
  invariant(normalFrameData.headers[7].localeCompare('notes'));
  return normalFrameData.rows.map((row => {
    return {
      command: row[0],
      hitLevel: row[1],
      damage: row[2],
      startup: row[3],
      block: row[4],
      hit: row[5],
      counterHit: row[6],
      notes: row[7],
    }
  }))
}

export const isHomingMove = (move: Move) => {
  return move.notes?.match(/homing/i)
}

export const isTornadoMove = (move: Move) => {
  return move.notes?.match(/tornado/i);
}

export const isBalconyBreak = (move: Move) => {
  return move.notes?.match(/balcony break/i);
}