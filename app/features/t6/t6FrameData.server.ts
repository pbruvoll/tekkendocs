import { data } from 'react-router';
import { parseCsv } from '~/features/guideLanguage/csvUtils.server';
import { ServerStatusCode } from '~/types/ServerStatusCode';
import { type TableDataWithHeader } from '~/types/TableData';
import { cachified } from '~/utils/cache.server';
import {
  sheetSectionToTable,
  sheetToSections,
} from '~/utils/sheetUtils.server';
import { removeEmptyColumns } from './removeEmptyColumns';
import { type T6Stance } from './T6Stance';
import { getT6Character, t6CdnUrl } from './t6Characters';

export type T6FrameData = {
  frames: TableDataWithHeader;
  /** The stances used as command prefix, e.g. MT for Muay Thai */
  stances: T6Stance[];
};

const fetchFrameDataCsv = async (characterId: string): Promise<string> => {
  const url = `${t6CdnUrl}/framedata/${characterId}.csv`;
  const response = await fetch(url);
  if (!response.ok) {
    throw data(`Not able to fetch frame data from ${url}`, {
      status: ServerStatusCode.ServerError,
    });
  }
  return response.text();
};

/** Fetches the frame data and stances for a T6 character from the cdn */
export const getT6FrameData = async (
  characterId: string,
): Promise<T6FrameData> => {
  if (!getT6Character(characterId)) {
    throw data(`There is no T6 character with id ${characterId}`, {
      status: ServerStatusCode.NotFound,
    });
  }

  const csv = await cachified({
    key: `${characterId}|_|T6`,
    ttl: 1000 * 60 * 5,
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 3,
    getFreshValue: () => fetchFrameDataCsv(characterId),
  });

  const sections = sheetToSections(parseCsv(csv));
  const framesSection = sections.find((s) => s.sectionId === 'frames_normal');
  if (!framesSection) {
    throw data(`No frame data found for ${characterId}`, {
      status: ServerStatusCode.ServerError,
    });
  }
  const frames = sheetSectionToTable({
    name: framesSection.sectionId,
    sheetSection: framesSection,
    hasHeader: true,
  }) as TableDataWithHeader;

  // the first row of the stances section is the header
  const stanceRows =
    sections.find((s) => s.sectionId === 'stances')?.rows.slice(1) || [];

  return {
    frames: removeEmptyColumns(frames),
    stances: stanceRows.map(([code, name]) => ({ code, name: name || '' })),
  };
};
