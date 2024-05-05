import { useEffect, useState } from 'react'
import { type AppState, appStateSchema } from '~/types/AppState'

export const useAppState = (): [AppState, (newAppState: AppState) => void] => {
  const [appState, setAppState] = useState<AppState>({
    reactChallenge: {
      completedLowBlocks: [],
    },
  })

  useEffect(() => {
    const storedAppState = localStorage.getItem('appState')
    if (storedAppState) {
      try {
        const parsedState = JSON.parse(storedAppState)
        const appState = appStateSchema.parse(parsedState)
        setAppState(appState)
      } catch (e) {
        console.warn('can not parse appState', e)
      }
    }
  }, [])

  return [
    appState,
    (newAppState: AppState) => {
      localStorage.setItem('appState', JSON.stringify(newAppState))
      setAppState(newAppState)
    },
  ]
}
