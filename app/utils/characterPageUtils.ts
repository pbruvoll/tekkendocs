import {
  type CharacterPageData,
  type CharacterPageFrameData,
} from '~/types/CharacterPageData';
import { type Move } from '~/types/Move';
import { type RouteHandle } from '~/types/RouteHandle';
import { type TableData } from '~/types/TableData';

export const getCharacterPageData = (
  matches: { loaderData?: unknown; handle?: unknown }[],
): CharacterPageData | undefined => {
  const frameData = matches.find(
    (m) => (m.handle as RouteHandle)?.type === 'frameData',
  )?.loaderData;
  return frameData ? (frameData as CharacterPageData) : undefined;
};

export const getCharacterFrameData = (
  matches: { loaderData?: unknown; handle?: unknown }[],
): TableData | undefined => {
  const characterPageData = getCharacterPageData(matches);
  const frameDataTable = characterPageData?.tables.find(
    (t) => t.name === 'frames_normal',
  );
  return frameDataTable;
};

export const getCharacterFrameDataMoves = (
  matches: { loaderData?: unknown; handle?: unknown }[],
): Move[] | undefined => {
  const frameData = matches.find(
    (m) => (m.handle as RouteHandle)?.type === 'frameData',
  )?.loaderData;
  return frameData ? (frameData as CharacterPageFrameData).moves : undefined;
};
