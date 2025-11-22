import { create } from 'zustand'

export type FrameDataViewMode = 'default' | 'simple'
export type UserSettings = {
  frameDataViewMode: FrameDataViewMode,
  setFrameDataViewMode: (frameDataViewMode: FrameDataViewMode) => void,
}

export const useUserSettings = create<UserSettings>((set) => ({
  frameDataViewMode: 'default',
  setFrameDataViewMode: (frameDataViewMode: FrameDataViewMode) => set({ frameDataViewMode }),
}))