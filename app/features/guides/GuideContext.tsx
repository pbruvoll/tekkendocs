import { createContext, useContext } from 'react'
import { type Move } from '~/types/Move'

type GuideContextValue = {
  charUrl: string
  compressedCommandMap: Record<string, Move>
}

export const GuideContext = createContext<GuideContextValue | undefined>(
  undefined,
)

export const useGuideContext = (): GuideContextValue => {
  const context = useContext(GuideContext)
  if (!context) {
    throw new Error('useGuideContext was used without a context provider')
  }
  return context
}
