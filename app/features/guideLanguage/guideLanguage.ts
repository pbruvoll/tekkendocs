export const guideLanguages = ['en', 'ko', 'ja', 'es', 'ur'] as const;

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

const rtlGuideLanguages: readonly GuideLanguage[] = ['ur'];

/** Text direction of a guide language. Undefined means the page default (ltr) */
export const getGuideLanguageDir = (language: GuideLanguage) =>
  rtlGuideLanguages.includes(language) ? 'rtl' : undefined;
