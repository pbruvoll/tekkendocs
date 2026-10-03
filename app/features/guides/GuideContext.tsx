import { createContext, use } from 'react';
import { type GuideTexts } from '~/features/guideLanguage/texts/guideTexts';
import { type Move } from '~/types/Move';

type GuideContextValue = {
  charUrl: string;
  compressedCommandMap: Record<string, Move>;
  /** Static texts in the language the guide is served in */
  texts: GuideTexts;
};

export const GuideContext = createContext<GuideContextValue | undefined>(
  undefined,
);

export const useGuideContext = (): GuideContextValue => {
  const context = use(GuideContext);
  if (!context) {
    throw new Error('useGuideContext was used without a context provider');
  }
  return context;
};
