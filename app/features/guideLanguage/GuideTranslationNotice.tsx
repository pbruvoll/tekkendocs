import { Languages } from 'lucide-react';
import { type GuideLanguage } from './guideLanguage';

/** Written in the language of the guide, so readers of that guide understand it */
const notices: Record<Exclude<GuideLanguage, 'en'>, string> = {
  ko: '이 공략은 자동 번역되었으며 정확하지 않을 수 있습니다.',
  ja: 'このガイドは自動翻訳されたもので、内容が正確でない場合があります。',
  es: 'Esta guía fue traducida automáticamente y puede no ser precisa.',
  ur: 'یہ گائیڈ خودکار طور پر ترجمہ کی گئی ہے اور ہو سکتا ہے کہ درست نہ ہو۔',
};

export type GuideTranslationNoticeProps = {
  language: GuideLanguage;
};

/** Tells readers that a translated guide is machine translated. Renders nothing for english */
export const GuideTranslationNotice = ({
  language,
}: GuideTranslationNoticeProps) => {
  if (language === 'en') {
    return null;
  }
  return (
    <p className="mt-4 flex w-fit items-center gap-3 rounded-md border border-primary/40 bg-primary/15 px-4 py-3 text-sm">
      <Languages aria-hidden className="size-5 shrink-0 text-primary" />
      {notices[language]}
    </p>
  );
};
