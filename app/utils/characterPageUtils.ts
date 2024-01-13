import { type CharacterPageData } from '~/types/CharacterPageData'
import { type RouteHandle } from '~/types/RouteHandle'
import { type TableData } from '~/types/TableData'

export const getCharacterPageData = (
  matches: { data?: unknown; handle?: unknown }[],
): CharacterPageData | undefined => {
  const frameData = matches.find(
    m => (m.handle as RouteHandle)?.type === 'frameData',
  )?.data
  return frameData ? (frameData as CharacterPageData) : undefined
}

export const getCharacterFrameData = (
  matches: { data?: unknown; handle?: unknown }[],
): TableData | undefined => {
  const characterPageData = getCharacterPageData(matches)
  const frameDataTable = characterPageData?.tables.find(
    t => t.name === 'frames_normal',
  )
  return frameDataTable
}
