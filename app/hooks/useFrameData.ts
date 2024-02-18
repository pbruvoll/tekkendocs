import { json } from '@remix-run/node'
import { useMatches } from '@remix-run/react'
import { type CharacterFrameData } from '~/types/CharacterFrameData'
import { type RouteHandle } from '~/types/RouteHandle'

/** load frame data for active route */
export const useFrameData = (): CharacterFrameData => {
  const matches = useMatches()
  const frameData = matches.find(
    m => (m.handle as RouteHandle)?.type === 'frameData',
  )?.data
  if (!frameData) {
    throw json('Could not read frame data for current route')
  }
  return frameData as CharacterFrameData
}
