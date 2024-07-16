import { useEffect, useState } from 'react'
import {
  type FlashCardAppState,
  flashCardAppStateSchema,
} from '~/features/flashCards/FlashCardAppState'

export const useFlashCardAppState = (): [
  FlashCardAppState,
  (newAppState: FlashCardAppState) => void,
] => {
  const [appState, setAppState] = useState<FlashCardAppState>({})

  useEffect(() => {
    const storedAppState = localStorage.getItem('t8_flashCardsAppState')
    if (storedAppState) {
      try {
        const parsedState = JSON.parse(storedAppState)
        const appState = flashCardAppStateSchema.parse(parsedState)
        setAppState(appState)
      } catch (e) {
        console.warn('can not parse flashCardAppState', e)
      }
    }
  }, [])

  return [
    appState,
    (newAppState: FlashCardAppState) => {
      localStorage.setItem('t8_flashCardsAppState', JSON.stringify(newAppState))
      setAppState(newAppState)
    },
  ]
}
