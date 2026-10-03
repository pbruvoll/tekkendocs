export const guideLanguages = ['en', 'ko'] as const;

export type GuideLanguage = (typeof guideLanguages)[number];

export const defaultGuideLanguage: GuideLanguage = 'en';

/** Query param used to pick guide language, for example /t8/dragunov/guide?lang=ko */
export const guideLanguageParam = 'lang';

export const parseGuideLanguage = (value: string | null): GuideLanguage => {
  const language = value?.toLowerCase();
  return guideLanguages.includes(language as GuideLanguage)
    ? (language as GuideLanguage)
    : defaultGuideLanguage;
};
